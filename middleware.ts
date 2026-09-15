import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appUrl, isApexHost, isAppHost, isLocalHost, siteUrl } from "@/lib/urls";

const PUBLIC_PREFIXES = [
  "/login",
  "/auth",
  "/opengraph-image",
  "/twitter-image",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/contact" || pathname === "/paper") {
    return true;
  }
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isStaticish(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (isApexHost(host)) {
    if (
      pathname === "/" ||
      pathname === "/contact" ||
      pathname === "/paper" ||
      isStaticish(pathname) ||
      pathname.startsWith("/opengraph") ||
      pathname.startsWith("/twitter")
    ) {
      return NextResponse.next();
    }
    const dest = new URL(pathname + request.nextUrl.search, appUrl());
    return NextResponse.redirect(dest);
  }

  if (
    isAppHost(host) &&
    (pathname === "/contact" || pathname === "/paper")
  ) {
    return NextResponse.redirect(new URL(pathname, siteUrl()));
  }

  if (isAppHost(host) && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/lab";
    return NextResponse.redirect(url);
  }

  if (isStaticish(pathname) || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const needsAuth =
    isAppHost(host) ||
    (isLocalHost(host) && !isPublicPath(pathname) && pathname !== "/");

  if (pathname.startsWith("/api")) {
    // Session refresh only; handlers return 401.
  } else if (!needsAuth) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (pathname.startsWith("/api")) return NextResponse.next();
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/api")) {
    return response;
  }

  if (!user && pathname !== "/login") {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (user && pathname === "/login") {
    const next = request.nextUrl.searchParams.get("next") || "/lab";
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
