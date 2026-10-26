import { describe, expect, it } from "vitest";
import {
  profilePictureUploadSchema,
  sniffImageMime,
} from "@/lib/validation/profile-picture";

describe("sniffImageMime", () => {
  it("detects real image signatures", () => {
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("image/jpeg");
    expect(sniffImageMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImageMime(new TextEncoder().encode("GIF89a......"))).toBe("image/gif");
    expect(sniffImageMime(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
  });

  it("rejects markup and spoofed content", () => {
    expect(sniffImageMime(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageMime(new TextEncoder().encode("<html>"))).toBeNull();
  });
});

describe("profilePictureUploadSchema", () => {
  const valid = {
    fileName: "me.png",
    mimeType: "image/png",
    sizeBytes: 67,
    contentBase64: "iVBORw0KGgo=",
  };

  it("accepts a well-formed upload", () => {
    expect(profilePictureUploadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects svg and html mime types", () => {
    expect(profilePictureUploadSchema.safeParse({ ...valid, mimeType: "image/svg+xml" }).success).toBe(false);
    expect(profilePictureUploadSchema.safeParse({ ...valid, mimeType: "text/html" }).success).toBe(false);
  });

  it("rejects files over 2 MB", () => {
    expect(
      profilePictureUploadSchema.safeParse({ ...valid, sizeBytes: 2 * 1024 * 1024 + 1 }).success,
    ).toBe(false);
  });

  it("rejects non-base64 content", () => {
    expect(profilePictureUploadSchema.safeParse({ ...valid, contentBase64: "not base64!" }).success).toBe(false);
  });
});
