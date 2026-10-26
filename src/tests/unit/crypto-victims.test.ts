import { describe, expect, it } from "vitest";
import { encryptForCheck, findCryptoVictim } from "@/lib/lab/crypto-victims";

describe("crypto lab victims", () => {
  it("encrypts a correct password to the stored seeded value", () => {
    const victim = findCryptoVictim("metinkz");
    expect(victim).not.toBeNull();
    expect(encryptForCheck("areyoualright?noimallleft!")).toBe(victim?.ciphertext);
  });

  it("does not match a wrong password", () => {
    const victim = findCryptoVictim("metinkz");
    expect(encryptForCheck("areyoualright?noimallleft")).not.toBe(victim?.ciphertext);
  });

  it("looks up usernames case-insensitively and rejects unknown users", () => {
    expect(findCryptoVictim("  MetinKZ ")?.username).toBe("metinkz");
    expect(findCryptoVictim("nobody")).toBeNull();
  });
});
