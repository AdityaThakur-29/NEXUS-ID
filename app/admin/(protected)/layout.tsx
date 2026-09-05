import { redirect } from "next/navigation";
import { createSupabaseAuthClient } from "@/lib/supabase/server";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseAuthClient();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role) redirect("/admin/login?reason=not-authorized");
  return children;
}
