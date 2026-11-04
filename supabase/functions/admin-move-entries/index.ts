// POST { from_email, to_email, confirm?: boolean, delete_old?: boolean }
// Admin Dashboard tool: moves every entry from one account (for example an imported
// Base44 account someone can no longer sign in to) into another account.
// Without `confirm` it only previews what would move. Admins only.
import { adminClient, corsHeaders, getUser, json } from "../_shared/common.ts";

type Account = { id: string; email: string; full_name: string | null; role: string; created_date: string; sign_in: string[] };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return json(req, { error: "Please sign in again." }, 401);

  const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return json(req, { error: "Admins only." }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid request." }, 400);
  }
  const fromEmail = typeof body?.from_email === "string" ? body.from_email.trim().toLowerCase() : "";
  const toEmail = typeof body?.to_email === "string" ? body.to_email.trim().toLowerCase() : "";
  if (!fromEmail || !toEmail) return json(req, { error: "Enter both email addresses." }, 400);
  if (fromEmail === toEmail) return json(req, { error: "Choose two different accounts." }, 400);

  async function findAccount(email: string): Promise<Account | null> {
    const { data } = await admin.from("profiles").select("id, email, full_name, role, created_date").eq("email", email).limit(2);
    if (!data || data.length !== 1) return null;
    const { data: authUser } = await admin.auth.admin.getUserById(data[0].id);
    const providers = (authUser?.user?.app_metadata?.providers as string[] | undefined) ?? [];
    return { ...data[0], sign_in: providers };
  }

  const [from, to] = await Promise.all([findAccount(fromEmail), findAccount(toEmail)]);
  if (!from) return json(req, { error: `No account found for ${fromEmail}.` }, 404);
  if (!to) return json(req, { error: `No account found for ${toEmail}.` }, 404);

  const confirm = body?.confirm === true;
  const deleteOld = body?.delete_old === true;
  if (confirm && deleteOld && (from.role === "admin" || from.id === user.id)) {
    return json(req, { error: "An admin account can't be deleted with this tool." }, 400);
  }

  const { data: result, error } = await admin.rpc("admin_move_entries", { p_from: from.id, p_to: to.id, p_dry_run: !confirm });
  if (error) {
    console.error("admin_move_entries failed:", error.message);
    return json(req, { error: "The entries could not be moved. Nothing was changed." }, 500);
  }

  let deleted = false;
  if (confirm && deleteOld) {
    const { error: delError } = await admin.auth.admin.deleteUser(from.id);
    if (delError) {
      console.error("Deleting old account failed:", delError.message);
      return json(req, { from, to, result, deleted: false, warning: "Entries were moved, but the old account could not be deleted." });
    }
    deleted = true;
  }

  return json(req, { from, to, result, deleted });
});
