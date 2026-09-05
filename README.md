# Nexus ID — NFC Event Digital IDs

## Start locally

1. Copy `.env.example` to `.env.local` and add the Supabase Project URL and anon key.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Run `supabase/admin_setup.sql` to enable secure admin permissions.
4. In Supabase Dashboard → Authentication → Providers, enable Email/password sign-in.
5. Create your login account at `http://localhost:3000/login`, then run the final commented `insert into public.admin_roles` command in `admin_setup.sql` with your email.
6. Install dependencies: `npm install`.
7. Start the app: `npm run dev`.
8. Open `http://localhost:3000/@AD001`.

## Writing an NFC card

Write this as an NDEF URL record, replacing the domain with your deployed domain:

`https://your-event-domain.com/@AD001`

The card contains only this URL. Profile changes happen in Supabase and do not require rewriting the card.

## Important before production

- Configure Supabase Auth and replace the starter admin screen with protected CRUD actions.
- Add admin RLS write policies only for trusted event admins.
- Deploy to Vercel and set the production `NEXT_PUBLIC_APP_URL` before issuing cards.
