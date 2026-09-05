export type ProfileStatus = "draft" | "active" | "disabled";

export type Profile = {
  id: string;
  public_id: string;
  full_name: string;
  role: string;
  organization: string | null;
  team: string | null;
  bio: string | null;
  photo_url: string | null;
  skills: string[];
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  badge_tier: string;
  status: ProfileStatus;
  is_verified: boolean;
  updated_at: string;
};
