import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { mockUser, mockCV, mockProfile, mockJob } from "@/test/msw/handlers";

// Mock Supabase client before importing the API module
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "mock-token-abc" } },
      }),
    },
  }),
}));

// Lazy import after mocks are set up
const apiImport = () => import("@/lib/api");

const BASE_URL = "https://api.jobleo.app";

// ─── Users ────────────────────────────────────────────────────────────────────

describe("getMe", () => {
  it("returns the current user", async () => {
    const { getMe } = await apiImport();
    const user = await getMe();
    expect(user.id).toBe("user-1");
    expect(user.email).toBe("test@example.com");
    expect(user.display_name).toBe("Test User");
  });

  it("throws on non-200 response", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/users/me`, () =>
        new HttpResponse("Unauthorized", { status: 401 })
      )
    );
    const { getMe } = await apiImport();
    await expect(getMe()).rejects.toThrow("Unauthorized");
  });

  it("throws with status message when body is empty", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/users/me`, () =>
        new HttpResponse("", { status: 500 })
      )
    );
    const { getMe } = await apiImport();
    await expect(getMe()).rejects.toThrow("Request failed: 500");
  });
});

describe("updateMe", () => {
  it("sends a PATCH and returns updated user", async () => {
    const { updateMe } = await apiImport();
    const updated = await updateMe({ display_name: "New Name" });
    expect(updated.display_name).toBe("New Name");
  });

  it("merges partial fields (timezone only)", async () => {
    const { updateMe } = await apiImport();
    const updated = await updateMe({ timezone: "America/New_York" });
    expect(updated.timezone).toBe("America/New_York");
  });
});

// ─── CV ───────────────────────────────────────────────────────────────────────

describe("getCV", () => {
  it("returns the current CV", async () => {
    const { getCV } = await apiImport();
    const cv = await getCV("42");
    expect(cv).not.toBeNull();
    expect(cv?.id).toBe(1);
    expect(cv?.filename).toBe("resume.pdf");
  });

  it("returns null when no CV exists (204)", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/cv/`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );
    const { getCV } = await apiImport();
    const cv = await getCV("42");
    expect(cv).toBeUndefined();
  });
});

describe("uploadCVText", () => {
  it("posts extracted text and returns a CV object", async () => {
    const { uploadCVText } = await apiImport();
    const cv = await uploadCVText("a".repeat(300), "my-cv.txt", "42");
    expect(cv.filename).toBe("my-cv.txt");
  });
});

describe("deleteCV", () => {
  it("resolves without a return value (204)", async () => {
    const { deleteCV } = await apiImport();
    const result = await deleteCV("42");
    expect(result).toBeUndefined();
  });

  it("throws on failure", async () => {
    server.use(
      http.delete(`${BASE_URL}/api/v1/cv/`, () =>
        new HttpResponse("Forbidden", { status: 403 })
      )
    );
    const { deleteCV } = await apiImport();
    await expect(deleteCV("42")).rejects.toThrow("Forbidden");
  });
});

// ─── Search Profiles ──────────────────────────────────────────────────────────

describe("getSearchProfiles", () => {
  it("returns an array of profiles", async () => {
    const { getSearchProfiles } = await apiImport();
    const profiles = await getSearchProfiles();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles[0].id).toBe("profile-1");
    expect(profiles[0].name).toBe("Software Engineer");
  });
});

describe("createSearchProfile", () => {
  it("posts payload and returns the new profile", async () => {
    const { createSearchProfile } = await apiImport();
    const payload = {
      name: "Design",
      profession: "Designer",
      job_titles: ["UX Designer"],
      locations: ["ON:GTA"],
      include_terms: [],
      exclude_terms: [],
      title_exclude_terms: [],
      frequency_minutes: 30,
      business_hours_only: false,
      business_hours_start: 9,
      business_hours_end: 18,
      business_days_only: false,
      alert_sensitivity: "broad" as const,
    };
    const profile = await createSearchProfile(payload);
    expect(profile.id).toBe("profile-new");
    expect(profile.name).toBe("Design");
  });

  it("surfaces the API message when locations are not valid region codes", async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/searches/`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ["body", "locations"],
                msg: "Value error, Ubicación(es) inválida(s): Toronto. Usa GET /searches/regions.",
                type: "value_error",
              },
            ],
          },
          { status: 422 }
        )
      )
    );
    const { createSearchProfile, ApiError } = await apiImport();
    const payload = {
      name: "Design",
      profession: "Designer",
      job_titles: [],
      locations: ["Toronto"],
      include_terms: [],
      exclude_terms: [],
      title_exclude_terms: [],
      frequency_minutes: 60,
      business_hours_only: false,
      business_hours_start: 9,
      business_hours_end: 18,
      business_days_only: false,
      alert_sensitivity: "broad" as const,
    };
    // The "Value error, " prefix is stripped so the message can be shown as-is
    await expect(createSearchProfile(payload)).rejects.toThrow(
      "Ubicación(es) inválida(s): Toronto. Usa GET /searches/regions."
    );
    await expect(createSearchProfile(payload)).rejects.toBeInstanceOf(ApiError);
  });
});

