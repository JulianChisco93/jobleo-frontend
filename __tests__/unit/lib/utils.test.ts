import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatLastSearched, E164_REGEX } from "@/lib/utils";
import { daysUntil, hasLapsed } from "@/lib/plans";

// ─── formatLastSearched ───────────────────────────────────────────────────────

describe("formatLastSearched", () => {
  const NOW = new Date("2024-06-15T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "—" for empty string', () => {
    expect(formatLastSearched("")).toBe("—");
  });

  it('returns "—" for falsy values cast to string', () => {
    // @ts-expect-error — intentional runtime test
    expect(formatLastSearched(null)).toBe("—");
    // @ts-expect-error
    expect(formatLastSearched(undefined)).toBe("—");
  });

  it("returns minutes when diff < 60 min", () => {
    const date = new Date(NOW - 5 * 60 * 1000).toISOString(); // 5 min ago
    expect(formatLastSearched(date)).toBe("5 min");
  });

  it("returns 0 min when date is 'now'", () => {
    const date = new Date(NOW).toISOString();
    expect(formatLastSearched(date)).toBe("0 min");
  });

  it("returns 59 min when diff is just under 1h", () => {
    const date = new Date(NOW - 59 * 60 * 1000).toISOString();
    expect(formatLastSearched(date)).toBe("59 min");
  });

  it("returns hours when diff >= 60 min and < 24h", () => {
    const date = new Date(NOW - 3 * 60 * 60 * 1000).toISOString(); // 3h ago
    expect(formatLastSearched(date)).toBe("3h");
  });

  it("returns 1h at exactly 60 min", () => {
    const date = new Date(NOW - 60 * 60 * 1000).toISOString();
    expect(formatLastSearched(date)).toBe("1h");
  });

  it("returns 23h just before the 24h threshold", () => {
    const date = new Date(NOW - 23 * 60 * 60 * 1000).toISOString();
    expect(formatLastSearched(date)).toBe("23h");
  });

  it("returns days when diff >= 24h", () => {
    const date = new Date(NOW - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
    expect(formatLastSearched(date)).toBe("2d");
  });

  it("returns 1d at exactly 24h", () => {
    const date = new Date(NOW - 24 * 60 * 60 * 1000).toISOString();
    expect(formatLastSearched(date)).toBe("1d");
  });

  it("handles large past dates (30 days ago)", () => {
    const date = new Date(NOW - 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatLastSearched(date)).toBe("30d");
  });

  it("reads timezone-less API datetimes as UTC", () => {
    expect(formatLastSearched("2024-06-15T11:00:00")).toBe("1h");
    expect(formatLastSearched("2024-06-15 11:00:00")).toBe("1h");
  });

  it('returns "—" for unparseable dates', () => {
    expect(formatLastSearched("not-a-date")).toBe("—");
  });
});

// ─── pass expiry helpers ──────────────────────────────────────────────────────

describe("daysUntil / hasLapsed", () => {
  const NOW = new Date("2024-06-15T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts whole days left on a pass", () => {
    expect(daysUntil("2024-06-20T12:00:00Z")).toBe(5);
  });

  it("clamps a lapsed pass to 0 days instead of going negative", () => {
    expect(daysUntil("2024-06-10T12:00:00Z")).toBe(0);
  });

  it("returns null without an expiry date", () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil(undefined)).toBeNull();
  });

  it("detects a lapsed pass only once the date is past", () => {
    expect(hasLapsed("2024-06-10T12:00:00Z")).toBe(true);
    expect(hasLapsed("2024-06-20T12:00:00Z")).toBe(false);
    expect(hasLapsed(null)).toBe(false);
  });

  it("reads timezone-less expiry dates as UTC", () => {
    expect(hasLapsed("2024-06-15T11:00:00")).toBe(true);
    expect(hasLapsed("2024-06-15T13:00:00")).toBe(false);
  });
});

// ─── E164_REGEX ───────────────────────────────────────────────────────────────

describe("E164_REGEX", () => {
  const valid = [
    "+14155552671",   // US
    "+441234567890",  // UK
    "+34612345678",   // Spain
    "+5491112345678", // Argentina
    "+521234567890",  // Mexico
    "+11",            // minimal valid (country code 1, subscriber 1)
  ];

  const invalid = [
    "14155552671",    // missing +
    "+0123456789",    // starts with 0 after +
    "+",              // no digits
    "",               // empty
    "+1 415 555 2671",// has spaces
    "+1-415-555-2671",// has dashes
    "+123456789012345678", // too long (>15 digits)
    "not-a-phone",
  ];

  it.each(valid)('accepts valid E.164: "%s"', (phone) => {
    expect(E164_REGEX.test(phone)).toBe(true);
  });

  it.each(invalid)('rejects invalid E.164: "%s"', (phone) => {
    expect(E164_REGEX.test(phone)).toBe(false);
  });
});
