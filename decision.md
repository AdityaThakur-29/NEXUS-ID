# DECISION.MD — Architectural Decision Records (ADRs)

> **Document Status**: Living Architectural Document  
> **Project**: Nexus ID (NFC Event Badging & Digital Identity)  
> **Author**: Engineering Team  

---

## Overview & Index

This document records the architectural and design decisions made for **Nexus ID**. Each record describes the context, evaluated alternatives, decisions reached, and resulting trade-offs.

| ID | Title | Status | Category |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Short Vanity URL Scheme with Edge Rewrite (`/@PUBLIC_ID`) | Accepted | Routing / Hardware UX |
| **ADR-002** | Physical Token Payload Decoupling (Static NDEF URI vs Embedded Data) | Accepted | Hardware / Security |
| **ADR-003** | Dual-Mode Profile Resolution (Seamless Local Dev vs Zero-Leak Production) | Accepted | Data Access / Privacy |
| **ADR-004** | Adoption of Next.js 15 App Router & React 19 Asynchronous APIs | Accepted | Framework / Architecture |
| **ADR-005** | Three-Tier RBAC with Supabase RLS and Server Layout Gatekeeping | Accepted | Security / Auth |
| **ADR-006** | Custom Build Artifact Directory (`distDir: ".next-runtime"`) | Accepted | Build & Tooling |
| **ADR-007** | Pure Vanilla CSS Design System with Cyberpunk Glassmorphism | Accepted | UI / Frontend |
| **ADR-008** | Two-Layer Schema Validation (Zod Route Handlers + PostgreSQL Check Constraints) | Accepted | Data Integrity |
| **ADR-009** | Dynamic SVG QR Code Pairing on Digital ID Display | Accepted | Accessibility / Hardware UX |

---

## ADR-001: Short Vanity URL Scheme with Edge Rewrite (`/@PUBLIC_ID`)

### Context
Event badges must be tapped or scanned effortlessly. NFC tags written with lengthy URLs take longer to read and have limited storage capacity on cheaper chips (e.g. NTAG213 has only 144 bytes). Furthermore, attendees expect a modern social-style link (e.g. `event.com/@AD001` or `event.com/@PRANAV`).

However, in Next.js App Router, directory names prefixed with `@` (e.g. `app/@modal/`) are reserved for **Parallel Routes** and slot rendering. If we created an `app/@id/page.tsx`, Next.js would treat it as a named slot rather than a dynamic URL segment.

### Alternatives Considered
1. **Standard Dynamic Route (`/p/[id]` or `/badge/[id]`)**:
   - *Pros*: Native Next.js App Router folder structure.
   - *Cons*: Adds redundant path segments; longer URL to write to NFC; less memorable for attendees.
2. **Top-Level Dynamic Route (`/[publicId]`)**:
   - *Pros*: Short URLs (`event.com/AD001`).
   - *Cons*: Collides with top-level routes like `/admin`, `/login`, `/api`, `/favicon.ico`. Requires complex exclusions and fragile collision prevention.
3. **Subdomain Routing (`ad001.event.com`)**:
   - *Pros*: Very clean.
   - *Cons*: Requires wildcard SSL certificates, dynamic DNS routing, and added infrastructure complexity.

### Decision
Use Next.js Edge Middleware (`middleware.ts`) to match the vanity pattern:
```regex
^\/@([A-Za-z0-9_-]{3,20})$
```
and internally rewrite it to:
```text
/profile?id=<UPPERCASE_PUBLIC_ID>
```
The rewrite maintains the browser URL as `https://event.com/@AD001` without redirect hops, while dispatching the request to the `app/profile/page.tsx` server component.

### Consequences
- **Positive**: Clean, memorable, short URLs on the card; zero collisions with Next.js parallel route conventions; case-insensitivity handled upstream (canonicalized to uppercase).
- **Negative**: Middleware runs on incoming requests matching `/:path*` (negligible latency on Edge runtime).

---

## ADR-002: Physical Token Payload Decoupling (Static NDEF URI vs Embedded Data)

