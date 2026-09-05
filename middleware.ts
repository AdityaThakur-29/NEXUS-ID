import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

// Keep NFC URLs short and permanent: /@AD001. This avoids using an @-prefixed
// folder (reserved by Next.js) or a dynamic app-route segment.
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const hasAuthCookies = request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token"));

  if (
    hasAuthCookies &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) =>
              cookies.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              ),
          },
        }
      );
      await supabase.auth.getUser().catch(() => {});
    } catch {
      // Ignore auth refresh errors in middleware
    }
  }

  const match = request.nextUrl.pathname.match(/^\/@([A-Za-z0-9_-]{3,20})$/);
  if (!match) return response;

  const destination = request.nextUrl.clone();
  destination.pathname = "/profile";
  destination.searchParams.set("id", match[1].toUpperCase());
  return NextResponse.rewrite(destination, { headers: response.headers });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
