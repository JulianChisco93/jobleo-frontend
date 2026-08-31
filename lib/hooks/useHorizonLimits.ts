import { useQuery } from "@tanstack/react-query";
import { getHorizonLimits } from "@/lib/api";

export const HORIZON_LIMITS_QUERY = {
  queryKey: ["horizon-limits"],
  queryFn: getHorizonLimits,
  // Allowances only change with a backend release.
  staleTime: 60 * 60 * 1000,
} as const;

/**
 * Allowances for every pass, straight from the API. Needed because the pricing
 * copy and the downgrade warning describe passes the user does not own yet, so
 * `/searches/limits` (which only reports the current plan) cannot answer.
 */
export function useHorizonLimits() {
  return useQuery(HORIZON_LIMITS_QUERY);
}
