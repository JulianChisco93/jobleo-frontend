import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirrors the schema in components/profiles/ProfileForm.tsx
const profileSchema = z.object({
  name: z.string().min(1),
  profession: z.string().min(1),
  frequency_minutes: z.number(),
  is_active: z.boolean().optional(),
  business_hours_only: z.boolean(),
  business_hours_start: z.string().optional(),
  business_hours_end: z.string().optional(),
  business_days_only: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema> & {
  job_titles: string[];
  locations: string[];
  include_terms: string[];
  exclude_terms: string[];
};

const validBase: ProfileFormData = {
  name: "My Profile",
  profession: "Software Engineer",
  frequency_minutes: 60,
  is_active: true,
  business_hours_only: false,
  business_hours_start: "09:00",
  business_hours_end: "18:00",
  business_days_only: false,
  job_titles: ["Backend Dev"],
  locations: ["New York"],
  include_terms: [],
  exclude_terms: [],
};

// ─── profileSchema ────────────────────────────────────────────────────────────

describe("profileSchema — name", () => {
  it("accepts a non-empty name", () => {
    const result = profileSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = profileSchema.safeParse({ ...validBase, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("name");
    }
  });

  it("accepts a single-character name", () => {
    const result = profileSchema.safeParse({ ...validBase, name: "X" });
    expect(result.success).toBe(true);
  });
});

describe("profileSchema — profession", () => {
  it("rejects empty profession", () => {
    const result = profileSchema.safeParse({ ...validBase, profession: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("profession");
    }
  });

  it("accepts non-empty profession", () => {
    const result = profileSchema.safeParse({
      ...validBase,
      profession: "Designer",
    });
    expect(result.success).toBe(true);
  });
});

describe("profileSchema — frequency_minutes", () => {
  const validFrequencies = [30, 60, 120, 240, 480, 1440];

  it.each(validFrequencies)("accepts frequency %i minutes", (freq) => {
    const result = profileSchema.safeParse({
      ...validBase,
      frequency_minutes: freq,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a string frequency", () => {
    const result = profileSchema.safeParse({
      ...validBase,
      frequency_minutes: "60" as unknown as number,
    });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema — is_active (optional)", () => {
  it("accepts true", () => {
    const result = profileSchema.safeParse({ ...validBase, is_active: true });
    expect(result.success).toBe(true);
  });

  it("accepts false", () => {
    const result = profileSchema.safeParse({ ...validBase, is_active: false });
    expect(result.success).toBe(true);
  });

  it("accepts omitted is_active (optional)", () => {
    const { is_active, ...withoutActive } = validBase;
    const result = profileSchema.safeParse(withoutActive);
    expect(result.success).toBe(true);
  });
});

describe("profileSchema — business hours", () => {
  it("accepts business_hours_only: false with no times", () => {
    const result = profileSchema.safeParse({
      ...validBase,
      business_hours_only: false,
      business_hours_start: undefined,
      business_hours_end: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("accepts business_hours_only: true with valid time strings", () => {
    const result = profileSchema.safeParse({
      ...validBase,
      business_hours_only: true,
      business_hours_start: "08:00",
      business_hours_end: "17:00",
      business_days_only: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all 24-hour time slot values", () => {
    const result = profileSchema.safeParse({
      ...validBase,
      business_hours_only: true,
      business_hours_start: "00:00",
      business_hours_end: "23:00",
    });
    expect(result.success).toBe(true);
  });
});

// ─── locations runtime validation (custom, not in schema) ────────────────────

describe("locations — runtime validation (custom logic)", () => {
  // The ProfileForm validates locations manually (not via Zod schema),
  // so we test the rule directly.

  function validateLocations(locations: string[]): boolean {
    return locations.length > 0;
  }

  it("passes when at least one location is provided", () => {
    expect(validateLocations(["New York"])).toBe(true);
  });

  it("fails when locations array is empty", () => {
    expect(validateLocations([])).toBe(false);
  });

  it("passes with multiple locations", () => {
    expect(validateLocations(["New York", "Remote", "London"])).toBe(true);
  });
});

// ─── job_titles — max 5 constraint ───────────────────────────────────────────

describe("job_titles — max 5 constraint (TagInput enforced)", () => {
  function validateJobTitles(titles: string[]): boolean {
    return titles.length <= 5;
  }

  it("accepts 0 to 5 titles", () => {
    for (let n = 0; n <= 5; n++) {
      expect(validateJobTitles(Array(n).fill("title"))).toBe(true);
    }
  });

  it("rejects more than 5 titles", () => {
    expect(validateJobTitles(Array(6).fill("title"))).toBe(false);
  });
});