### Context
When issuing NFC badges at conferences, one approach is to store the attendee's full vCard, JSON payload, or encrypted credentials directly on the NFC chip's memory blocks.

### Alternatives Considered
1. **Store Full vCard or Contact File on NFC Chip**:
   - *Pros*: Works offline without an internet connection.
   - *Cons*:
     - Requires expensive high-capacity NFC chips (NTAG216 or Mifare Desfire, 888+ bytes).
     - Cannot be modified after writing without physically retrieving and rewriting the attendee's badge.
     - Cannot be revoked if lost, stolen, or if the attendee's role changes.
     - No analytics or event-level badge verification.
2. **Store Static Vanity NDEF URL Pointing to Nexus ID**:
   - *Pros*:
     - Cheap standard chips (NTAG213, 144 bytes).
     - Single write operation during badge printing/distribution.
     - Profile changes (bio, skills, links, photos) update immediately in the cloud.
     - Badges can be revoked (`status = 'disabled'`) in real-time from the admin dashboard.
     - Dynamic features (QR fallback, badge tier styling, live verification badges).

### Decision
Store exclusively an **NDEF URI Record** (`https://<domain>/@<PUBLIC_ID>`) on the physical card. The physical chip acts solely as an immutable pointer; all profile state is maintained in the cloud.

### Consequences
- **Positive**: Physical badge manufacturing and issuance is vastly simplified. Immediate profile updates and instant badge deactivation.
- **Negative**: Viewing the digital badge requires internet connectivity on the attendee's mobile device (standard for tech events).

---

## ADR-003: Dual-Mode Profile Resolution (Seamless Local Dev vs Zero-Leak Production)

### Context
During local development and automated CI testing, developers often do not have a live Supabase PostgreSQL database configured or seeded. However, in production, privacy and security are paramount: if a badge is invalid or disabled, it must never display mock or placeholder identity data.

### Alternatives Considered
1. **Require Live Database Always**:
   - *Pros*: Exact mirror of production.
   - *Cons*: High friction for new developers; builds and tests break if environment credentials are not present.
2. **Always Fallback to Mock Data**:
   - *Pros*: App never breaks.
   - *Cons*: **Catastrophic privacy leak**. If an attendee's badge is disabled or typed incorrectly in production, displaying fallback demo data (e.g. Aditya Thakur's profile) would violate trust and system integrity.

### Decision
Implement a strict environment-aware branching strategy in `lib/profiles.ts`:
1. If Supabase is unconfigured in development, serve mock profile data (`demoProfiles`).
2. If Supabase is configured and a profile is not found:
   - If `process.env.NODE_ENV === "development"`, fall back to `demoProfiles` for smooth UI preview.
   - If `process.env.NODE_ENV === "production"`, strictly return `null` (which renders the 404 `not-found.tsx` view).
3. If a profile exists in the DB but `status !== "active"`, render the distinct "Profile unavailable / Card inactive" screen.

### Consequences
- **Positive**: Frictionless developer experience on `localhost:3000/@AD001` with zero setup, combined with zero-leak production guarantees.
- **Negative**: Behavior slightly diverges between development and production for missing IDs, which developers must keep in mind during testing.

---

## ADR-004: Adoption of Next.js 15 App Router & React 19 Asynchronous APIs

### Context
Next.js 15 and React 19 introduce significant architectural changes, particularly making previously synchronous server component properties—such as `params`, `searchParams`, and `cookies()`—asynchronous (`Promise`).

### Alternatives Considered
1. **Stay on Next.js 14 Pages Router or Synchronous App Router**:
   - *Pros*: Familiar synchronous APIs.
   - *Cons*: Technical debt; missing React 19 optimizations; incompatibility with future Next.js security and streaming updates.
2. **Adopt Next.js 15 Async Paradigm Fully**:
   - *Pros*: Full compatibility with latest Next.js 15.2.0; leverage React Server Components (RSC) streaming; future-proof codebase.

