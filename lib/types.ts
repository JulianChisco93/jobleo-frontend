/** `"paid"` is the current single paid tier. `"pro"`/`"premium"` are legacy monthly subscribers. */
export type Plan = "free" | "pro" | "premium" | "paid";

/** Duration of a prepaid pass. Only set when `plan === "paid"`. */
export type PlanHorizon = "7d" | "15d" | "1m" | "3m";

/** Legacy plans and the current paid tier all grant paid access. */
export function hasPaidAccess(plan: Plan | undefined | null): boolean {
  return plan === "paid" || plan === "pro" || plan === "premium";
}

/** Allowances a pass grants, as served by `/searches/limits/horizons`. */
export interface HorizonLimits {
  max_profiles: number;
  max_locations_per_profile: number;
  max_job_titles_per_profile: number;
}

export type HorizonLimitsCatalog = Record<PlanHorizon, HorizonLimits>;

export interface PlanLimits {
  plan: Plan;
  plan_horizon: PlanHorizon | null;
  max_profiles: number;
  max_job_titles_per_profile: number;
  max_locations_per_profile: number;
  business_hours_only_enforced: boolean;
}
/**
 * `trial` is our own free trial for a fresh signup; `trialing` is Stripe's.
 * Only `past_due` signals a real problem — `trial` and `canceled` are normal.
 */
export type SubscriptionStatus =
  | "active"
  | "trial"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export interface User {
  id: string;
  email: string;
  display_name?: string;
  whatsapp_number?: string;
  timezone?: string;
  created_at: string;
  plan?: Plan;
  plan_horizon?: PlanHorizon | null;
  plan_ends_at?: string | null;
  trial_ends_at?: string | null;
  subscription_status?: SubscriptionStatus;
  is_admin?: boolean;
}

export interface CV {
  id: number;
  search_config_id: number;
  filename: string;
  uploaded_at: string;
  updated_at: string;
}

export type AlertSensitivity = "broad" | "balanced" | "strict";

// ─── Regions ──────────────────────────────────────────────────────────────────

export interface Region {
  /** `"<PROVINCE>:<REGION>"`, e.g. `"ON:NIAGARA"` — searches every city in the region. */
  code: string;
  name: string;
  cities: string[];
}

export interface Province {
  /** Province code, e.g. `"ON"` — searches the whole province as a single term. */
  code: string;
  name: string;
  regions: Region[];
}

/** Keyed by province code. */
export type RegionsCatalog = Record<string, Province>;

export interface SearchProfile {
  id: string;
  name: string;
  profession: string;
  country?: string;
  job_titles: string[];
  /** Region codes. Profiles created before the region catalog may still hold free text. */
  locations: string[];
  include_terms: string[];
  exclude_terms: string[];
  frequency_minutes: number;
  business_hours_only: boolean;
  business_hours_start?: string;
  business_hours_end?: string;
  business_days_only: boolean;
  is_active: boolean;
  alert_sensitivity: AlertSensitivity;
  created_at: string;
  updated_at: string;
}

export interface SearchProfileLog {
  id: string;
  search_config_id: string;
  jobs_found: number;
  ran_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  job_url: string;
  site?: string;
  is_remote?: boolean;
  /** Internal matching score. Not shown to users; use `score_percentage`. */
  score: number;
  /** Affinity percentage computed by the API. Capped at 99. */
  score_percentage?: number | null;
  matched_keywords?: string[];
  date_posted?: string;
  date_scraped?: string;
}

export interface JobAlert {
  id: number;
  /** Internal matching score. Not shown to users; use `match_score_percentage`. */
  match_score: number;
  /** Affinity percentage computed by the API. Capped at 99. */
  match_score_percentage?: number | null;
  sent_at: string;
  search_config_id?: string;
  ai_explanation?: string | null;
  job: {
    title: string;
    company: string;
    location: string;
    job_url: string;
    site?: string;
    is_remote?: boolean;
  };
}

export interface ConfigAnalysis {
  config_id: number;
  analysis: string;
}

export interface CreateSearchProfilePayload {
  name: string;
  profession: string;
  country?: string;
  job_titles: string[];        // max 5, puede ser []
  locations: string[];         // mínimo 1 código de región; la API rechaza texto libre
  include_terms: string[];     // puede ser []
  exclude_terms: string[];     // puede ser []
  title_exclude_terms: string[]; // puede ser []
  frequency_minutes: number;
  business_hours_only: boolean;
  business_hours_start: number; // int 0-23
  business_hours_end: number;   // int 0-23
  business_days_only: boolean;
  alert_sensitivity: AlertSensitivity;
}

export interface CreateCVPayload {
  extracted_text: string; // mínimo 200 chars, máximo 50,000
  filename?: string;
}

export type Locale = "en" | "es";

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminMetrics {
  mrr_usd: number;
  users: {
    total: number;
    by_plan: { free: number; pro: number; premium: number };
  };
  alerts: { today: number; this_week: number };
  searches: { today: number; this_week: number };
  recent_errors_in_log: number;
  timestamp: string;
}

export interface AdminServerStatus {
  status: string;
  uptime_seconds: number;
  cpu_percent: number;
  memory: { total_gb: number; used_gb: number; percent: number };
  disk: { total_gb: number; used_gb: number; free_gb: number; percent: number };
  process: { pid: number; memory_mb: number; threads: number };
  timestamp: string;
}

export interface AdminUser {
  id: number;
  email: string;
  display_name?: string | null;
  plan: Plan;
  plan_horizon?: PlanHorizon | null;
  plan_ends_at?: string | null;
  is_active: boolean;
  is_admin: boolean;
  subscription_status: string;
  whatsapp_number?: string;
  created_at: string;
  alerts_count: number;
  configs_count: number;
  last_alert_at?: string;
}

export interface AdminUsersResponse {
  total: number;
  users: AdminUser[];
}

export interface AdminSearchLog {
  id: number;
  user_id: number;
  email: string;
  search_config_id: number;
  site: string;
  search_term: string;
  location: string;
  results_raw: number;
  results_after_filters: number;
  new_jobs_inserted: number;
  ran_at: string;
}

export interface AdminSearchLogsResponse {
  total_returned: number;
  logs: AdminSearchLog[];
}

export interface SchedulerJob {
  id: string;
  name: string;
  next_run_at: string;
}

export interface SchedulerStatusResponse {
  status: string;
  jobs: SchedulerJob[];
}

export interface ServerLogsResponse {
  lines: string[];
  total_returned: number;
  log_file: string;
}

// ─── Company Watches ─────────────────────────────────────────────────────────

export interface CompanyWatch {
  id: number;
  company_name: string;
  url: string;
  job_title_keywords: string[];
  frequency_hours: number;
  ats_type: string | null;
  known_job_urls: string[];
  last_checked_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CompanyWatchTestResult {
  ats_type: string | null;
  jobs_found: number;
  jobs: { title: string; job_url: string; location: string; company: string }[];
  error: string | null;
}

export interface CreateCompanyWatchPayload {
  company_name: string;
  url: string;
  job_title_keywords?: string[];
}
