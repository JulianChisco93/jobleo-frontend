import { describe, it, expect, beforeEach } from "vitest";
import {
  savePendingCvFile,
  takePendingCvFile,
  clearPendingCvFile,
} from "@/lib/pendingCv";

const PENDING_CV_KEY = "onboarding_cv_file";

function makeFile(contents: string, name = "resume.pdf", type = "application/pdf") {
  return new File([contents], name, { type });
}

describe("pending CV across the Stripe redirect", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("survives the round trip with its bytes, name and type intact", async () => {
    const saved = await savePendingCvFile(makeFile("%PDF-1.4 curriculum"));
    expect(saved).toBe(true);

    const restored = takePendingCvFile();
    expect(restored).not.toBeNull();
    expect(restored!.name).toBe("resume.pdf");
    expect(restored!.type).toBe("application/pdf");
    await expect(restored!.text()).resolves.toBe("%PDF-1.4 curriculum");
  });

  it("preserves bytes that are not valid UTF-8 text", async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0xfe, 0x80]);
    const file = new File([bytes], "cv.pdf", { type: "application/pdf" });
    await savePendingCvFile(file);

    const restored = takePendingCvFile();
    const roundTripped = new Uint8Array(await restored!.arrayBuffer());
    expect(Array.from(roundTripped)).toEqual(Array.from(bytes));
  });

  it("only hands the file over once, so it cannot attach twice", async () => {
    await savePendingCvFile(makeFile("curriculum"));

    expect(takePendingCvFile()).not.toBeNull();
    expect(takePendingCvFile()).toBeNull();
    expect(sessionStorage.getItem(PENDING_CV_KEY)).toBeNull();
  });

  it("returns null when nothing was parked", () => {
    expect(takePendingCvFile()).toBeNull();
  });

  it("refuses files too large to park, without leaving a partial entry", async () => {
    const tooBig = new File(["x"], "huge.pdf", { type: "application/pdf" });
    Object.defineProperty(tooBig, "size", { value: 4 * 1024 * 1024 });

    expect(await savePendingCvFile(tooBig)).toBe(false);
    expect(sessionStorage.getItem(PENDING_CV_KEY)).toBeNull();
    expect(takePendingCvFile()).toBeNull();
  });

  it("refuses an empty file", async () => {
    expect(await savePendingCvFile(new File([], "empty.pdf"))).toBe(false);
  });

  it("survives a corrupted entry instead of throwing", () => {
    sessionStorage.setItem(PENDING_CV_KEY, "{not json");
    expect(takePendingCvFile()).toBeNull();
    expect(sessionStorage.getItem(PENDING_CV_KEY)).toBeNull();
  });

  it("clears the parked file on demand", async () => {
    await savePendingCvFile(makeFile("curriculum"));
    clearPendingCvFile();
    expect(takePendingCvFile()).toBeNull();
  });
});