### Decision
Standardize all Server Components and Route Handlers on asynchronous parameter resolution:
```typescript
// Profile Page
export default async function PublicProfile({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  // ...
}

// Edit Profile Route
export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}
```

### Consequences
- **Positive**: Zero deprecation warnings; robust type checking; ready for Next.js 16.
- **Negative**: Requires engineers and agents to consistently `await` route arguments.

---

## ADR-005: Three-Tier RBAC with Supabase RLS and Server Layout Gatekeeping

### Context
The admin workspace manages sensitive attendee data, badge tiers, and card statuses. Unauthorized attendees must be strictly prevented from editing badges or viewing disabled/draft profiles.

### Alternatives Considered
1. **Client-Side Only Authentication Check**:
   - *Pros*: Easy to implement in React components.
   - *Cons*: Unsafe; client bundle can be inspected or bypassed; flashes unauthorized content before redirect.
2. **API-Only Authentication**:
   - *Pros*: Protects database mutations.
   - *Cons*: Admin UI pages are still accessible and can leak layout structures.
3. **Three-Tier Defense-in-Depth (Layout + API + DB RLS)**:
   - Tier 1: Server Layout (`app/admin/layout.tsx`) validates session and role before rendering HTML.
   - Tier 2: Route Handlers (`app/api/admin/...`) validate auth session and Zod schema.
   - Tier 3: PostgreSQL Row Level Security (`public.profiles`, `public.admin_roles`) guarantees that even direct Supabase client queries cannot bypass role constraints.

### Decision
Implement the Three-Tier Defense-in-Depth model:
1. `supabase/admin_setup.sql` defines `public.admin_roles` and enforces RLS for `insert` and `update` on `public.profiles`.
2. `app/admin/layout.tsx` queries `admin_roles` server-side and redirects unauthenticated or non-admin users to `/login`.
3. Route Handlers reject unauthenticated requests with HTTP 401.

### Consequences
- **Positive**: Enterprise-grade security; zero data leaks; no unauthorized writes possible even with direct API tampering.
- **Negative**: Setting up the first admin user requires executing a one-time SQL script (`insert into public.admin_roles`) in Supabase SQL editor.

---

## ADR-006: Custom Build Artifact Directory (`distDir: ".next-runtime"`)

### Context
During rapid development and route refactoring (transitioning from experimental route schemes to the edge rewrite engine), local development builds encountered cache collisions and stale module resolution in the default `.next` cache directory.

### Alternatives Considered
1. **Default `.next` Directory with Frequent Manual `rm -rf .next`**:
   - *Pros*: Standard Next.js convention.
   - *Cons*: Confusing developer experience when cache conflicts recur; easily overlooked.
2. **Explicit `distDir: ".next-runtime"` in `next.config.ts`**:
   - *Pros*: Provides an isolated build target, ensuring clean runtime compilation without legacy cache artifacts.

### Decision
1. Configure `distDir: ".next-runtime"` in `next.config.ts`.
2. Include `.next-runtime/types/**/*.ts` in `tsconfig.json` so Next.js type generation functions smoothly.
3. Exclude both `.next` and `.next-runtime` under `"exclude"` in `tsconfig.json`. This prevents obsolete route types from earlier route iterations or previous builds from triggering false positive TypeScript errors during `tsc --noEmit`.
4. Add `.next-runtime` to `.gitignore` to prevent generated compilation artifacts from being checked into version control.

### Consequences
- **Positive**: Clean isolation of compilation artifacts; immune to stale route type artifacts during type checking.
- **Negative**: Developers must be aware that runtime files are generated in `.next-runtime` instead of `.next`.


---

## ADR-007: Pure Vanilla CSS Design System with Cyberpunk Glassmorphism

### Context
Event badges must look visually stunning, futuristic, and premium to create excitement among attendees and organizers. Many web applications rely on large utility CSS frameworks (such as Tailwind CSS) or component libraries (MUI, Shadcn), which add build complexity and external dependency overhead.

