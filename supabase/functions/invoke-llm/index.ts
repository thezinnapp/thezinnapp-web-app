// POST { prompt, response_json_schema? } -> { result } or { error, status }
// Used by all 9 AI features. Only signed-in users may call it, with a daily cap.
//
// Long analyses (Thinking Report, daily journal) can take a minute or more, so once
// the checks pass the function answers immediately with status 200 and keeps the
// connection alive with spaces until Claude finishes, then sends the JSON result
// (leading spaces are valid JSON). Problems after that point arrive in the body
// as { error, status }; the app's base44Client turns them into normal errors.
import { adminClient, corsHeaders, getUser, json } from "../_shared/common.ts";
import { AIError, askClaude } from "../_shared/claude.ts";

const DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT") ?? "60");
// A month of journaling can be long; the daily cap is what limits cost.
const MAX_PROMPT_CHARS = 400_000;
// Supabase stops a function after 150 s on the Free plan (400 s on paid plans).
// Give up a little earlier so the person gets a clear message and billing stops.
// On the Pro plan, set the AI_TIME_BUDGET_MS secret to 390000.
const TIME_BUDGET_MS = Number(Deno.env.get("AI_TIME_BUDGET_MS") ?? "140000");
const KEEPALIVE_MS = 5_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return json(req, { error: "Please sign in again." }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid request." }, 400);
  }
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";
  if (!prompt.trim()) return json(req, { error: "Nothing to analyze." }, 400);
  if (prompt.length > MAX_PROMPT_CHARS) return json(req, { error: "This entry is too long to analyze." }, 413);

  const { data: calls, error: usageError } = await admin.rpc("increment_ai_usage", { p_user: user.id });
  if (usageError) {
    console.error("Usage counter failed:", usageError.message);
    return json(req, { error: "Please try again." }, 500);
  }
  if (calls > DAILY_LIMIT) {
    return json(req, { error: "You've reached today's AI limit. Please try again tomorrow." }, 429);
  }

  const encoder = new TextEncoder();
  const abort = new AbortController();
  // Stop Claude (and billing) if the person closes the page.
  req.signal?.addEventListener("abort", () => abort.abort());

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // connection already closed
        }
      };
      const keepAlive = setInterval(() => send(" "), KEEPALIVE_MS);
      const budget = setTimeout(() => abort.abort(), TIME_BUDGET_MS);
      try {
        const result = await askClaude(prompt, body.response_json_schema, { signal: abort.signal });
        send(JSON.stringify({ result }));
      } catch (error) {
        if (error instanceof AIError) {
          send(JSON.stringify({ error: error.message, status: error.status }));
        } else {
          console.error("Unexpected error:", error);
          send(JSON.stringify({ error: "Something went wrong. Please try again.", status: 500 }));
        }
      } finally {
        clearInterval(keepAlive);
        clearTimeout(budget);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});