// ─── Regions ──────────────────────────────────────────────────────────────────

describe("getRegions", () => {
  it("returns the province → region → city catalog", async () => {
    const { getRegions } = await apiImport();
    const catalog = await getRegions();
    expect(catalog.ON.name).toBe("Ontario");
    expect(catalog.ON.regions.map((r) => r.code)).toEqual(["ON:GTA", "ON:NIAGARA"]);
    expect(catalog.ON.regions[0].cities).toContain("Toronto, ON");
  });
});

// ─── Plan limits ──────────────────────────────────────────────────────────────

describe("getLimits", () => {
  it("returns the plan limits including the pass horizon", async () => {
    const { getLimits } = await apiImport();
    const limits = await getLimits();
    expect(limits.plan).toBe("paid");
    expect(limits.plan_horizon).toBe("1m");
    expect(limits.max_locations_per_profile).toBe(2);
  });
});

describe("getHorizonLimits", () => {
  it("returns the allowances of every pass so copy is not hardcoded", async () => {
    const { getHorizonLimits } = await apiImport();
    const catalog = await getHorizonLimits();
    expect(Object.keys(catalog)).toEqual(["7d", "15d", "1m", "3m"]);
    expect(catalog["7d"].max_locations_per_profile).toBe(1);
    expect(catalog["3m"].max_profiles).toBe(2);
  });
});

// ─── Billing ──────────────────────────────────────────────────────────────────

describe("createCheckoutSession", () => {
  it("sends the pass duration as the horizon query param", async () => {
    let capturedUrl = "";
    server.use(
      http.post(`${BASE_URL}/api/v1/billing/checkout`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ url: "https://checkout.stripe.com/s", upgraded: false });
      })
    );
    const { createCheckoutSession } = await apiImport();
    const { url } = await createCheckoutSession("3m");
    expect(capturedUrl).toContain("horizon=3m");
    expect(capturedUrl).not.toContain("plan=");
    expect(url).toBe("https://checkout.stripe.com/s");
  });

  it("exposes the status code on failure so callers can detect auth errors", async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/billing/checkout`, () =>
        new HttpResponse("Not authenticated", { status: 401 })
      )
    );
    const { createCheckoutSession, ApiError } = await apiImport();
    let caught: unknown;
    try {
      await createCheckoutSession("1m");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as InstanceType<typeof ApiError>).status).toBe(401);
    expect((caught as InstanceType<typeof ApiError>).isAuthError).toBe(true);
  });
});

describe("ApiError status handling", () => {
  const profilePayload = {
    name: "Test",
    profession: "Developer",
    job_titles: ["Dev"],
    locations: ["ON"],
    include_terms: [],
    exclude_terms: [],
    title_exclude_terms: [],
    frequency_minutes: 60,
    business_hours_only: false,
    business_hours_start: 9,
    business_hours_end: 18,
    business_days_only: false,
    alert_sensitivity: "broad" as const,
  };

  it("treats a plan limit 403 as forbidden, never as a lost session", async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/searches/`, () =>
        HttpResponse.json(
          { detail: "Tu plan Free permite máximo 1 locación(es)." },
          { status: 403 }
        )
      )
    );
    const { createSearchProfile, ApiError } = await apiImport();
    let caught: unknown;
    try {
      await createSearchProfile({ ...profilePayload, locations: ["ON", "ON:GTA"] });
    } catch (err) {
      caught = err;
    }
    const error = caught as InstanceType<typeof ApiError>;
    expect(caught).toBeInstanceOf(ApiError);
    expect(error.status).toBe(403);
    expect(error.isForbidden).toBe(true);
    expect(error.isAuthError).toBe(false);
    // The plain-string detail must survive so the user reads the real reason.
    expect(error.message).toBe("Tu plan Free permite máximo 1 locación(es).");
  });

  it("flattens a 422 validation list into a readable message", async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/searches/`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ["body", "locations"],
                msg: "Value error, Ubicación(es) inválida(s): Toronto. Usa GET /searches/regions.",
                type: "value_error",
              },
            ],
          },
          { status: 422 }
        )
      )
    );
    const { createSearchProfile, ApiError } = await apiImport();
    let caught: unknown;
    try {
      await createSearchProfile({ ...profilePayload, locations: ["Toronto"] });
    } catch (err) {
      caught = err;
    }
    const error = caught as InstanceType<typeof ApiError>;
    expect(error.status).toBe(422);
    expect(error.isForbidden).toBe(false);
    expect(error.message).toBe(
      "Ubicación(es) inválida(s): Toronto. Usa GET /searches/regions."
    );
  });
});

describe("getSearchProfile", () => {
  it("returns a single profile by id", async () => {
    const { getSearchProfile } = await apiImport();
    const profile = await getSearchProfile("profile-1");
    expect(profile.id).toBe("profile-1");
  });

  it("throws when profile is not found", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/searches/:id`, () =>
        new HttpResponse("Not Found", { status: 404 })
      )
    );
    const { getSearchProfile } = await apiImport();
    await expect(getSearchProfile("nonexistent")).rejects.toThrow("Not Found");
  });
});

