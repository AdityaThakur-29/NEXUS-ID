# AGENT.MD — Nexus ID Engineering & Operational Manual

> **Purpose of this document**:  
> This document serves as the authoritative, end-to-end operational guide for AI agents and software engineers working on the **Nexus ID** codebase. It covers architecture, directory layout, routing mechanics, database models, security rules, conventions, and operational workflows.

---

## 1. Project Overview & Mission

**Nexus ID** is a high-performance, cloud-backed digital badge and identity platform designed for technology conferences, hackathons, and community events.

### The Core Problem It Solves
Traditional event badges either print static information on physical PVC/paper cards (which cannot be updated, revoked, or linked to rich social media) or store data directly on smart chips (which requires expensive equipment and physical re-encoding whenever attendee details change).

### The Nexus ID Solution
Nexus ID decouples physical NFC hardware from the digital identity layer:
- **Physical Token**: Standard NFC chip (NTAG213/215/216) or printed badge containing a single, permanent, short NDEF URL record: `https://<event-domain>/@<PUBLIC_ID>` (e.g., `/@AD001`).
- **Cloud Identity Layer**: A Next.js 15 web application backed by Supabase PostgreSQL and Row-Level Security (RLS).
- **Dynamic Capabilities**:
  - Attendee profiles, roles, badges, bios, and links can be updated anytime via the admin workspace without touching the physical card.
  - Cards can be instantly marked as `disabled` if lost or stolen.
  - Built-in on-screen dynamic SVG QR code provides instant fallback for devices without active NFC.

---

## 2. Technology Stack

| Layer | Technology | Version | Key Role / Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `^15.2.0` | React 19 SSR, asynchronous params, edge middleware rewrites |
| **Runtime / UI** | React / React DOM | `^19.0.0` | Server Components + interactive client forms |
| **Language** | TypeScript | `^5.7.3` | Strict mode enabled, path aliases (`@/*` -> `./*`) |
| **Database & Auth** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | `^2.49.1` / `^0.6.1` | PostgreSQL database, Row Level Security, cookie-based session auth |
| **Validation** | Zod | `^3.24.2` | Runtime request body sanitization and constraint checking |
| **Visual / QR** | `qrcode.react` | `^4.2.0` | Dynamic SVG QR generation for the public ID URL |
| **Styling** | Vanilla CSS (`app/globals.css`) | Modern CSS3 | Custom properties, dark cyberpunk glassmorphism, 3D CSS perspective card |

---

## 3. Directory & File Structure

