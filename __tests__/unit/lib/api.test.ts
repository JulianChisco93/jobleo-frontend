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
    const cv = await getCV();
    expect(cv).not.toBeNull();
    expect(cv?.id).toBe("cv-1");
    expect(cv?.filename).toBe("resume.pdf");
  });

  it("returns null when no CV exists (204)", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/cv/`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );
    const { getCV } = await apiImport();
    const cv = await getCV();
    expect(cv).toBeUndefined();
  });
});

describe("uploadCVText", () => {
  it("posts extracted text and returns a CV object", async () => {
    const { uploadCVText } = await apiImport();
    const cv = await uploadCVText("a".repeat(300), "my-cv.txt");
    expect(cv.filename).toBe("my-cv.txt");
  });
});

describe("deleteCV", () => {
  it("resolves without a return value (204)", async () => {
    const { deleteCV } = await apiImport();
    const result = await deleteCV();
    expect(result).toBeUndefined();
  });

  it("throws on failure", async () => {
    server.use(
      http.delete(`${BASE_URL}/api/v1/cv/`, () =>
        new HttpResponse("Forbidden", { status: 403 })
      )
    );
    const { deleteCV } = await apiImport();
    await expect(deleteCV()).rejects.toThrow("Forbidden");
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
      locations: ["Remote"],
      include_terms: [],
      exclude_terms: [],
      title_exclude_terms: [],
      frequency_minutes: 30,
      business_hours_only: false,
      business_hours_start: 9,
      business_hours_end: 18,
      business_days_only: false,
    };
    const profile = await createSearchProfile(payload);
    expect(profile.id).toBe("profile-new");
    expect(profile.name).toBe("Design");
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
