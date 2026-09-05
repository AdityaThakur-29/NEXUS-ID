import { redirect } from "next/navigation";
import { createSupabaseAuthClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseAuthClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role) redirect("/login?reason=not-authorized");
  return children;
}