```text
.
├── .env.example                     # Reference environment variable template
├── .env.local                       # Local secret configurations (Supabase URL, anon key, app URL)
├── .gitignore                       # Git ignore list (node_modules, .next, .env*.local, *.log)
├── README.md                        # User-facing onboarding and NFC encoding instructions
├── agent.md                         # This operational manual for AI agents & engineers
├── decision.md                      # Architectural Decision Records (ADRs) and design rationale
├── middleware.ts                    # Edge rewrite engine: /@ID -> /profile?id=ID & Supabase auth sync
├── next.config.ts                   # Next.js configuration (distDir: ".next-runtime", remote image patterns)
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # TypeScript configuration with path aliases
│
├── app/                             # Next.js 15 App Router
│   ├── globals.css                  # Global design tokens, dark futuristic palette, card 3D styling
│   ├── layout.tsx                   # Root HTML shell with metadata
│   ├── page.tsx                     # Landing page with demo link and call-to-action
│   ├── not-found.tsx                # Universal 404 page for unknown / invalid cards
│   ├── login/
│   │   └── page.tsx                 # Supabase email/password sign-in and initial admin registration
│   ├── profile/
│   │   └── page.tsx                 # Public dynamic badge view (renders 3D card + QR fallback)
│   ├── admin/
│   │   ├── layout.tsx               # Server-side RBAC gatekeeper (redirects unauthorized users to /admin/login)
│   │   ├── page.tsx                 # Admin dashboard: attendee directory table with actions
│   │   ├── login/
│   │   │   └── page.tsx             # Dedicated /admin/login authentication screen
│   │   └── profiles/
│   │       ├── new/
│   │       │   └── page.tsx         # Page hosting <NewProfileForm /> (with ID generator and Draft/Active status)
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx     # Page hosting <EditProfileForm /> (with Delete action and status selector)
│   └── api/
│       └── admin/
│           └── profiles/
│               ├── route.ts         # POST: Create profile (draft or active, Zod validation + auth check)
│               └── [id]/
│                   └── route.ts     # PATCH & DELETE: Update/Delete profile (Zod validation + auth check)
│
├── components/                      # Shared Client Components
│   ├── new-profile-form.tsx         # Form for creating attendee records (auto ID generator + draft/active)
│   └── edit-profile-form.tsx        # Form for editing & deleting attendee records (with confirmation)
│
├── lib/                             # Core utilities and data layers
│   ├── types.ts                     # TypeScript definitions for Profile and ProfileStatus
│   ├── demo-data.ts                 # Hardcoded fallback profiles used in development
│   ├── profiles.ts                  # Server-side profile data fetching logic and URL generators
│   └── supabase/
│       ├── browser.ts               # Browser client factory using @supabase/ssr
│       └── server.ts                # Server client factories (read-only anon client + cookie-aware auth client)
│
└── supabase/                        # Database Schemas & Migrations
    ├── schema.sql                   # Profiles table, enum, public read RLS policy, demo record
    └── admin_setup.sql              # admin_roles table, staff/admin RLS policies for CRUD (SELECT, INSERT, UPDATE, DELETE)

```

---

## 4. Key Architectural Patterns & Workflows

### 4.1. URL Rewriting & The `@` Vanity Route Mechanics

#### The Challenge
Event organizers want ultra-short, brandable URLs written to NFC cards: `https://event.com/@AD001`.  
However, in Next.js App Router, `@` folders are reserved internally for **Parallel Routes** (e.g., `@modal`, `@sidebar`). Attempting to create an `app/@id/page.tsx` causes build errors or unexpected routing behavior.

#### The Implementation (`middleware.ts`)
- The Next.js Edge Middleware intercepts all requests using the matcher `/:path*`.
- It tests the pathname with the regex:
  ```typescript
  const match = request.nextUrl.pathname.match(/^\/@([A-Za-z0-9_-]{3,20})$/);
  ```
- If matched:
  - Extracts the identifier, converts it to uppercase (`match[1].toUpperCase()`).
  - Rewrites internally to `/profile?id=<UPPERCASE_ID>`.
  - The attendee's browser URL remains clean (`/@AD001`), while Next.js routes execution to `app/profile/page.tsx`.
- Additionally, `middleware.ts` runs `supabase.auth.getUser()` to keep Supabase auth cookies synchronized on incoming requests.

---

### 4.2. Dual-Mode Profile Data Access (`lib/profiles.ts`)

To allow instant local development without forcing an immediate cloud database setup while guaranteeing strict production privacy, profile fetching adheres to a dual-mode strategy:

```typescript
export async function getProfile(publicId: string): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return demoProfiles.find((p) => p.public_id.toLowerCase() === publicId.toLowerCase()) ?? null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("public_id", publicId.toUpperCase())
    .single();

  // In development: fallback to demo record if missing from DB
  if ((error || !data) && process.env.NODE_ENV === "development") {
    return demoProfiles.find((p) => p.public_id.toLowerCase() === publicId.toLowerCase()) ?? null;
  }
  
  // In production: strict null. Never leak demo identity data!
  if (error || !data) return null;
  return data as Profile;
}
```