describe("updateSearchProfile", () => {
  it("sends PATCH and returns the updated profile", async () => {
    const { updateSearchProfile } = await apiImport();
    const updated = await updateSearchProfile("profile-1", { is_active: false });
    expect(updated.is_active).toBe(false);
  });
});

describe("deleteSearchProfile", () => {
  it("resolves without a return value (204)", async () => {
    const { deleteSearchProfile } = await apiImport();
    const result = await deleteSearchProfile("profile-1");
    expect(result).toBeUndefined();
  });
});

describe("getSearchProfileLogs", () => {
  it("returns logs for a given profile", async () => {
    const { getSearchProfileLogs } = await apiImport();
    const logs = await getSearchProfileLogs("profile-1");
    expect(logs[0].search_config_id).toBe("profile-1");
    expect(logs[0].jobs_found).toBe(5);
  });
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

describe("getJobs", () => {
  it("returns a list of jobs with no filters", async () => {
    const { getJobs } = await apiImport();
    const jobs = await getJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].title).toBe("Senior Software Engineer");
  });

  it("appends min_score to query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE_URL}/api/v1/jobs/`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([mockJob]);
      })
    );
    const { getJobs } = await apiImport();
    await getJobs({ min_score: 60 });
    expect(capturedUrl).toContain("min_score=60");
  });

  it("appends search_config_id to query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE_URL}/api/v1/jobs/`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([mockJob]);
      })
    );
    const { getJobs } = await apiImport();
    await getJobs({ search_config_id: "profile-1" });
    expect(capturedUrl).toContain("search_config_id=profile-1");
  });

  it("appends limit and offset to query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE_URL}/api/v1/jobs/`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([mockJob]);
      })
    );
    const { getJobs } = await apiImport();
    await getJobs({ limit: 10, offset: 20 });
    expect(capturedUrl).toContain("limit=10");
    expect(capturedUrl).toContain("offset=20");
  });

  it("omits undefined params from query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE_URL}/api/v1/jobs/`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );
    const { getJobs } = await apiImport();
    await getJobs({});
    expect(capturedUrl).not.toContain("min_score");
    expect(capturedUrl).not.toContain("search_config_id");
  });
});

// ─── Auth header injection ────────────────────────────────────────────────────

describe("request auth header", () => {
  it("injects the Bearer token from the session", async () => {
    let capturedAuth = "";
    server.use(
      http.get(`${BASE_URL}/api/v1/users/me`, ({ request }) => {
        capturedAuth = request.headers.get("Authorization") ?? "";
        return HttpResponse.json(mockUser);
      })
    );
    const { getMe } = await apiImport();
    await getMe();
    expect(capturedAuth).toBe("Bearer mock-token-abc");
  });

  // Note: the "no session → no Authorization header" path is tested in integration tests,
  // where a fresh module context can be created without module-caching complications.
});
