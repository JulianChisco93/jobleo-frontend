"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

/**
 * The API owns `display_name` now, but accounts created before that only carry
 * it in Supabase metadata, so read that as a fallback until the user saves it
 * from settings. Falls back further to the email handle.
 */
export function useDisplayName(): string {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const [fromSupabase, setFromSupabase] = useState("");

  const apiName = me?.display_name;

  useEffect(() => {
    if (apiName) return;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return;
        setFromSupabase(
          user.user_metadata?.display_name || user.email?.split("@")[0] || ""
        );
      });
  }, [apiName]);

  return apiName || fromSupabase;
}
