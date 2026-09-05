import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseAuthClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  if (pathname.startsWith("/admin/login")) {
    return children;
  }

  const supabase = await createSupabaseAuthClient();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role) redirect("/admin/login?reason=not-authorized");
  return children;
}

