// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TransferRequest } from "@/lib/validation/transfers";

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  query: vi.fn(),
  release: vi.fn(),
  connect: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  sql: mocks.sql,
  pool: { connect: mocks.connect },
}));

// Tests run outside a request, so the session is stubbed with a fixed signed-in user.
vi.mock("@/lib/server/auth/session", () => ({
  requireUserId: vi.fn(async () => "demo-user-id"),
}));

const { createTransfer } = await import("@/lib/server/transfers");

const SOURCE = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const DESTINATION = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const KEY = "0f8fad5b-d9cb-469f-a165-8c0e7e1b2c3d";

const request: TransferRequest = {
  sourceAccountId: SOURCE,
  destinationAccountId: DESTINATION,
  amount: 25,
  description: "rent",
  idempotencyKey: KEY,
};

type AccountRow = {
  id: string;
  type: string;
  status: string;
  balance: string;
  available_balance: string;
};

const activeSource: AccountRow = {
  id: SOURCE,
  type: "chequing",
  status: "active",
  balance: "100.00",
  available_balance: "100.00",
};
const activeDestination: AccountRow = {
  id: DESTINATION,
  type: "savings",
  status: "active",
  balance: "50.00",
  available_balance: "50.00",
};

const transferRow = {
  id: "t-1",
  source_account_id: SOURCE,
  destination_account_id: DESTINATION,
  amount: "25.00",
  created_at: "2026-10-26T00:00:00.000Z",
};

// Routes each SQL statement issued on the pooled client to a canned result.
function setupDb(options: {
  accounts: AccountRow[];
  insertRows?: unknown[];
}) {
  mocks.sql.mockResolvedValue([]);
  mocks.connect.mockResolvedValue({ query: mocks.query, release: mocks.release });
  mocks.query.mockImplementation(async (text: string) => {
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(text)) return { rows: [] };
    if (text.includes("FOR UPDATE")) return { rows: options.accounts };
    if (text.includes("INSERT INTO transfers")) {
      return { rows: options.insertRows ?? [transferRow] };
    }
    if (text.includes("UPDATE accounts")) return { rows: [{ balance: "75.00" }] };
    return { rows: [] };
  });
}

function statements(): string[] {
  return mocks.query.mock.calls.map((call) => String(call[0]));
}

function ranStatement(fragment: string): boolean {
  return statements().some((text) => text.includes(fragment));
}

