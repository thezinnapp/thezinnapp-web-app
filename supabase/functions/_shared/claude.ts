// Calls Claude for the app's AI features (replaces Base44's InvokeLLM).
import Anthropic from "npm:@anthropic-ai/sdk@0.135.0";

// Which Claude model answers. Haiku 5.5 is the fast, low-cost choice; to trade
// speed and cost for depth, set the AI_MODEL secret (for example
// "claude-sonnet-5-5" or "claude-opus-5-5") - no code change needed.
export const MODEL = Deno.env.get("AI_MODEL") || "claude-haiku-5-5";
// How much Claude thinks before answering ("low" is fastest).
const EFFORT = Deno.env.get("AI_EFFORT") || "low";
// Haiku can skip its thinking step before answering, which makes answers faster.
// Set the AI_THINKING secret to "on" to turn thinking back on. (Opus 5.5 and
// Sonnet 5.5 can't turn thinking off, so this only applies to Haiku.)
const THINKING_OFF = /haiku/.test(MODEL) && (Deno.env.get("AI_THINKING") || "off") === "off";
// Anthropic's safety-check fallback exists for Opus and Sonnet, not Haiku.
const SUPPORTS_FALLBACK = /opus|sonnet/.test(MODEL);
const MAX_OUTPUT_TOKENS = 32000;

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

export class AIError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

// Claude's structured outputs need every object closed (additionalProperties: false)
// and don't accept numeric/length limits. Base44 schemas don't have those rules,
// so convert them here. All fields are marked required so responses have the same
// shape Base44 returned.
const UNSUPPORTED = new Set([
  "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
  "minLength", "maxLength", "pattern", "minItems", "maxItems", "uniqueItems", "default",
]);

export function toStrictSchema(schema: any): any {
  if (Array.isArray(schema)) return schema.map(toStrictSchema);
  if (!schema || typeof schema !== "object") return schema;
  const out: any = {};
  for (const [key, value] of Object.entries(schema)) {
    if (UNSUPPORTED.has(key)) continue;
    if (key === "properties" && value && typeof value === "object") {
      out.properties = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toStrictSchema(v)]),
      );
    } else if (key === "items" || key === "anyOf" || key === "allOf") {
      out[key] = toStrictSchema(value);
    } else {
      out[key] = value;
    }
  }
  if (out.type === "object" || out.properties) {
    out.type = "object";
    out.properties = out.properties ?? {};
    out.additionalProperties = false;
    out.required = Object.keys(out.properties);
  }
  return out;
}

// Some answer formats (for example the Thinking Report's) are too detailed for
// Claude's strict-format mode, and Anthropic rejects them before any work is done
// (nothing is billed). For those, the format is written into the instructions
// instead and the answer is checked here.
const GRAMMAR_TOO_LARGE = /grammar is too large|schema is too (large|complex)/i;

function promptWithFormat(prompt: string, schema: unknown): string {
  return `${prompt}

Respond with only a JSON object (no markdown, no code fences, no other text) that matches this JSON Schema exactly. Fill in every field, and do not add fields that are not in the schema:
${JSON.stringify(toStrictSchema(schema))}`;
}

function parseJsonAnswer(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall back to the outermost {...} in case of stray words around the JSON.
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first !== -1 && last > first) return JSON.parse(trimmed.slice(first, last + 1));
    throw new SyntaxError("No JSON object found");
  }
}

async function streamMessage(
  prompt: string,
  outputConfig: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<any> {
  // Streaming keeps long analyses from timing out; finalMessage() collects the result.
  const stream = (anthropic.beta.messages as any).stream(
    {
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      // If a safety check declines the request, let Anthropic retry it on the
      // recommended fallback model instead of failing (Opus and Sonnet only).
      ...(SUPPORTS_FALLBACK ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {}),
      output_config: outputConfig,
      ...(THINKING_OFF ? { thinking: { type: "disabled" } } : {}),
      messages: [{ role: "user", content: prompt }],
    },
    { signal },
  );
  return await stream.finalMessage();
}

// Sends one prompt to Claude. With a schema, returns the parsed JSON object;
// without one, returns plain text (same behavior as Base44's InvokeLLM).
// `signal` stops the request (and its billing) when the caller gives up.
export async function askClaude(
  prompt: string,
  schema?: unknown,
  options: { signal?: AbortSignal } = {},
): Promise<unknown> {
  let formatInPrompt = false;
  let message: any;
  try {
    try {
      const outputConfig: Record<string, unknown> = { effort: EFFORT };
      if (schema) outputConfig.format = { type: "json_schema", schema: toStrictSchema(schema) };
      message = await streamMessage(prompt, outputConfig, options.signal);
    } catch (error) {
      if (!(schema && error instanceof Anthropic.BadRequestError && GRAMMAR_TOO_LARGE.test(error.message))) {
        throw error;
      }
      formatInPrompt = true;
      message = await streamMessage(promptWithFormat(prompt, schema), { effort: EFFORT }, options.signal);
    }
  } catch (error) {
    if (options.signal?.aborted || error instanceof Anthropic.APIUserAbortError) {
      throw new AIError("The analysis took too long. Please try again.", 504);
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new AIError("The AI is busy right now. Please try again in a minute.", 429);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Claude API key rejected");
      throw new AIError("The AI service is not configured correctly.", 500);
    }
    if (error instanceof Anthropic.BadRequestError && /credit balance|usage limits/i.test(error.message)) {
      console.error("Claude credits or spend limit reached:", error.message);
      throw new AIError("The AI is resting for now. Please try again later.", 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
      throw new AIError("The AI couldn't respond. Please try again.", 502);
    }
    throw error;
  }

  console.log(JSON.stringify({
    model: message.model,
    stop: message.stop_reason,
    format: schema ? (formatInPrompt ? "in-prompt" : "strict") : "text",
    usage: message.usage,
  }));

  if (message.stop_reason === "refusal") {
    throw new AIError("The AI couldn't analyze this entry. Please rephrase and try again.", 422);
  }
  if (message.stop_reason === "max_tokens") {
    throw new AIError("The AI's answer was too long. Please try a shorter entry.", 502);
  }

  const text = (message.content as any[])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!schema) return text;
  try {
    const parsed = formatInPrompt ? parseJsonAnswer(text) : JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new SyntaxError("Not an object");
    return parsed;
  } catch {
    console.error("Claude returned invalid JSON", formatInPrompt ? "(in-prompt format)" : "");
    throw new AIError("The AI's answer was incomplete. Please try again.", 502);
  }
}
