import { parseApiDate } from "./utils";
import type { PlanHorizon } from "./types";

export interface HorizonOption {
  horizon: PlanHorizon;
  /** Price in USD, one-time. Passes do not auto-renew. */
  price: number;
  /** Days of access granted by the pass. */
  days: number;
  /** Suffix for the `pricing.horizon*` message keys. */
  messageKey: "7d" | "15d" | "1m" | "3m";
}

/**
 * Profile and region allowances are deliberately absent: they come from
 * `/searches/limits/horizons` so the copy cannot drift from what the API grants.
 */
export const HORIZON_OPTIONS: readonly HorizonOption[] = [
  { horizon: "7d", price: 5, days: 7, messageKey: "7d" },
  { horizon: "15d", price: 9, days: 15, messageKey: "15d" },
  { horizon: "1m", price: 15, days: 30, messageKey: "1m" },
  { horizon: "3m", price: 45, days: 90, messageKey: "3m" },
] as const;

export const RECOMMENDED_HORIZON: PlanHorizon = "1m";

export function getHorizonOption(horizon: PlanHorizon): HorizonOption {
  return HORIZON_OPTIONS.find((o) => o.horizon === horizon) ?? HORIZON_OPTIONS[2];
}

/**
 * Whole days left before a pass expires, or `null` when there is no expiry.
 * Returns 0 for a pass that already lapsed.
 */
export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = parseApiDate(dateStr);
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

/** True when a pass expiry date is already in the past. */
export function hasLapsed(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const target = parseApiDate(dateStr);
  return !Number.isNaN(target) && target < Date.now();
}
