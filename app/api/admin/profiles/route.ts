import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAuthClient } from "@/lib/supabase/server";
import { TEAM_ROLES } from "@/lib/types";

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  public_id: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,20}$/),
  role: z.enum(TEAM_ROLES),
  team: z.string().trim().max(120).optional(),
  organization: z.string().trim().max(120).optional(),
  badge_tier: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  photo_url: z.string().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(15),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "disabled", "draft"]).default("active"),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseAuthClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check the profile details." }, { status: 400 });
  const value = parsed.data;
  const { error } = await supabase.from("profiles").insert({
    ...value,
    badge_tier: value.badge_tier || value.role,
    photo_url: value.photo_url || null,
    organization: value.organization || "Nexus ID",
    team: value.team || null,
    bio: value.bio || null,
    linkedin_url: value.linkedin_url || null,
    github_url: value.github_url || null,
    website_url: value.website_url || null,
    instagram_url: value.instagram_url || null,
    status: value.status,
  });
  if (error) return NextResponse.json({ error: error.code === "23505" ? "That public ID already exists." : error.message }, { status: 400 });
  return NextResponse.json({ ok: true, publicId: value.public_id });
}
