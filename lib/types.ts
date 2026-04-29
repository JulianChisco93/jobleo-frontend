export type Plan = "free" | "pro" | "premium";

export interface PlanLimits {
  plan: Plan;
  max_profiles: number;
  max_job_titles_per_profile: number;
  max_locations_per_profile: number;
  business_hours_only_enforced: boolean;
}
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete";

export interface User {
  id: string;
  email: string;
  display_name?: string;
  whatsapp_number?: string;
  timezone?: string;
  created_at: string;
  plan?: Plan;
  subscription_status?: SubscriptionStatus;
  is_admin?: boolean;
}

export interface CV {
  id: string;
  filename: string;
  created_at: string;
}

export type AlertSensitivity = "broad" | "balanced" | "strict";

export interface SearchProfile {
  id: string;
  name: string;
  profession: string;
  country?: string;
  job_titles: string[];
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
  score: number;
  matched_keywords?: string[];
  date_posted?: string;
  date_scraped?: string;
}

export interface JobAlert {
  id: number;
  match_score: number;
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
  locations: string[];         // mínimo 1 elemento
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
  plan: Plan;
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