#### Behavior Summary
| Environment | Supabase Configured? | Profile in DB? | Result |
| :--- | :--- | :--- | :--- |
| **Development** | No | N/A | Returns demo profile (`demoProfiles`) |
| **Development** | Yes | Found | Returns DB profile |
| **Development** | Yes | Not Found | Falls back to demo profile |
| **Production** | No / Yes | Found (`active`) | Returns DB profile |
| **Production** | Yes | Disabled / Draft | Returns profile with `unavailable` status display |
| **Production** | Yes | Not Found | Returns `null` -> triggers Next.js `notFound()` (404) |

---

### 4.3. Database Schema & Security Model (Supabase RLS)

#### Tables
1. **`public.profiles`**:
   - `id`: UUID Primary Key (`gen_random_uuid()`).
   - `public_id`: Unique text constraint (`check (public_id ~ '^[A-Z0-9_-]{3,20}$')`).
   - `full_name`: Text (e.g. "Priya Sharma").
   - `role`: Text constrained to the 5 designated team roles:
     - `Chairperson`
     - `Vice Chairperson`
     - `Core Member`
     - `Team Head` (paired with `team`/Department specification, e.g. Technical Team, PR Team, Documentation Team)
     - `Member`
   - `organization`: Text (defaults to "Nexus ID").
   - `team`: Text (e.g. "Technical Team", "PR Team", "Documentation Team", "Design Team").
   - `bio`: Text (max 500 chars).
   - `photo_url`: Text (supports Base64 data URLs or uploaded image links).
   - `skills`: `text[]` default `{}`.
   - `github_url`, `linkedin_url`, `website_url`, `instagram_url` (supports Instagram / X).
   - `badge_tier`: Text (defaults to the assigned `role`).
   - `status`: Enum `public.profile_status ('draft', 'active', 'disabled')`.
   - `is_verified`: Boolean default `true`.
   - `created_at`, `updated_at`: Timestamps.


2. **`public.admin_roles`**:
   - `user_id`: UUID references `auth.users(id)` ON DELETE CASCADE.
   - `role`: Text check `role in ('admin', 'staff')`.
   - `created_at`: Timestamp.

#### Row Level Security (RLS) Rules
- **Public Read**:
  ```sql
  create policy "public can read active profiles" on public.profiles
  for select using (status = 'active');
  ```
  *(Draft or disabled profiles are invisible to anonymous requests at the database layer).*
- **Admin Access**:
  - Authenticated users with a record in `public.admin_roles` can view all profiles (including drafts and disabled).
  - Authenticated users with `role in ('admin', 'staff')` can insert and update profiles.

---

### 4.4. Multi-Layer Admin Authorization Guard

Admin protection is implemented with defense-in-depth across 3 layers:

1. **Layer 1: Server Component Gate (`app/admin/layout.tsx`)**
   - Extracts auth session via `createSupabaseAuthClient()`.
   - If no session, redirects to `/login`.
   - Verifies whether `auth.uid()` exists in `public.admin_roles`. If not, redirects to `/login?reason=not-authorized`.
2. **Layer 2: API Route Authentication & Zod Validation (`app/api/admin/profiles/...`)**
   - Checks `await supabase.auth.getUser()`. If missing, immediately returns HTTP 401.
   - Validates input payload using Zod schemas (`regex`, `min`, `max`, `url`).
   - Sanitizes empty string URLs to `null`.
3. **Layer 3: Supabase PostgreSQL RLS**
   - Even if an API route was misconfigured, Supabase rejects unauthorized write attempts because RLS checks `admin_roles`.

---

## 5. Physical Hardware & NFC Card Encoding Guide

### NFC Specifications
- **Recommended Chip**: NXP NTAG213 (144 bytes user memory), NTAG215 (504 bytes), or NTAG216 (888 bytes).
- **Format**: NDEF (NFC Data Exchange Format).
- **Record Type**: Well-Known Type URI Record (`U`).

