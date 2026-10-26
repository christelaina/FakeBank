// src/tests/unit/password-lab.test.ts
import { beforeAll, describe, expect, it } from "vitest";
import {
  decryptPassword,
  encryptPassword,
  verifyPassword,
} from "@/lib/server/auth/password";

const SAMPLE_PLAINTEXT = "areyoualright?noimallleft!";
const SAMPLE_STORED = "YjhjYTYxZjkzNzQxYzQyN2IxZWRkYWI4ZjY3OWU0NGY3ZjAzM2NiNWU1ZmI3YmY2YmRiZjg2MmYwYjRjNmI3NA==";

describe("lab password scheme", () => {
  beforeAll(() => {
    // Lab key and IV from the teaching brief. Test-only values.
    process.env.AUTH_LAB_KEY_HEX = "697473736865726c6f636b686f6d6573";
    process.env.AUTH_LAB_IV_HEX = "686f7463686f636f6c6174657761726d";
  });

  it("encrypts the sample password to the expected stored value", () => {
    expect(encryptPassword(SAMPLE_PLAINTEXT)).toBe(SAMPLE_STORED);
  });

  it("decrypts the stored sample back to the plaintext", () => {
    expect(decryptPassword(SAMPLE_STORED)).toBe(SAMPLE_PLAINTEXT);
  });

  it("round-trips arbitrary passwords", () => {
    const password = "Correct horse battery 1!";
    expect(decryptPassword(encryptPassword(password))).toBe(password);
  });

  it("accepts the correct password and rejects others", () => {
    expect(verifyPassword(SAMPLE_PLAINTEXT, SAMPLE_STORED)).toBe(true);
    expect(verifyPassword("wrong-password", SAMPLE_STORED)).toBe(false);
    expect(verifyPassword(SAMPLE_PLAINTEXT, "")).toBe(false);
  });
});
