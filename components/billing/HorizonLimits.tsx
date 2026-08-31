"use client";

import { useTranslations } from "next-intl";
import { useHorizonLimits } from "@/lib/hooks/useHorizonLimits";
import type { PlanHorizon } from "@/lib/types";

interface Props {
  horizon: PlanHorizon;
  className?: string;
}

/**
 * What a pass grants, read from the API instead of written into the copy. A
 * non-breaking space holds the line while loading so cards do not jump.
 */
export function HorizonLimits({ horizon, className }: Props) {
  const t = useTranslations("pricing");
  const { data } = useHorizonLimits();
  const limits = data?.[horizon];

  return (
    <p className={className}>
      {limits
        ? t("limitsSummary", {
            profiles: limits.max_profiles,
            regions: limits.max_locations_per_profile,
            titles: limits.max_job_titles_per_profile,
          })
        : "\u00A0"}
    </p>
  );
}
