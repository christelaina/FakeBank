// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ sql: vi.fn(), pool: {} }));

import { findChangedFields } from "@/lib/server/profile";
import { updateProfileSchema } from "@/lib/validation/profile";
import type { UserProfile } from "@/types/banking";

const current: UserProfile = {
  id: "11111111-1111-1111-1111-111111111111",
  displayName: "Jordan Ellis",
  email: "jordan@example.com",
  phone: "+1 (416) 555-0148",
  addressLine1: "220 King Street West",
  city: "Toronto",
  province: "ON",
  postalCode: "M5H 1K4",
  preferredLanguage: "en-CA",
  marketingEmails: false,
  twoFactorEnabled: true,
} as UserProfile;

describe("findChangedFields", () => {
  it("returns nothing when input matches current values", () => {
    expect(
      findChangedFields(current, {
        displayName: "Jordan Ellis",
        phone: "+1 (416) 555-0148",
        preferredLanguage: "en-CA",
        marketingEmails: false,
      }),
    ).toEqual([]);
  });

  it("returns only the fields that differ", () => {
    expect(
      findChangedFields(current, {
        displayName: "Jordan E.",
        marketingEmails: true,
      }),
    ).toEqual(["displayName", "marketingEmails"]);
  });

  it("ignores fields that were not supplied", () => {
    expect(findChangedFields(current, { phone: "+1 (416) 555-9999" })).toEqual(["phone"]);
  });

  it("detects a language change", () => {
    expect(findChangedFields(current, { preferredLanguage: "fr-CA" })).toEqual([
      "preferredLanguage",
    ]);
  });
});

describe("updateProfileSchema", () => {
  it("accepts a valid partial update", () => {
    const result = updateProfileSchema.safeParse({ preferredLanguage: "fr-CA" });
    expect(result.success).toBe(true);
  });

  it("trims displayName", () => {
    const result = updateProfileSchema.safeParse({ displayName: "  Jordan  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.displayName).toBe("Jordan");
  });

  it("rejects an empty displayName", () => {
    expect(updateProfileSchema.safeParse({ displayName: "   " }).success).toBe(false);
  });

  it("rejects an unsupported language", () => {
    expect(updateProfileSchema.safeParse({ preferredLanguage: "de-DE" }).success).toBe(false);
  });

  it("rejects unknown keys", () => {
    expect(updateProfileSchema.safeParse({ email: "x@example.com" }).success).toBe(false);
  });
});