describe("createTransfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("commits balance updates and paired transactions for an eligible transfer", async () => {
    setupDb({ accounts: [activeSource, activeDestination] });

    const result = await createTransfer(request);

    expect(result).toMatchObject({ transferId: "t-1", status: "completed", verifiedByBackend: true });
    expect(statements()).toContain("COMMIT");
    expect(statements()).not.toContain("ROLLBACK");
    const transactionInserts = statements().filter((text) =>
      text.includes("INSERT INTO transactions"),
    );
    expect(transactionInserts).toHaveLength(2);
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });

  it("allows a transfer that exactly empties the source balance", async () => {
    setupDb({
      accounts: [{ ...activeSource, available_balance: "25.00" }, activeDestination],
    });

    await expect(createTransfer(request)).resolves.toMatchObject({ status: "completed" });
  });

  it("rejects a frozen source account and leaves balances untouched", async () => {
    setupDb({
      accounts: [{ ...activeSource, status: "frozen" }, activeDestination],
    });

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "ACCOUNT_NOT_ELIGIBLE",
      status: 422,
    });
    expect(statements()).toContain("ROLLBACK");
    expect(ranStatement("INSERT INTO transfers")).toBe(false);
    expect(ranStatement("UPDATE accounts")).toBe(false);
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });

  it("rejects a closed destination account", async () => {
    setupDb({
      accounts: [activeSource, { ...activeDestination, status: "closed" }],
    });

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "ACCOUNT_NOT_ELIGIBLE",
      status: 422,
    });
    expect(ranStatement("UPDATE accounts")).toBe(false);
  });

  it("accepts a card payment up to the amount owed and labels both sides as a payment", async () => {
    const card: AccountRow = {
      ...activeDestination,
      type: "credit",
      balance: "-935.00",
      available_balance: "4000.00",
    };
    setupDb({ accounts: [activeSource, card] });

    await expect(createTransfer(request)).resolves.toMatchObject({ status: "completed" });
    expect(statements()).toContain("COMMIT");
    const descriptions = mocks.query.mock.calls
      .filter((call) => String(call[0]).includes("INSERT INTO transactions"))
      .map((call) => (call[1] as unknown[])[1]);
    expect(descriptions).toEqual(["Payment: rent", "Payment received: rent"]);
  });

  it("accepts a card payment larger than the amount owed", async () => {
    const card: AccountRow = {
      ...activeDestination,
      type: "credit",
      balance: "-10.00",
      available_balance: "4000.00",
    };
    setupDb({ accounts: [activeSource, card] });

    await expect(createTransfer(request)).resolves.toMatchObject({ status: "completed" });
  });

  it("rejects a credit account as the source", async () => {
    const card: AccountRow = {
      ...activeSource,
      type: "credit",
      balance: "-935.00",
      available_balance: "4000.00",
    };
    setupDb({ accounts: [card, activeDestination] });

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "ACCOUNT_NOT_ELIGIBLE",
      status: 422,
    });
    expect(ranStatement("UPDATE accounts")).toBe(false);
  });

  it("returns 404 when the destination is not owned by the demo user", async () => {
    setupDb({ accounts: [activeSource] });

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "ACCOUNT_NOT_FOUND",
      status: 404,
    });
    expect(ranStatement("INSERT INTO transfers")).toBe(false);
  });

  it("rejects insufficient funds without inserting a transfer", async () => {
    setupDb({
      accounts: [{ ...activeSource, available_balance: "10.00" }, activeDestination],
    });

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "INSUFFICIENT_FUNDS",
      status: 422,
    });
    expect(statements()).toContain("ROLLBACK");
    expect(ranStatement("INSERT INTO transfers")).toBe(false);
    expect(ranStatement("UPDATE accounts")).toBe(false);
  });

  it("returns the original transfer when the same key and payload are replayed", async () => {
    setupDb({ accounts: [] });
    mocks.sql.mockResolvedValueOnce([{ ...transferRow, source_account_id: SOURCE }]);

    const result = await createTransfer(request);

    expect(result.transferId).toBe("t-1");
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("returns 409 when the key was used for a different payload", async () => {
    setupDb({ accounts: [] });
    mocks.sql.mockResolvedValueOnce([
      { ...transferRow, destination_account_id: "cccccccc-cccc-cccc-cccc-cccccccccccc" },
    ]);

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "IDEMPOTENCY_CONFLICT",
      status: 409,
    });
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("returns the winning request's result when a concurrent insert takes the key", async () => {
    setupDb({ accounts: [activeSource, activeDestination], insertRows: [] });
    mocks.sql
      .mockResolvedValueOnce([]) // initial replay check finds nothing
      .mockResolvedValueOnce([{ ...transferRow, id: "t-winner" }]); // re-check after rollback

    const result = await createTransfer(request);

    expect(result.transferId).toBe("t-winner");
    expect(statements()).toContain("ROLLBACK");
    expect(ranStatement("UPDATE accounts")).toBe(false);
    expect(statements()).not.toContain("COMMIT");
  });

  it("returns 409 when the key conflicts and no winner can be found", async () => {
    setupDb({ accounts: [activeSource, activeDestination], insertRows: [] });
    mocks.sql.mockResolvedValue([]);

    await expect(createTransfer(request)).rejects.toMatchObject({
      code: "IDEMPOTENCY_CONFLICT",
      status: 409,
    });
    expect(statements()).toContain("ROLLBACK");
  });

  it("rolls back and releases the client when a query fails", async () => {
    setupDb({ accounts: [activeSource, activeDestination] });
    mocks.query.mockImplementation(async (text: string) => {
      if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(text)) return { rows: [] };
      if (text.includes("FOR UPDATE")) return { rows: [activeSource, activeDestination] };
      if (text.includes("INSERT INTO transfers")) return { rows: [transferRow] };
      if (text.includes("UPDATE accounts")) throw new Error("connection reset");
      return { rows: [] };
    });

    await expect(createTransfer(request)).rejects.toThrow("connection reset");
    expect(statements()).toContain("ROLLBACK");
    expect(statements()).not.toContain("COMMIT");
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });
});