### Writing the Card
Use any standard NFC tool (such as **NFC Tools** on iOS/Android or desktop ACR122U USB writers):
1. Create a new record: **URL / URI**.
2. Enter the full canonical URL:
   ```text
   https://your-domain.com/@AD001
   ```
3. Write to the card.
4. (Optional for production) **Lock the NFC card** (set write lock bits) so participants cannot overwrite their badge URL.

> **Crucial Rule**: Never write profile data (name, email, vCard) directly to the NFC tag. Only write the vanity URL. All profile changes are made in the cloud dashboard.

---

## 6. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
# Canonical public domain of your application (used for generating absolute card URLs & QR codes)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase public anonymous API key (safe for browser & server queries governed by RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 7. Developer & Agent Guidelines

When maintaining or extending this codebase, adhere to the following strict conventions:

### 7.1. Next.js 15 Asynchronous Props
In Next.js 15, dynamic route `params` and `searchParams` are Promises.
```typescript
// ALWAYS await params and searchParams:
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  // ...
}
```

### 7.2. Public ID Format Rules
- Public IDs must match regex `/^[A-Z0-9_-]{3,20}$/`.
- Always store and lookup public IDs in uppercase (`AD001`, `VIP-2026`).
- Once a physical card is issued with a public ID, that `public_id` **must remain immutable** (enforced in `edit-profile-form.tsx`).

### 7.3. Supabase Client Lifecycle
- Use `createSupabaseBrowserClient()` in Client Components (`"use client"`).
- Use `createSupabaseServerClient()` in Server Components or utilities for anonymous public queries.
- Use `await createSupabaseAuthClient()` in Server Components or Route Handlers when user auth cookies need to be inspected.

### 7.4. Build Output Directory & TypeScript Excludes
Notice that `next.config.ts` specifies:
```typescript
const nextConfig: NextConfig = {
  distDir: ".next-runtime",
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
```
- **Exclude generated directories**: `tsconfig.json` excludes both `"node_modules"`, `".next"`, and `".next-runtime"`. This prevents stale, previously generated route types or Next.js build manifests from contaminating TypeScript type checking (`tsc --noEmit`).
- **Middleware cookie typing**: In `middleware.ts`, `CookieOptions` is imported from `@supabase/ssr` (`import type { CookieOptions } from "@supabase/ssr"`) to accurately annotate `{ name: string; value: string; options: CookieOptions }[]` in the `setAll` cookie handler.


### 7.5. CSS & Aesthetics
- All application styling lives in `app/globals.css`.
- Do **not** install Tailwind CSS unless explicitly requested by the user.
- Maintain the cyberpunk / glassmorphic event aesthetic:
  - Font families: `"DM Mono", monospace` for badges and metadata; `"Space Grotesk", sans-serif` for body and headings.
  - Colors: Primary dark background `#070811`, accents `#8e6bff` (violet) and `#43e7ff` (cyan).
  - 3D card effect uses CSS perspective (`transform: perspective(1100px) rotateY(-5deg) rotateX(2deg)`).

---

## 8. Verification & QA Checklist

Before committing changes or deploying, execute these verification steps:

1. **Build & Type Check**:
   ```bash
   npm run build
   ```
   Must pass with zero TypeScript or route compilation errors.
2. **Public Card Test**:
   - Open `http://localhost:3000/@AD001`.
   - Verify that the URL stays `/@AD001`, the 3D card renders, and the QR code encodes the canonical URL.
3. **Invalid Card Test**:
   - Open `http://localhost:3000/@UNKNOWN999`.
   - In production mode, verify it triggers the `not-found.tsx` 404 page.
4. **Admin Protection Test**:
   - Open `http://localhost:3000/admin` in an incognito session.
   - Verify it redirects to `/login`.
5. **Form Submission & Validation**:
   - Submit invalid data to `/api/admin/profiles` (e.g. invalid public ID format).
   - Verify Zod rejects the payload with HTTP 400.
