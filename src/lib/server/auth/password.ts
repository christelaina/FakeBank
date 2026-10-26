// src/lib/server/auth/password.ts
// Server-only. Teaching lab: passwords use AES-128-CBC with a fixed key and IV from
// server env vars. Fixed key and IV make the scheme deterministic and reversible, which
// is the weakness this lab demonstrates. Do not reuse this scheme for real credentials.
//
// Stored format: base64( hex-text of the AES ciphertext ). Example:
//   areyoualright?noimallleft! -> YjhjYTYx...NzQ=
import { createCipheriv, createDecipheriv, timingSafeEqual } from "node:crypto";

const HEX_16_BYTES = /^[0-9a-f]{32}$/i;

function labKeyAndIv(): { key: Buffer; iv: Buffer } {
  const keyHex = process.env.AUTH_LAB_KEY_HEX ?? "";
  const ivHex = process.env.AUTH_LAB_IV_HEX ?? "";
  if (!HEX_16_BYTES.test(keyHex) || !HEX_16_BYTES.test(ivHex)) {
    throw new Error("AUTH_LAB_KEY_HEX and AUTH_LAB_IV_HEX must each be 32 hex characters.");
  }
  return { key: Buffer.from(keyHex, "hex"), iv: Buffer.from(ivHex, "hex") };
}

// Encrypts a plaintext password into the stored format.
export function encryptPassword(password: string): string {
  const { key, iv } = labKeyAndIv();
  const cipher = createCipheriv("aes-128-cbc", key, iv);
  const ciphertextHex = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]).toString("hex");
  return Buffer.from(ciphertextHex, "utf8").toString("base64");
}

// Decrypts a stored value back to plaintext. Used by tests and the lab walkthrough.
export function decryptPassword(stored: string): string {
  const { key, iv } = labKeyAndIv();
  const ciphertextHex = Buffer.from(stored, "base64").toString("utf8");
  const decipher = createDecipheriv("aes-128-cbc", key, iv);
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

// Checks a sign-in attempt. The scheme is deterministic, so the stored value is re-created and compared.
export function verifyPassword(password: string, stored: string): boolean {
  const expected = Buffer.from(encryptPassword(password));
  const actual = Buffer.from(stored);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
