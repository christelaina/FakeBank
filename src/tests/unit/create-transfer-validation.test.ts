import { describe, expect, it } from "vitest";
import { createTransferSchema } from "@/lib/validation/transfers";

const SOURCE = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const DESTINATION = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const KEY = "0f8fad5b-d9cb-469f-a165-8c0e7e1b2c3d";

const valid = {
  sourceAccountId: SOURCE,
  destinationAccountId: DESTINATION,
  amount: 25.5,
  idempotencyKey: KEY,
};

describe("createTransferSchema", () => {
  it("accepts a well-formed transfer", () => {
    expect(createTransferSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects the same source and destination", () => {
    const result = createTransferSchema.safeParse({ ...valid, destinationAccountId: SOURCE });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID destination", () => {
    const result = createTransferSchema.safeParse({ ...valid, destinationAccountId: "1001" });
    expect(result.success).toBe(false);
  });

  it("rejects zero, negative, and over-limit amounts", () => {
    expect(createTransferSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(createTransferSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false);
    expect(createTransferSchema.safeParse({ ...valid, amount: 1_000_001 }).success).toBe(false);
  });

  it("rejects more than two decimal places", () => {
    expect(createTransferSchema.safeParse({ ...valid, amount: 10.001 }).success).toBe(false);
  });

  it("rejects descriptions longer than 140 characters", () => {
    const result = createTransferSchema.safeParse({ ...valid, description: "x".repeat(141) });
    expect(result.success).toBe(false);
  });

  it("requires an idempotency key", () => {
    const { idempotencyKey: _unused, ...withoutKey } = valid;
    expect(createTransferSchema.safeParse(withoutKey).success).toBe(false);
  });
});
