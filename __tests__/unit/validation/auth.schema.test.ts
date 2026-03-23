import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirrors the schemas in app/[locale]/login/page.tsx
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─── Login schema ─────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  describe("valid inputs", () => {
    it("accepts a well-formed email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "secret123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a 6-character password (minimum)", () => {
      const result = loginSchema.safeParse({
        email: "a@b.com",
        password: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("accepts long passwords", () => {
      const result = loginSchema.safeParse({
        email: "a@b.com",
        password: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("email validation", () => {
    it.each([
      ["not-an-email"],
      ["@missing-local.com"],
      ["missing-at-sign.com"],
      ["double@@at.com"],
      [""],
    ])('rejects email "%s"', (email) => {
      const result = loginSchema.safeParse({ email, password: "valid123" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === "email");
        expect(emailError).toBeDefined();
      }
    });
  });

  describe("password validation", () => {
    it("rejects a password shorter than 6 characters", () => {
      const result = loginSchema.safeParse({
        email: "a@b.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pwError = result.error.issues.find((i) => i.path[0] === "password");
        expect(pwError?.message).toBe("Password must be at least 6 characters");
      }
    });

    it("rejects an empty password", () => {
      const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
      expect(result.success).toBe(false);
    });
  });

  it("reports both errors when both fields are invalid", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("email");
      expect(paths).toContain("password");
    }
  });
});

// ─── Register schema ──────────────────────────────────────────────────────────

describe("registerSchema", () => {
  describe("valid inputs", () => {
    it("accepts valid name, email and password", () => {
      const result = registerSchema.safeParse({
        name: "Julia",
        email: "julia@example.com",
        password: "securePass!",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a 2-character name (minimum)", () => {
      const result = registerSchema.safeParse({
        name: "Jo",
        email: "jo@example.com",
        password: "123456",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("name validation", () => {
    it("rejects a 1-character name", () => {
      const result = registerSchema.safeParse({
        name: "J",
        email: "a@b.com",
        password: "123456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((i) => i.path[0] === "name");
        expect(nameError?.message).toBe("Name must be at least 2 characters");
      }
    });

    it("rejects an empty name", () => {
      const result = registerSchema.safeParse({
        name: "",
        email: "a@b.com",
        password: "123456",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("email validation", () => {
    it("rejects a malformed email", () => {
      const result = registerSchema.safeParse({
        name: "Julia",
        email: "not-an-email",
        password: "123456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === "email");
        expect(emailError?.message).toBe("Enter a valid email");
      }
    });
  });

  describe("password validation", () => {
    it("rejects password under 6 chars", () => {
      const result = registerSchema.safeParse({
        name: "Julia",
        email: "julia@example.com",
        password: "abc",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pwError = result.error.issues.find((i) => i.path[0] === "password");
        expect(pwError?.message).toBe("Password must be at least 6 characters");
      }
    });
  });

  it("reports all three errors when all fields are invalid", () => {
    const result = registerSchema.safeParse({
      name: "X",
      email: "bad",
      password: "12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("name");
      expect(paths).toContain("email");
      expect(paths).toContain("password");
    }
  });
});
