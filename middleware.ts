import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

// Keep NFC URLs short and permanent: /@AD001. This avoids using an @-prefixed
// folder (reserved by Next.js) or a dynamic app-route segment.
export function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      }
    );
    void supabase.auth.getUser();
  }
  const match = request.nextUrl.pathname.match(/^\/@([A-Za-z0-9_-]{3,20})$/);
  if (!match) return response;

  const destination = request.nextUrl.clone();
  destination.pathname = "/profile";
  destination.searchParams.set("id", match[1].toUpperCase());
  return NextResponse.rewrite(destination, { headers: response.headers });
}

export const config = {
  matcher: "/:path*",
};
