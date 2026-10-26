import { describe, expect, it } from "vitest";
import { containsScript, labFileSchema, LAB_FILE_CONTENT_MAX, nameMatchesType } from "@/lib/lab/file-challenge";

describe("containsScript", () => {
  it("detects a script tag regardless of case", () => {
    expect(containsScript('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    expect(containsScript("plain statement text")).toBe(false);
  });
});

describe("nameMatchesType", () => {
  it("accepts a name whose extension matches the declared type", () => {
    expect(nameMatchesType("statement.png", "image/png")).toBe(true);
    expect(nameMatchesType("photo.JPEG", "image/jpeg")).toBe(true);
    expect(nameMatchesType("form.pdf", "application/pdf")).toBe(true);
  });

  it("rejects a name whose extension does not match the declared type", () => {
    expect(nameMatchesType("statement.png", "application/pdf")).toBe(false);
    expect(nameMatchesType("statement.pdf", "image/png")).toBe(false);
  });
});

describe("labFileSchema", () => {
  const valid = {
    fileName: "statement.png",
    mimeType: "image/png",
    purpose: "document",
    content: "hello",
  };

  it("accepts a valid file", () => {
    expect(labFileSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects content over the length cap", () => {
    const content = "a".repeat(LAB_FILE_CONTENT_MAX + 1);
    expect(labFileSchema.safeParse({ ...valid, content }).success).toBe(false);
  });

  it("rejects an unknown type", () => {
    expect(labFileSchema.safeParse({ ...valid, mimeType: "text/html" }).success).toBe(false);
  });

  it("accepts only document or profile picture purposes", () => {
    expect(labFileSchema.safeParse({ ...valid, purpose: "profile_picture" }).success).toBe(true);
    expect(labFileSchema.safeParse({ ...valid, purpose: "invoice" }).success).toBe(false);
  });
});
