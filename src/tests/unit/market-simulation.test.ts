import { describe, expect, it } from "vitest";
import { TICK_INTERVAL_MS, currentTickBucket, nextPrice } from "@/lib/market/simulation";

describe("currentTickBucket", () => {
  it("keeps the same bucket within a 5-minute window and advances on the boundary", () => {
    const start = 10 * TICK_INTERVAL_MS;
    expect(currentTickBucket(start)).toBe(10);
    expect(currentTickBucket(start + TICK_INTERVAL_MS - 1)).toBe(10);
    expect(currentTickBucket(start + TICK_INTERVAL_MS)).toBe(11);
  });
});

describe("nextPrice", () => {
  it("leaves the price unchanged when the random draws are centred", () => {
    expect(nextPrice(50, 0.01, () => 0.5)).toBe(50);
  });

  it("never drops below the floor", () => {
    expect(nextPrice(0.02, 0.9, () => 0)).toBeGreaterThanOrEqual(0.01);
  });

  it("rounds to four decimal places", () => {
    const price = nextPrice(10, 0.0123, () => 0.9);
    expect(Math.round(price * 10000) / 10000).toBe(price);
  });
});
