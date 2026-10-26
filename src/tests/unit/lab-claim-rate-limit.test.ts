import { describe, expect, it } from "vitest";
import { isClaimBlocked, recordWrongClaim } from "@/lib/server/lab/claim-rate-limit";

describe("lab claim rate limit", () => {
  it("blocks after five wrong claims within a minute", () => {
    const student = "rate-limit-block";
    const start = 1_000_000;
    for (let i = 0; i < 5; i += 1) {
      expect(isClaimBlocked(student, start)).toBe(false);
      recordWrongClaim(student, start + i);
    }
    expect(isClaimBlocked(student, start + 10)).toBe(true);
  });

  it("unblocks once the window has passed", () => {
    const student = "rate-limit-window";
    const start = 2_000_000;
    for (let i = 0; i < 5; i += 1) recordWrongClaim(student, start);
    expect(isClaimBlocked(student, start + 59_000)).toBe(true);
    expect(isClaimBlocked(student, start + 60_000)).toBe(false);
  });

  it("tracks students separately", () => {
    const start = 3_000_000;
    for (let i = 0; i < 5; i += 1) recordWrongClaim("rate-limit-a", start);
    expect(isClaimBlocked("rate-limit-b", start)).toBe(false);
  });
});
