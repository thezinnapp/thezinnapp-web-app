// POST { content, language, languageName } -> { result: string }
// Translates AI results into the user's language (replaces Base44's translateJson).
// Translations have their own daily counter (they never use up the analysis limit)
// and are remembered per person, so the same text is never paid for twice.
import { adminClient, corsHeaders, getUser, json } from "../_shared/common.ts";
import { AIError, askClaude } from "../_shared/claude.ts";

const TRANSLATE_DAILY_LIMIT = Number(Deno.env.get("TRANSLATE_DAILY_LIMIT") ?? "400");
const MAX_CONTENT_CHARS = 60_000;
const LANGUAGE_CODE = /^[a-z]{2}$/;

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return json(req, { error: "Unauthorized" }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid request." }, 400);
  }
  const { content, language, languageName } = body ?? {};
  if (typeof content !== "string" || !content || content.length > MAX_CONTENT_CHARS) {
    return json(req, { error: "Invalid content." }, 400);
  }
  if (typeof language !== "string" || !LANGUAGE_CODE.test(language)) {
    return json(req, { error: "Invalid language." }, 400);
  }
  const name = typeof languageName === "string" ? languageName.slice(0, 40) : language;

  // Already translated this exact text for this person? Return it for free.
  const contentHash = await sha256Hex(content);
  const { data: cached } = await admin
    .from("translation_cache")
    .select("result")
    .eq("user_id", user.id)
    .eq("content_hash", contentHash)
    .eq("language", language)
    .maybeSingle();
  if (cached?.result) return json(req, { result: cached.result });

  const { data: calls, error: usageError } = await admin.rpc("increment_translate_usage", { p_user: user.id });
  if (usageError) {
    console.error("Translate counter failed:", usageError.message);
    return json(req, { error: "Please try again." }, 500);
  }
  if (calls > TRANSLATE_DAILY_LIMIT) return json(req, { error: "Daily translation limit reached." }, 429);

  // Same instructions as the original Base44 function.
  const prompt = `Translate ALL human-readable string values in this JSON to ${name} (${language}). Keep all keys identical. Keep the {type}, {count}, {level}, {month}, {title}, {s} placeholders intact.

IMPORTANT: Do NOT translate enum/status identifier values — leave these unchanged:
- risk_level values: "high", "medium", "low"
- type values: "shame", "guilt"
- category values: "pro-social", "anti-social"
- detected values: "true", "false" (or boolean)
- bias names (e.g., "Confirmation Bias", "Anchoring Bias") — leave the name as-is but translate any indicator/definition/recommendation text for that bias

Translate all other text content (indicator, definition, recommendation, strategy, addresses, steps, relevance, component, agreement, etc.).

Return ONLY a valid JSON object with the exact same structure, no markdown, no explanation:

${content}`;

  try {
    const result = await askClaude(prompt);
    // Only remember answers that are valid JSON, so a bad answer isn't reused.
    let valid = false;
    if (typeof result === "string") {
      try {
        JSON.parse(result.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());
        valid = true;
      } catch {
        valid = false;
      }
    }
    if (valid) {
      const { error: cacheError } = await admin
        .from("translation_cache")
        .upsert({ user_id: user.id, content_hash: contentHash, language, result });
      if (cacheError) console.error("Translation cache write failed:", cacheError.message);
    }
    return json(req, { result });
  } catch (error) {
    if (error instanceof AIError) return json(req, { error: error.message }, error.status);
    console.error("Unexpected error:", error);
    return json(req, { error: "Something went wrong." }, 500);
  }
});
