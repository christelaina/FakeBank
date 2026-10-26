import { describe, expect, it } from "vitest";
import {
  escapeLikePattern,
  MAX_PAGE_SIZE,
  transactionQuerySchema,
} from "@/lib/validation/transactions";

describe("transaction query validation", () => {
  it("applies defaults when no filters are given", () => {
    const result = transactionQuerySchema.parse({});
    expect(result).toEqual({ page: 1, pageSize: 10 });
  });

  it("coerces numeric query strings", () => {
    const result = transactionQuerySchema.parse({ page: "2", pageSize: "25" });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(25);
  });

  it("rejects page sizes above the cap", () => {
    const result = transactionQuerySchema.safeParse({ pageSize: String(MAX_PAGE_SIZE + 1) });
    expect(result.success).toBe(false);
  });

  it("rejects page below 1 and non-integer pages", () => {
    expect(transactionQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(transactionQuerySchema.safeParse({ page: "1.5" }).success).toBe(false);
    expect(transactionQuerySchema.safeParse({ page: "abc" }).success).toBe(false);
  });

  it("rejects malformed account IDs", () => {
    expect(transactionQuerySchema.safeParse({ accountId: "1001" }).success).toBe(false);
  });

  it("accepts seeded account IDs that are not RFC 4122 v4", () => {
    const result = transactionQuerySchema.safeParse({
      accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    });
    expect(result.success).toBe(true);
  });

  it("rejects overly long search text", () => {
    const result = transactionQuerySchema.safeParse({ query: "x".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("escapeLikePattern", () => {
  it("escapes LIKE wildcards and backslashes", () => {
    expect(escapeLikePattern("50%_off\\sale")).toBe("50\\%\\_off\\\\sale");
  });

  it("leaves ordinary text unchanged", () => {
    expect(escapeLikePattern("Loblaws Market")).toBe("Loblaws Market");
  });
});
