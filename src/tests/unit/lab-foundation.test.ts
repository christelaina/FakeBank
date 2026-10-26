// src/tests/unit/lab-foundation.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "x".repeat(40);
const STUDENT = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";

describe("generateFlag", () => {
  beforeEach(() => {
    vi.stubEnv("LAB_SECRET", SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is deterministic and has the flag format", async () => {
    const { generateFlag } = await import("@/lib/lab/flags");
    const first = generateFlag(STUDENT, "access-control");
    expect(first).toMatch(/^BC2\{[0-9a-f]{32}\}$/);
    expect(generateFlag(STUDENT, "access-control")).toBe(first);
  });

  it("differs per student and per challenge", async () => {
    const { generateFlag } = await import("@/lib/lab/flags");
    const base = generateFlag(STUDENT, "access-control");
    expect(generateFlag(OTHER, "access-control")).not.toBe(base);
    expect(generateFlag(STUDENT, "xss")).not.toBe(base);
  });

  it("refuses to run without a strong secret", async () => {
    vi.stubEnv("LAB_SECRET", "short");
    const { generateFlag } = await import("@/lib/lab/flags");
    expect(() => generateFlag(STUDENT, "xss")).toThrow(/LAB_SECRET/);
  });
});

describe("admin password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const { hashAdminPassword, verifyAdminPassword } = await import("@/lib/server/auth/admin-password");
    const stored = await hashAdminPassword("correct-horse-battery");
    expect(stored.startsWith("scrypt$16384$8$1$")).toBe(true);
    expect(await verifyAdminPassword("correct-horse-battery", stored)).toBe(true);
    expect(await verifyAdminPassword("wrong-password-here", stored)).toBe(false);
  });

  it("uses a fresh salt for each hash", async () => {
    const { hashAdminPassword } = await import("@/lib/server/auth/admin-password");
    expect(await hashAdminPassword("same-password-1")).not.toBe(await hashAdminPassword("same-password-1"));
  });

  it("rejects malformed stored values", async () => {
    const { verifyAdminPassword } = await import("@/lib/server/auth/admin-password");
    expect(await verifyAdminPassword("anything", "AAEC")).toBe(false);
  });
});

describe("lab gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 when LAB_MODE is off", async () => {
    vi.stubEnv("LAB_MODE", "");
    const { GET } = await import("@/app/api/lab/status/route");
    const response = await GET();
    expect(response.status).toBe(404);
  });

  it("returns 200 when LAB_MODE is on", async () => {
    vi.stubEnv("LAB_MODE", "on");
    const { GET } = await import("@/app/api/lab/status/route");
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
