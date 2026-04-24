import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Email confirmation route that works cross-device and cross-browser.
// Uses verifyOtp({ token_hash, type }) — purely server-side, no PKCE code_verifier needed.
// Triggered by the Supabase email template link:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type"); // "signup" | "recovery" | "magiclink"
  const next = searchParams.get("next") ?? "/onboarding";

  if (token_hash && type) {
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

    const { error } = await supabase.auth.verifyOtp({ token_hash, type } as any);
    if (!error) {
      // Decide redirect: onboarding for new users, dashboard for returning users with a CV
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cv/`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const cv = res.ok ? await res.json() : null;
          return NextResponse.redirect(`${origin}${cv ? "/dashboard" : "/onboarding"}`);
        } catch {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/confirm] verifyOtp error:", error?.message);
    const msg = encodeURIComponent(error?.message ?? "Invalid or expired confirmation link");
    return NextResponse.redirect(`${origin}/login?error=auth&msg=${msg}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth&msg=missing_token`);
}
