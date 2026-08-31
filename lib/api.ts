import { createClient } from "./supabase/client";
import type {
  User,
  CV,
  SearchProfile,
  SearchProfileLog,
  Job,
  JobAlert,
  ConfigAnalysis,
  CreateSearchProfilePayload,
  PlanLimits,
  PlanHorizon,
  HorizonLimitsCatalog,
  RegionsCatalog,
  Plan,
  AdminMetrics,
  AdminServerStatus,
  AdminUser,
  AdminUsersResponse,
  AdminSearchLogsResponse,
  SchedulerStatusResponse,
  ServerLogsResponse,
  CompanyWatch,
  CompanyWatchTestResult,
  CreateCompanyWatchPayload,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jobleo.app";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** Only 401 means the session is gone. */
  get isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * 403 covers plan limits ("Tu plan Free permite máximo 1 locación(es).") and
   * admin-only endpoints, so it must never send the user back to login.
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }
}

/** FastAPI reports validation errors as `{ detail: [{ msg }] }` and aborts as `{ detail: "..." }`. */
function extractErrorMessage(body: string, status: number): string {
  if (!body) return `Request failed: ${status}`;
  try {
    const parsed = JSON.parse(body);
    const detail = parsed?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((d: { msg?: string }) => d?.msg)
        .filter((m): m is string => typeof m === "string" && m.length > 0)
        // Pydantic prefixes value errors with "Value error, "
        .map((m) => m.replace(/^Value error,\s*/, ""));
      if (messages.length > 0) return messages.join(" ");
    }
  } catch {
    // Not JSON — fall through to the raw body
  }
  return body;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new ApiError(res.status, extractErrorMessage(err, res.status));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const getMe = () => request<User>("/api/v1/users/me");

