import { http, HttpResponse } from "msw";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.jobleo.app";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  display_name: "Test User",
  whatsapp_number: "+14155552671",
  timezone: "UTC",
  created_at: "2024-01-01T00:00:00Z",
};

export const mockCV = {
  id: 1,
  search_config_id: 42,
  filename: "resume.pdf",
  uploaded_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockProfile = {
  id: "profile-1",
  name: "Software Engineer",
  profession: "Engineering",
  job_titles: ["Backend Dev", "SWE"],
  locations: ["New York"],
  include_terms: ["TypeScript"],
  exclude_terms: ["PHP"],
  frequency_minutes: 60,
  business_hours_only: false,
  business_hours_start: "09:00",
  business_hours_end: "18:00",
  business_days_only: false,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
};

export const mockRegions = {
  ON: {
    code: "ON",
    name: "Ontario",
    regions: [
      {
        code: "ON:GTA",
        name: "Greater Toronto Area (GTA)",
        cities: ["Toronto, ON", "Mississauga, ON"],
      },
      {
        code: "ON:NIAGARA",
        name: "Niagara Region",
        cities: ["Niagara Falls, ON", "St. Catharines, ON"],
      },
    ],
  },
};

export const mockLimits = {
  plan: "paid",
  plan_horizon: "1m",
  max_profiles: 2,
  max_job_titles_per_profile: 5,
  max_locations_per_profile: 2,
  business_hours_only_enforced: false,
};

export const mockHorizonLimits = {
  "7d": { max_profiles: 1, max_locations_per_profile: 1, max_job_titles_per_profile: 5 },
  "15d": { max_profiles: 1, max_locations_per_profile: 1, max_job_titles_per_profile: 5 },
  "1m": { max_profiles: 2, max_locations_per_profile: 2, max_job_titles_per_profile: 5 },
  "3m": { max_profiles: 2, max_locations_per_profile: 2, max_job_titles_per_profile: 5 },
};

export const mockJob = {
  id: "job-1",
  title: "Senior Software Engineer",
  company: "Tech Corp",
  location: "New York",
  match_score: 21.1,
  match_score_percentage: 77,
  job_url: "https://example.com/job/1",
  description: "A great opportunity for a senior engineer.",
  job_type: "Full-time",
  is_remote: false,
  date_sent: "2024-01-01T00:00:00Z",
  search_config_id: "profile-1",
  skills: ["TypeScript", "React", "Node.js"],
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // Users
  http.get(`${BASE_URL}/api/v1/users/me`, () =>
    HttpResponse.json(mockUser)
  ),

  http.patch(`${BASE_URL}/api/v1/users/me`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),

  // CV
  http.get(`${BASE_URL}/api/v1/cv/`, () =>
    HttpResponse.json(mockCV)
  ),

  http.post(`${BASE_URL}/api/v1/cv/upload`, () =>
    HttpResponse.json({ ...mockCV, filename: "uploaded.pdf" })
  ),

  http.post(`${BASE_URL}/api/v1/cv/text`, async ({ request }) => {
    const body = await request.json() as { filename?: string };
    return HttpResponse.json({ ...mockCV, filename: body.filename ?? "resume.txt" });
  }),

  http.delete(`${BASE_URL}/api/v1/cv/`, () =>
    new HttpResponse(null, { status: 204 })
  ),

  // Search Profiles
  http.get(`${BASE_URL}/api/v1/searches/`, () =>
    HttpResponse.json([mockProfile])
  ),

  http.post(`${BASE_URL}/api/v1/searches/`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockProfile, id: "profile-new", ...body });
  }),

  // Declared before `/searches/:id` so these fixed paths win the match
  http.get(`${BASE_URL}/api/v1/searches/regions`, () =>
    HttpResponse.json(mockRegions)
  ),

  http.get(`${BASE_URL}/api/v1/searches/limits/horizons`, () =>
    HttpResponse.json(mockHorizonLimits)
  ),

  http.get(`${BASE_URL}/api/v1/searches/limits`, () =>
    HttpResponse.json(mockLimits)
  ),

  http.get(`${BASE_URL}/api/v1/searches/:id`, ({ params }) =>
    HttpResponse.json({ ...mockProfile, id: params.id as string })
  ),

  http.patch(`${BASE_URL}/api/v1/searches/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockProfile, id: params.id as string, ...body });
  }),

  http.delete(`${BASE_URL}/api/v1/searches/:id`, () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get(`${BASE_URL}/api/v1/searches/:id/logs`, ({ params }) =>
    HttpResponse.json([
      {
        id: "log-1",
        search_config_id: params.id,
        jobs_found: 5,
        ran_at: "2024-01-01T12:00:00Z",
      },
    ])
  ),

  // Jobs
  http.get(`${BASE_URL}/api/v1/jobs/`, () =>
    HttpResponse.json([mockJob])
  ),

  http.get(`${BASE_URL}/api/v1/jobs/alerts`, () =>
    HttpResponse.json([mockJob])
  ),

  http.get(`${BASE_URL}/api/v1/jobs/:id`, ({ params }) =>
    HttpResponse.json({ ...mockJob, id: params.id as string })
  ),

  // Billing
  http.post(`${BASE_URL}/api/v1/billing/checkout`, ({ request }) => {
    const horizon = new URL(request.url).searchParams.get("horizon");
    return HttpResponse.json({
      url: `https://checkout.stripe.com/session-${horizon}`,
      upgraded: false,
    });
  }),

  http.post(`${BASE_URL}/api/v1/billing/portal`, () =>
    HttpResponse.json({ url: "https://billing.stripe.com/portal" })
  ),
];
