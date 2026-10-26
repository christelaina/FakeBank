// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/transactions/route";
import { searchTransactions } from "@/lib/server/transactions";

vi.mock("@/lib/server/transactions", () => ({
  searchTransactions: vi.fn(),
}));

vi.mock("@/lib/server/auth/session", () => ({
  isAuthRequiredError: () => false,
  authRequiredResponse: () => Response.json({ code: "AUTH_REQUIRED" }, { status: 401 }),
}));

const searchMock = vi.mocked(searchTransactions);

function request(query = "") {
  return new Request(`http://localhost:3000/api/transactions${query}`);
}

describe("GET /api/transactions", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    searchMock.mockReset();
  });

  it("returns an empty page when there is no history", async () => {
    searchMock.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });

    const response = await GET(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ items: [], total: 0, page: 1, pageSize: 10 });
  });

  it("passes parsed filters to the query layer", async () => {
    searchMock.mockResolvedValue({ items: [], total: 0, page: 2, pageSize: 25 });

    await GET(request("?accountId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&query=Loblaws&page=2&pageSize=25"));

    expect(searchMock).toHaveBeenCalledWith({
      accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      query: "Loblaws",
      page: 2,
      pageSize: 25,
    });
  });

  it("returns 400 for an oversized page and does not query the database", async () => {
    const response = await GET(request("?pageSize=500"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid transaction filters");
    expect(body.details.pageSize).toBeDefined();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed account ID", async () => {
    const response = await GET(request("?accountId=1001"));
    expect(response.status).toBe(400);
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the database query fails", async () => {
    searchMock.mockRejectedValue(new Error("connection refused"));

    const response = await GET(request());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to load transactions" });
    expect(console.error).toHaveBeenCalled();
  });
});
