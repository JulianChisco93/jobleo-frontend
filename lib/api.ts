import { createClient } from "./supabase/client";
import type {
  User,
  CV,
  SearchProfile,
  SearchProfileLog,
  Job,
  CreateSearchProfilePayload,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jobleo.app";

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
    throw new Error(err || `Request failed: ${res.status}`);
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

export const getCV = () => request<CV | null>("/api/v1/cv/");

export const uploadCVFile = async (file: File): Promise<CV> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/v1/cv/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const uploadCVText = (extracted_text: string, filename: string) =>
  request<CV>("/api/v1/cv/text", {
    method: "POST",
    body: JSON.stringify({ extracted_text, filename }),
  });

export const deleteCV = () =>
  request<void>("/api/v1/cv/", { method: "DELETE" });

// ─── Search Profiles ─────────────────────────────────────────────────────────

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

export const getJob = (id: string) => request<Job>(`/api/v1/jobs/${id}`);

export const getJobAlerts = () => request<Job[]>("/api/v1/jobs/alerts");
