import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let destination = next;
      if (next === "/dashboard") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cv/`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const cv = res.ok ? await res.json() : null;
            destination = cv ? "/dashboard" : "/onboarding";
          } catch {
            destination = "/onboarding";
          }
        }
      }
      return NextResponse.redirect(`${origin}${destination}`);
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error?.message, error?.status);
    // PKCE verifier missing → user opened the link in a different browser/device
    if (error?.message?.toLowerCase().includes("pkce") || error?.message?.toLowerCase().includes("code verifier")) {
      return NextResponse.redirect(`${origin}/login?error=pkce`);
    }
    const msg = encodeURIComponent(error?.message ?? "Unknown error");
    return NextResponse.redirect(`${origin}/login?error=auth&msg=${msg}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth&msg=no_code`);
}
