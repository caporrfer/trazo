import { redirect } from "next/navigation";
import { hasSupabaseConfig, isDemoMode } from "./supabase/config";
import { createSessionClient } from "./supabase/server";

export async function getAdmin() {
  if (isDemoMode())
    return { id: "demo-admin", email: "demo@trazo.local", demo: true };
  if (!hasSupabaseConfig()) return null;
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (
    !user?.email ||
    !allowedEmail ||
    user.email.toLowerCase() !== allowedEmail
  )
    return null;
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (!adminRecord) return null;
  return { id: user.id, email: user.email, demo: false };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/acceso");
  return admin;
}
