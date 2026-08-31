"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { getMe } from "@/lib/api";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";
import { hasLapsed } from "@/lib/plans";
import { hasPaidAccess, type SearchProfile } from "@/lib/types";

interface Props {
  profiles: SearchProfile[];
}

/**
 * When a pass lapses the backend drops the account to `free` and pauses every
 * search profile on its own. This explains that pause, so it does not look like
 * a manual one the user forgot about.
 */
export function PassExpiredNotice({ profiles }: Props) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const { limits, data: loadedLimits } = usePlanLimits();

  // Placeholder limits would misread a paid account as free while loading.
  if (!loadedLimits || hasPaidAccess(limits.plan)) return null;

  const pausedCount = profiles.filter((p) => !p.is_active).length;
  if (pausedCount === 0) return null;

  // A free user who paused a profile by hand should not see this. Either the
  // pass carries a past expiry date, or a profile is larger than free allows —
  // both mean these profiles were built while the account had paid access.
  const builtOnPaidPlan =
    profiles.length > limits.max_profiles ||
    profiles.some((p) => p.locations.length > limits.max_locations_per_profile);
  if (!hasLapsed(me?.plan_ends_at) && !builtOnPaidPlan) return null;

  return (
    <section className="mb-6 bg-error-container rounded-2xl px-5 md:px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex gap-4 min-w-0">
        <span
          className="material-symbols-outlined text-[22px] text-on-error-container flex-shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          pause_circle
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold text-on-error-container mb-1">
            {t("passExpiredTitle")}
          </p>
          <p className="text-sm text-on-error-container/80">
            {t("passExpiredBody", { count: pausedCount })}
          </p>
        </div>
      </div>
      <Link
        href={`${prefix}/pricing`}
        className="flex-shrink-0 self-start sm:self-auto px-6 py-2.5 text-sm font-bold text-on-error bg-error rounded-xl hover:brightness-110 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error"
      >
        {t("passExpiredCta")}
      </Link>
    </section>
  );
}
