"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Handles the ?code= parameter that Supabase sometimes drops on the
 * Site URL instead of the /auth/callback route (e.g. when the redirect
 * URL isn't matched exactly). Exchanges the code for a session and
 * redirects to /dashboard.
 */
export function AuthCodeHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // Redirect to the server-side callback handler so it can read the
    // PKCE verifier from cookies (client-side exchange is unreliable with @supabase/ssr).
    window.location.href = `/auth/callback?code=${encodeURIComponent(code)}`;
  }, [searchParams]);

  return null;
}
