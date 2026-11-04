// POST {} -> { ok: true }
// Permanently deletes the signed-in user's account. Their beliefs, reports, journal
// entries and other rows are removed automatically (database cascade).
import { adminClient, corsHeaders, getUser, json } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return json(req, { error: "Please sign in again." }, 401);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Delete account failed:", error.message);
    return json(req, { error: "Could not delete the account. Please try again." }, 500);
  }
  return json(req, { ok: true });
});
