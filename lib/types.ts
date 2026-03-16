export interface User {
  id: string;
  email: string;
  display_name?: string;
  whatsapp_number?: string;
  timezone?: string;
  created_at: string;
}

export interface CV {
  id: string;
  filename: string;
  created_at: string;
}

export interface SearchProfile {
  id: string;
  name: string;
  profession: string;
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
  id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  job_url: string;
  description?: string;
  job_type?: string;
  is_remote?: boolean;
  date_sent: string;
  search_config_id: string;
  skills?: string[];
}

export interface CreateSearchProfilePayload {
  name: string;
  profession: string;
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
}

export interface CreateCVPayload {
  extracted_text: string; // mínimo 200 chars, máximo 50,000
  filename?: string;
}

export type Locale = "en" | "es";
