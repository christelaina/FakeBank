import { describe, expect, it } from "vitest";
import { transferFormSchema } from "@/lib/validation/transfer";
import { createMockRepositories } from "@/lib/api/mock";

describe("transfer form validation", () => {
  it("requires positive amounts and distinct accounts", () => {
    const invalid = transferFormSchema.safeParse({
      sourceAccountId: "1001",
      destinationAccountId: "1001",
      amount: -5,
      description: "",
    });
    expect(invalid.success).toBe(false);

    const valid = transferFormSchema.safeParse({
      sourceAccountId: "1001",
      destinationAccountId: "1002",
      amount: 25.5,
      description: "Rent share",
    });
    expect(valid.success).toBe(true);
  });

  it("marks mock transfers as unverified backend actions", async () => {
    const repos = createMockRepositories();
    const result = await repos.transfers.createTransfer({
      sourceAccountId: "1001",
      destinationAccountId: "1002",
      amount: 10,
      idempotencyKey: "mock-transfer-key-1",
    });
    expect(result.verifiedByBackend).toBe(false);
    expect(result.message.toLowerCase()).toContain("mock");
  });
});
