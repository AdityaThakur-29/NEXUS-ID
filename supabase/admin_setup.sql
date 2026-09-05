-- Run once in Supabase SQL Editor after schema.sql.
-- This makes profile management private and enables secure admin access.

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')) default 'staff',
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;

create policy "admins can read their role" on public.admin_roles
for select to authenticated using (user_id = auth.uid());

create policy "admins can view all profiles" on public.profiles
for select to authenticated using (
  exists (select 1 from public.admin_roles where user_id = auth.uid())
);

create policy "admins can add profiles" on public.profiles
for insert to authenticated with check (
  exists (select 1 from public.admin_roles where user_id = auth.uid() and role in ('admin', 'staff'))
);

create policy "admins can update profiles" on public.profiles
for update to authenticated using (
  exists (select 1 from public.admin_roles where user_id = auth.uid() and role in ('admin', 'staff'))
) with check (
  exists (select 1 from public.admin_roles where user_id = auth.uid() and role in ('admin', 'staff'))
);

-- After creating your user at /login, replace YOUR_EMAIL and run this once.
-- insert into public.admin_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'YOUR_EMAIL'
-- on conflict (user_id) do update set role = 'admin';
