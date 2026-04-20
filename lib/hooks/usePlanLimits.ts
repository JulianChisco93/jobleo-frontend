import { useQuery } from "@tanstack/react-query";
import { getLimits } from "@/lib/api";
import type { PlanLimits } from "@/lib/types";

const FREE_LIMITS: PlanLimits = {
  plan: "free",
  max_profiles: 1,
  max_job_titles_per_profile: 0,
  max_locations_per_profile: 2,
  business_hours_only_enforced: false,
};

export function usePlanLimits() {
  const query = useQuery({
    queryKey: ["plan-limits"],
    queryFn: getLimits,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    limits: query.data ?? FREE_LIMITS,
  };
}
