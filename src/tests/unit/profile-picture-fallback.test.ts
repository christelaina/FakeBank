// src/tests/unit/profile-picture-fallback.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "11111111-1111-1111-1111-111111111111";

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("@/lib/server/auth/session", () => ({ requireUserId: async () => USER_ID }));
vi.mock("@/lib/server/storage", () => ({
  putPrivateObject: vi.fn(),
  deletePrivateObject: vi.fn(),
}));

import { getProfilePicture } from "@/lib/server/profile-picture";

describe("getProfilePicture legacy fallback", () => {
  beforeEach(() => sqlMock.mockReset());

  it("returns the legacy base64 when no Blob path is set", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        mime_type: "image/png",
        blob_pathname: null,
        content_base64: "AAEC",
        updated_at: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    const picture = await getProfilePicture();

    expect(picture).toMatchObject({ mimeType: "image/png", blobPathname: null, legacyBase64: "AAEC" });
  });

  it("prefers the Blob path and ignores legacy base64", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        mime_type: "image/png",
        blob_pathname: `profile-pictures/${USER_ID}/new`,
        content_base64: "AAEC",
        updated_at: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    const picture = await getProfilePicture();

    expect(picture?.blobPathname).toBe(`profile-pictures/${USER_ID}/new`);
    expect(picture?.legacyBase64).toBeNull();
  });

  it("returns null when neither storage is present", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        mime_type: "image/png",
        blob_pathname: null,
        content_base64: null,
        updated_at: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    expect(await getProfilePicture()).toBeNull();
  });
});
