import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRepositories } from "@/lib/api";
import { listTransactions } from "@/lib/api/transactions";
import { getEnvironment } from "@/lib/config/environment";
import { searchTransactions } from "@/lib/server/transactions";

vi.mock("@/lib/api", () => ({ getRepositories: vi.fn() }));
vi.mock("@/lib/config/environment", () => ({ getEnvironment: vi.fn() }));
vi.mock("@/lib/server/transactions", () => ({ searchTransactions: vi.fn() }));

const envMock = vi.mocked(getEnvironment);
const searchMock = vi.mocked(searchTransactions);
const reposMock = vi.mocked(getRepositories);

const emptyPage = { items: [], total: 0, page: 1, pageSize: 10 };

describe("listTransactions wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envMock.mockReturnValue({ isMockMode: false } as ReturnType<typeof getEnvironment>);
    searchMock.mockResolvedValue(emptyPage);
  });

  it("uses Neon search with defaults in live mode", async () => {
    await listTransactions({ accountId: "" });

    expect(searchMock).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it("passes valid filters through to Neon search", async () => {
    await listTransactions({
      accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      query: "Loblaws",
      page: 2,
      pageSize: 8,
    });

    expect(searchMock).toHaveBeenCalledWith({
      accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      query: "Loblaws",
      page: 2,
      pageSize: 8,
    });
  });

  it("rejects a malformed account ID before querying the database", async () => {
    await expect(listTransactions({ accountId: "1001" })).rejects.toMatchObject({
      status: 400,
    });
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("delegates to the mock repository in mock mode", async () => {
    envMock.mockReturnValue({ isMockMode: true } as ReturnType<typeof getEnvironment>);
    const repoList = vi.fn().mockResolvedValue(emptyPage);
    reposMock.mockReturnValue({
      transactions: { listTransactions: repoList },
    } as unknown as ReturnType<typeof getRepositories>);

    const result = await listTransactions({ query: "Loblaws" });

    expect(repoList).toHaveBeenCalledWith({ query: "Loblaws" });
    expect(result).toEqual(emptyPage);
    expect(searchMock).not.toHaveBeenCalled();
  });
});
