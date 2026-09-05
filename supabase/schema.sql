-- Run this file in Supabase: SQL Editor → New query.
create type public.profile_status as enum ('draft', 'active', 'disabled');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique check (public_id ~ '^[A-Z0-9_-]{3,20}$'),
  full_name text not null,
  role text not null,
  organization text,
  team text,
  bio text check (char_length(bio) <= 500),
  photo_url text,
  skills text[] not null default '{}',
  github_url text,
  linkedin_url text,
  website_url text,
  instagram_url text,
  badge_tier text not null default 'Participant',
  status public.profile_status not null default 'draft',
  is_verified boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone may read active profiles. Create admin policies after enabling Supabase Auth.
create policy "public can read active profiles" on public.profiles
for select using (status = 'active');

-- Starter record: its NFC payload is https://YOUR-DOMAIN/@AD001
insert into public.profiles (public_id, full_name, role, organization, team, bio, skills, badge_tier, status)
values ('AD001', 'Aditya Thakur', 'Tech Team', 'Nexus Event 2026', 'Experience Lab', 'Building memorable experiences where technology meets people.', array['Next.js','NFC','Creative Tech'], 'Organizer', 'active');
