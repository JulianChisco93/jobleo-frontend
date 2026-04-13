import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/", "/pricing", "/login"];

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix for comparison
  const stripped = pathname.replace(/^\/(en|es)/, "") || "/";
  return PUBLIC_PATHS.some(
    (p) => stripped === p || stripped.startsWith(p + "/")
  );
}

function isOnboardingPath(pathname: string): boolean {
  const stripped = pathname.replace(/^\/(en|es)/, "") || "/";
  return stripped === "/onboarding" || stripped.startsWith("/onboarding/");
}

function isDashboardPath(pathname: string): boolean {
  const stripped = pathname.replace(/^\/(en|es)/, "") || "/";
  return stripped.startsWith("/dashboard");
}

function isLoginPath(pathname: string): boolean {
  const stripped = pathname.replace(/^\/(en|es)/, "") || "/";
  return stripped === "/login";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let next-intl handle locale routing first
  const intlResponse = intlMiddleware(request);

  // Skip auth check for static files, api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return intlResponse;
  }

  // Only check auth for protected routes and login page
  if (!isDashboardPath(pathname) && !isOnboardingPath(pathname) && !isLoginPath(pathname)) {
    return intlResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return intlResponse;

  let response = intlResponse || NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Detect locale from URL prefix; EN has no prefix (localePrefix: "as-needed")
  const localeMatch = pathname.match(/^\/(en|es)(\/|$)/)?.[1];
  const locale = localeMatch || "en";
  // For EN (default locale), omit the prefix — /login; for ES use /es/login
  const loginPath = locale === "en" ? "/login" : `/${locale}/login`;
  const loginUrl = new URL(loginPath, request.url);
  const dashboardUrl = new URL(locale === "en" ? "/dashboard" : `/${locale}/dashboard`, request.url);

  // Not authenticated → redirect to login
  if (!user && (isDashboardPath(pathname) || isOnboardingPath(pathname))) {
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated → redirect away from login
  if (user && isLoginPath(pathname)) {
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
