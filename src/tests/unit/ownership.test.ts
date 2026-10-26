// src/tests/unit/ownership.test.ts
// Checks that every user-data query is scoped to the signed-in user.
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";
const ACCOUNT_OWNED_BY_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

const { sqlMock, currentUser, putMock, delMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(),
  currentUser: { id: "" },
  putMock: vi.fn(),
  delMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("@/lib/server/auth/session", () => ({
  requireUserId: async () => currentUser.id,
}));
vi.mock("@vercel/blob", () => ({ put: putMock, del: delMock, get: vi.fn() }));

import { getAccount, listAccounts } from "@/lib/server/accounts";
import { listDocuments } from "@/lib/server/documents";
import { getProfilePicture } from "@/lib/server/profile-picture";

// Returns the values interpolated into the most recent SQL call.
function lastSqlValues(): unknown[] {
  return sqlMock.mock.calls[sqlMock.mock.calls.length - 1].slice(1);
}

function lastSqlText(): string {
  return (sqlMock.mock.calls[sqlMock.mock.calls.length - 1][0] as string[]).join(" ");
}

describe("ownership scoping", () => {
  beforeEach(() => {
    sqlMock.mockReset();
    putMock.mockReset();
    delMock.mockReset();
    currentUser.id = USER_A;
  });

  it("lists only the signed-in user's accounts", async () => {
    sqlMock.mockResolvedValueOnce([]);
    await listAccounts();
    expect(lastSqlText()).toMatch(/WHERE user_id = /);
    expect(lastSqlValues()).toContain(USER_A);
  });

  it("returns null for another user's account id", async () => {
    // Signed in as B. The database filter on user_id finds no row for A's account.
    currentUser.id = USER_B;
    sqlMock.mockResolvedValueOnce([]);

    const account = await getAccount(ACCOUNT_OWNED_BY_A);

    expect(account).toBeNull();
    expect(lastSqlText()).toMatch(/id = .* AND user_id = /);
    expect(lastSqlValues()).toEqual([ACCOUNT_OWNED_BY_A, USER_B]);
  });

  it("returns the account when the signed-in user owns it", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: ACCOUNT_OWNED_BY_A,
        name: "Chequing",
        nickname: null,
        type: "chequing",
        masked_number: "****1234",
        balance: "10.00",
        available_balance: "10.00",
        currency: "CAD",
        status: "active",
      },
    ]);
    const account = await getAccount(ACCOUNT_OWNED_BY_A);
    expect(account?.id).toBe(ACCOUNT_OWNED_BY_A);
    expect(lastSqlValues()).toEqual([ACCOUNT_OWNED_BY_A, USER_A]);
  });

  it("does not query the database for a malformed account id", async () => {
    const account = await getAccount("not-a-uuid");
    expect(account).toBeNull();
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("lists only the signed-in user's documents", async () => {
    sqlMock.mockResolvedValueOnce([]);
    await listDocuments();
    expect(lastSqlText()).toMatch(/WHERE user_id = /);
    expect(lastSqlValues()).toContain(USER_A);
  });

  it("returns no profile picture for a user who has none, even if another has one", async () => {
    currentUser.id = USER_B;
    sqlMock.mockResolvedValueOnce([]);
    const picture = await getProfilePicture();
    expect(picture).toBeNull();
    expect(lastSqlValues()).toEqual([USER_B]);
  });
});
