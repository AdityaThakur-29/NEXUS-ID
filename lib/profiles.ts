import { demoProfiles } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAuthClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getProfile(publicId: string): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return demoProfiles.find((p) => p.public_id.toLowerCase() === publicId.toLowerCase()) ?? null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("public_id", publicId.toUpperCase())
    .single();
  // Preserve the local demo card only while developing. In production, a
  // disabled or missing card must never fall back to demo identity data.
  if ((error || !data) && process.env.NODE_ENV === "development") {
    return demoProfiles.find((p) => p.public_id.toLowerCase() === publicId.toLowerCase()) ?? null;
  }
  if (error || !data) return null;
  return data as Profile;
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createSupabaseAuthClient() ?? createSupabaseServerClient();
  if (!supabase) return demoProfiles;
  const { data } = await supabase.from("profiles").select("*").order("updated_at", { ascending: false });
  return (data ?? []) as Profile[];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createSupabaseAuthClient() ?? createSupabaseServerClient();
  if (!supabase) return demoProfiles.find((p) => p.id === id) ?? null;
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Profile | null) ?? null;
}

export function profileUrl(publicId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/@${publicId}`;
}
