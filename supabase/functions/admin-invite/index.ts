// POST { email } -> { ok: true }
// Lets an admin invite a tester by email (Admin Dashboard). Admins only.
import { adminClient, corsHeaders, getUser, json } from "../_shared/common.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return json(req, { error: "Please sign in again." }, 401);

  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return json(req, { error: "Admins only." }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid request." }, 400);
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email)) return json(req, { error: "Enter a valid email address." }, 400);

  const redirectTo = Deno.env.get("APP_URL") ?? "https://online.thezinnapp.com";
  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error) return json(req, { error: error.message }, 400);
  return json(req, { ok: true });
});