### Alternatives Considered
1. **Tailwind CSS**:
   - *Pros*: Widely known utility classes.
   - *Cons*: Additional PostCSS pipeline, extra dependencies, boilerplate utility soup for complex 3D transforms.
2. **CSS-in-JS (styled-components / emotion)**:
   - *Pros*: Scoped component styling.
   - *Cons*: High runtime overhead; poor compatibility with React 19 Server Components.
3. **Vanilla CSS with CSS Variables (`app/globals.css`)**:
   - *Pros*:
     - Zero runtime overhead and zero build dependencies.
     - Full expressive power for advanced 3D perspective transforms (`perspective(1100px) rotateY(-5deg) rotateX(2deg)`), animated holographic light sweeps (`@keyframes shine`), and backdrop blurs (`backdrop-filter: blur(12px)`).
     - Lightweight bundle size (~5.7KB total CSS).

### Decision
Use bespoke Vanilla CSS in `app/globals.css` with a curated cyberpunk color palette (`#070811` void black, `#8e6bff` violet, `#43e7ff` neon cyan), Space Grotesk typography, and DM Mono for badge metadata.

### Consequences
- **Positive**: Blazing fast load times; striking visual identity; zero external styling dependencies.
- **Negative**: Global namespace requires disciplined selector naming (e.g. `.card`, `.profile-wrap`, `.shell`).

---

## ADR-008: Two-Layer Schema Validation (Zod Route Handlers + PostgreSQL Check Constraints)

### Context
Participant data involves public IDs, social URLs, bio length restrictions, and badge tiers. Bad data input could break the 3D card layout, cause broken links, or corrupt the NFC URL mapping.

### Alternatives Considered
1. **Database Constraints Only**:
   - *Pros*: Enforces integrity at the lowest level.
   - *Cons*: Ugly SQL error messages returned to the frontend; difficult for users to understand what failed.
2. **Client-Side HTML5 Validation Only**:
   - *Pros*: Immediate user feedback.
   - *Cons*: Easily bypassed by direct API calls; insecure.
3. **Two-Layer Validation (Zod on API + SQL Check Constraints)**:
   - Frontend: Form attributes (`pattern`, `maxlength`, `required`).
   - Server Route Handlers: Strict Zod schemas validating string lengths, URL format, public ID regex `/^[A-Z0-9_-]{3,20}$/`.
   - Database: SQL `check (public_id ~ '^[A-Z0-9_-]{3,20}$')` and `check (char_length(bio) <= 500)`.

### Decision
Implement dual validation: Zod in `app/api/admin/profiles/route.ts` and `[id]/route.ts` combined with PostgreSQL table constraints in `supabase/schema.sql`.

### Consequences
- **Positive**: Clear human-friendly error messages returned to the admin UI; absolute database data integrity.
- **Negative**: Validation rules must be kept synchronized between Zod schemas and SQL schemas if fields change.

---

## ADR-009: Dynamic SVG QR Code Pairing on Digital ID Display

### Context
While NFC is widely available on modern smartphones, certain attendee devices have NFC antennas disabled, blocked by thick phone cases, or unsupported.

### Alternatives Considered
1. **NFC Only**:
   - *Pros*: Purest hardware experience.
   - *Cons*: Leaves out attendees whose phones lack active NFC.
2. **Print Static QR on Physical Card**:
   - *Pros*: Always physically visible.
   - *Cons*: Consumes physical card surface area; may look cluttered next to branding artwork.
3. **Dynamic On-Screen SVG QR Fallback**:
   - When an attendee's digital badge is open on their phone screen, a crisp SVG QR code (rendered via `qrcode.react`) is displayed in the side panel. Anyone standing next to them can immediately scan the QR code to open the identical digital badge URL.

### Decision
Render a dynamic `<QRCodeSVG />` component on the profile page encoding the canonical URL (`profileUrl(profile.public_id)`).

### Consequences
- **Positive**: Universal peer-to-peer sharing (tap or scan); zero extra physical printing costs; crisp vector scaling across all screen densities.
- **Negative**: Requires minimal client JS execution to render the SVG.
