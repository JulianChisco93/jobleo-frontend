import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const cookieStore = await cookies();
  const cookiesToForward: ResponseCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(setCookies) {
          setCookies.forEach(({ name, value, options }) => {
            cookiesToForward.push({ name, value, ...options } as ResponseCookie);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=auth&msg=oauth_init_failed`);
  }

  const response = NextResponse.redirect(data.url);

  // Set the code_verifier and any other auth cookies on the redirect response
  cookiesToForward.forEach(({ name, value, ...options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
