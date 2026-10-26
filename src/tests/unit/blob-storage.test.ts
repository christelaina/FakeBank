// src/tests/unit/blob-storage.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "11111111-1111-1111-1111-111111111111";

const { sqlMock, putMock, delMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(),
  putMock: vi.fn(),
  delMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("@/lib/server/auth/session", () => ({ requireUserId: async () => USER_ID }));
vi.mock("@vercel/blob", () => ({
  put: putMock,
  del: delMock,
  get: vi.fn(),
}));

import { saveDocument } from "@/lib/server/documents";
import { saveProfilePicture } from "@/lib/server/profile-picture";

const bytes = new Uint8Array([1, 2, 3, 4]);

describe("blob-backed storage", () => {
  beforeEach(() => {
    sqlMock.mockReset();
    putMock.mockReset();
    delMock.mockReset();
    putMock.mockImplementation(async (pathname: string) => ({ pathname }));
  });

  it("stores document bytes in private blob storage under the user's folder", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: "d1",
        name: "statement.pdf",
        category: "Statements",
        mime_type: "application/pdf",
        size_bytes: 4,
        uploaded_at: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    await saveDocument({ name: "statement.pdf", category: "Statements", mimeType: "application/pdf", bytes });

    const [pathname, body, options] = putMock.mock.calls[0];
    expect(pathname.startsWith(`documents/${USER_ID}/`)).toBe(true);
    expect(body).toBeInstanceOf(Buffer);
    expect(options).toMatchObject({ access: "private", contentType: "application/pdf" });
  });

  it("keeps document bytes out of the SQL statement", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: "d1",
        name: "id.png",
        category: "Identity",
        mime_type: "image/png",
        size_bytes: 4,
        uploaded_at: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    await saveDocument({ name: "id.png", category: "Identity", mimeType: "image/png", bytes });

    const strings = sqlMock.mock.calls[0][0] as string[];
    expect(strings.join(" ")).not.toMatch(/content_base64/);
    expect(sqlMock.mock.calls[0]).not.toContain(bytes);
  });

  it("deletes the replaced profile picture object after a new upload", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        updated_at: new Date("2026-01-01T00:00:00Z"),
        previous_pathname: `profile-pictures/${USER_ID}/old`,
      },
    ]);

    await saveProfilePicture({ mimeType: "image/png", bytes });

    expect(delMock).toHaveBeenCalledWith(`profile-pictures/${USER_ID}/old`);
  });

  it("does not delete anything on the first profile picture upload", async () => {
    sqlMock.mockResolvedValueOnce([
      { updated_at: new Date("2026-01-01T00:00:00Z"), previous_pathname: null },
    ]);

    await saveProfilePicture({ mimeType: "image/png", bytes });

    expect(delMock).not.toHaveBeenCalled();
  });
});
