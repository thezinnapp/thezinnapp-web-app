// Shared helpers for The ZINN App's server functions.
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.118.0";

// Sites allowed to call these functions from a browser.
const ALLOWED_ORIGINS = new Set([
  "https://online.thezinnapp.com",
  "https://thezinnapp.com",
  // Test address used before launch (GitHub Pages).
  "https://beta.thezinnapp.com",
]);
const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) || LOCALHOST.test(origin) || origin.startsWith("capacitor://") || origin === "https://localhost";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://online.thezinnapp.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

// Server-side client with full access. Never sent to the browser.
export function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Returns the signed-in user for this request, or null.
export async function getUser(req: Request, admin: SupabaseClient): Promise<User | null> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
