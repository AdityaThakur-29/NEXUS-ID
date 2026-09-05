import type { Profile } from "@/lib/types";

export const demoProfiles: Profile[] = [
  {
    id: "demo-ad001",
    public_id: "AD001",
    full_name: "Aditya Thakur",
    role: "Tech Team",
    organization: "Nexus Event 2026",
    team: "Experience Lab",
    bio: "Building memorable experiences where technology meets people.",
    photo_url: null,
    skills: ["Next.js", "NFC", "Creative Tech"],
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    website_url: null,
    instagram_url: null,
    badge_tier: "Organizer",
    status: "active",
    is_verified: true,
    updated_at: new Date().toISOString(),
  },
];
