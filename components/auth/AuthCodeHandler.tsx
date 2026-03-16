"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles the ?code= parameter that Supabase sometimes drops on the
 * Site URL instead of the /auth/callback route (e.g. when the redirect
 * URL isn't matched exactly). Exchanges the code for a session and
 * redirects to /dashboard.
 */
export function AuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (!error) {
        router.replace("/dashboard");
      } else {
        console.error("[AuthCodeHandler] exchangeCodeForSession error:", error.message, error);
        router.replace(`/login?error=auth&msg=${encodeURIComponent(error.message)}`);
      }
    });
  }, [searchParams, router]);

  return null;
}