export const updateMe = (data: Partial<Pick<User, "whatsapp_number" | "timezone" | "display_name">>) =>
  request<User>("/api/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ─── CV ──────────────────────────────────────────────────────────────────────

export const getCV = (searchConfigId: string) =>
  request<CV | null>(`/api/v1/cv/?search_config_id=${searchConfigId}`);

export const uploadCVFile = async (file: File, searchConfigId: string): Promise<CV> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/v1/cv/upload?search_config_id=${searchConfigId}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const uploadCVText = (extracted_text: string, filename: string, searchConfigId: string) =>
  request<CV>(`/api/v1/cv/text?search_config_id=${searchConfigId}`, {
    method: "POST",
    body: JSON.stringify({ extracted_text, filename }),
  });

export const deleteCV = (searchConfigId: string) =>
  request<void>(`/api/v1/cv/?search_config_id=${searchConfigId}`, { method: "DELETE" });

// ─── Search Profiles ─────────────────────────────────────────────────────────

export const getLimits = () =>
  request<PlanLimits>("/api/v1/searches/limits");

/** Allowances for all four passes, so a purchase can be described before buying. */
export const getHorizonLimits = () =>
  request<HorizonLimitsCatalog>("/api/v1/searches/limits/horizons");

export const getRegions = () =>
  request<RegionsCatalog>("/api/v1/searches/regions");

export const getSearchProfiles = () =>
  request<SearchProfile[]>("/api/v1/searches/");

export const createSearchProfile = (data: CreateSearchProfilePayload) =>
  request<SearchProfile>("/api/v1/searches/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getSearchProfile = (id: string) =>
  request<SearchProfile>(`/api/v1/searches/${id}`);

export const updateSearchProfile = (
  id: string,
  data: Partial<CreateSearchProfilePayload & { is_active: boolean }>
) =>
  request<SearchProfile>(`/api/v1/searches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSearchProfile = (id: string) =>
  request<void>(`/api/v1/searches/${id}`, { method: "DELETE" });

export const getSearchProfileLogs = (id: string) =>
  request<SearchProfileLog[]>(`/api/v1/searches/${id}/logs`);

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export interface JobsQuery {
  min_score?: number;
  limit?: number;
  offset?: number;
  search_config_id?: string;
}

export const getJobs = (params: JobsQuery = {}) => {
  const qs = new URLSearchParams();
  if (params.min_score !== undefined) qs.set("min_score", String(params.min_score));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  if (params.search_config_id) qs.set("search_config_id", params.search_config_id);
  return request<Job[]>(`/api/v1/jobs/?${qs.toString()}`);
};

export const getJobAlerts = (params: Pick<JobsQuery, "limit" | "offset" | "search_config_id"> = {}) => {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  if (params.search_config_id) qs.set("search_config_id", params.search_config_id);
  return request<JobAlert[]>(`/api/v1/jobs/alerts?${qs.toString()}`);
};

export const generateJobExplanation = (jobAlertId: number) =>
  request<JobAlert>(`/api/v1/jobs/${jobAlertId}/explanation`, { method: "POST" });

export const analyzeSearchConfig = (configId: string, profile?: Pick<SearchProfile, "profession" | "country" | "job_titles" | "locations" | "include_terms" | "exclude_terms" | "alert_sensitivity">) =>
  request<ConfigAnalysis>(`/api/v1/searches/${configId}/analyze`, {
    method: "POST",
    body: JSON.stringify(profile ?? {}),
  });

// ─── Billing ──────────────────────────────────────────────────────────────────

export const createCheckoutSession = (horizon: PlanHorizon) =>
  request<{ url: string | null; upgraded: boolean }>(
    `/api/v1/billing/checkout?horizon=${horizon}`,
    { method: "POST" }
  );

export const createPortalSession = () =>
  request<{ url: string }>("/api/v1/billing/portal", { method: "POST" });

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAdminMetrics = () =>
  request<AdminMetrics>("/api/v1/admin/metrics");

export const getAdminServer = () =>
  request<AdminServerStatus>("/api/v1/admin/server");

export const restartServer = () =>
  request<{ status: string }>("/api/v1/admin/server/restart", { method: "POST" });

export const getServerLogs = (lines = 200, filter?: string) => {
  const qs = new URLSearchParams({ lines: String(lines) });
  if (filter) qs.set("filter", filter);
  return request<ServerLogsResponse>(`/api/v1/admin/server/logs?${qs.toString()}`);
};

export const getAdminUsers = () =>
  request<AdminUsersResponse>("/api/v1/admin/users");

export const updateUserPlan = (
  id: number,
  plan: Plan,
  options: { horizon?: PlanHorizon; days?: number } = {}
) => {
  const qs = new URLSearchParams({ plan });
  if (options.horizon) qs.set("horizon", options.horizon);
  if (options.days !== undefined) qs.set("days", String(options.days));
  return request<AdminUser>(`/api/v1/admin/users/${id}/plan?${qs.toString()}`, {
    method: "PATCH",
  });
};

export const deleteAdminUser = (id: number) =>
  request<{ deleted: boolean; user_id: number; email: string }>(
    `/api/v1/admin/users/${id}`,
    { method: "DELETE" }
  );

export const getSearchLogs = (limit = 100, userId?: number) => {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (userId !== undefined) qs.set("user_id", String(userId));
  return request<AdminSearchLogsResponse>(`/api/v1/admin/search-logs?${qs.toString()}`);
};

export const getSchedulerStatus = () =>
  request<SchedulerStatusResponse>("/api/v1/admin/scheduler");

// ─── Company Watches ─────────────────────────────────────────────────────────

export const getCompanyWatches = () =>
  request<CompanyWatch[]>("/api/v1/company-watches/");

export const createCompanyWatch = (data: CreateCompanyWatchPayload) =>
  request<CompanyWatch>("/api/v1/company-watches/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCompanyWatch = (
  id: number,
  data: Partial<Pick<CompanyWatch, "company_name" | "job_title_keywords" | "is_active">>
) =>
  request<CompanyWatch>(`/api/v1/company-watches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteCompanyWatch = (id: number) =>
  request<void>(`/api/v1/company-watches/${id}`, { method: "DELETE" });

export const checkCompanyWatch = (id: number) =>
  request<{ message: string }>(`/api/v1/company-watches/${id}/check`, {
    method: "POST",
  });

export const testCompanyWatchUrl = (url: string) =>
  request<CompanyWatchTestResult>("/api/v1/company-watches/test", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
