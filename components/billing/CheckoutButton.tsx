"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ApiError, createCheckoutSession, getSearchProfiles } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { getHorizonOption, setPendingHorizon } from "@/lib/plans";
import { HORIZON_LIMITS_QUERY } from "@/lib/hooks/useHorizonLimits";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { PlanHorizon } from "@/lib/types";

interface Props {
  label: string;
  horizon: PlanHorizon;
  className?: string;
  /** When provided, the caller renders the error instead of the inline fallback. */
  onError?: (message: string) => void;
}

interface Downgrade {
  profiles: number;
  regions: number;
  allowedProfiles: number;
  allowedRegions: number;
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function CheckoutButton({ label, horizon, className, onError }: Props) {
  const t = useTranslations("billing");
  const tp = useTranslations("pricing");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downgrade, setDowngrade] = useState<Downgrade | null>(null);

  const option = getHorizonOption(horizon);

  function reportError(message: string) {
    if (onError) onError(message);
    else setError(message);
  }

  /**
   * Buying a shorter pass keeps the remaining time but drops the allowances to
   * the new horizon, and the API does not trim what is already saved. Warn
   * before charging so the drop is not a surprise.
   */
  async function findDowngrade(): Promise<Downgrade | null> {
    try {
      const [profiles, horizonLimits] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: ["profiles"],
          queryFn: getSearchProfiles,
          staleTime: 60 * 1000,
        }),
        queryClient.fetchQuery(HORIZON_LIMITS_QUERY),
      ]);
      const allowed = horizonLimits[horizon];
      if (!allowed) return null;
      const regions = Math.max(0, ...profiles.map((p) => p.locations.length));
      if (
        profiles.length > allowed.max_profiles ||
        regions > allowed.max_locations_per_profile
      ) {
        return {
          profiles: profiles.length,
          regions,
          allowedProfiles: allowed.max_profiles,
          allowedRegions: allowed.max_locations_per_profile,
        };
      }
      return null;
    } catch {
      // Signed-out visitors cannot be checked; checkout handles the redirect.
      return null;
    }
  }

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(horizon);
      if (!url) {
        reportError(t("checkoutNoUrl"));
        return;
      }
      window.location.href = url;
    } catch (err) {
      if (err instanceof ApiError && err.isAuthError) {
        window.location.href = "/login";
        return;
      }
      // The API writes details for the user only on 403 (plan limits) and 422
      // (validation). Anything else is a server trace — it can carry a Stripe
      // id or stack — so it goes to the log and the user reads the generic copy.
      if (err instanceof ApiError && !err.isForbidden && err.status !== 422) {
        console.error("checkout failed", err.status, err.message);
        reportError(t("checkoutFailed"));
        return;
      }
      reportError(err instanceof Error ? err.message : t("checkoutFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleClick() {
    setLoading(true);
    // The pricing page is public but checkout needs a token, so a visitor
    // without an account goes to signup with the pass remembered for step 4
    // rather than getting the API's "Not authenticated" back.
    const {
      data: { session },
    } = await createClient().auth.getSession();
    if (!session) {
      setPendingHorizon(horizon);
      router.push("/login?tab=register");
      return;
    }
    const found = await findDowngrade();
    setLoading(false);
    if (found) {
      setDowngrade(found);
      return;
    }
    await startCheckout();
  }

  return (
    <>
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
          </span>
        ) : (
          label
        )}
      </button>
      {error && !onError && (
        <p className="text-xs text-error font-medium">{error}</p>
      )}
      <ConfirmDialog
        isOpen={downgrade !== null}
        title={t("downgradeTitle")}
        message={t("downgradeMessage", {
          horizon: tp(`horizon${option.messageKey}Name`),
          profiles: downgrade?.allowedProfiles ?? 0,
          regions: downgrade?.allowedRegions ?? 0,
          currentProfiles: downgrade?.profiles ?? 0,
          currentRegions: downgrade?.regions ?? 0,
        })}
        confirmLabel={t("downgradeConfirm")}
        cancelLabel={t("downgradeCancel")}
        onCancel={() => setDowngrade(null)}
        onConfirm={() => {
          setDowngrade(null);
          void startCheckout();
        }}
      />
    </>
  );
}
