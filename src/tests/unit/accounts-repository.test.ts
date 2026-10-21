import { describe, expect, it } from "vitest";
import { createMockRepositories } from "@/lib/api/mock";
import { ApiError } from "@/types/api";

describe("accounts repository", () => {
  it("lists seeded accounts through the repository interface", async () => {
    const repos = createMockRepositories();
    const accounts = await repos.accounts.listAccounts();
    expect(accounts).toHaveLength(3);
    expect(accounts.map((a) => a.id)).toEqual(["1001", "1002", "1003"]);
  });

  it("loads a single account by id", async () => {
    const repos = createMockRepositories();
    const account = await repos.accounts.getAccount("1001");
    expect(account.name).toContain("Chequing");
  });

  it("surfaces not-found errors for missing accounts", async () => {
    const repos = createMockRepositories();
    await expect(repos.accounts.getAccount("9999")).rejects.toBeInstanceOf(ApiError);
  });
});
