// Server-only. Fictional lab data. The key and IV are intentionally shown to students in the page source.
import { createCipheriv } from "node:crypto";

export const CRYPTO_KEY = "itssherlockhomes";
export const CRYPTO_IV = "hotchocolatewarm";

// Same values as the seeded password_hash column: base64 of the hex AES ciphertext.
export const CRYPTO_VICTIMS = [
  { username: "metinkz", ciphertext: "YjhjYTYxZjkzNzQxYzQyN2IxZWRkYWI4ZjY3OWU0NGY3ZjAzM2NiNWU1ZmI3YmY2YmRiZjg2MmYwYjRjNmI3NA==" },
  { username: "forpetessake", ciphertext: "YzY1ZTVmMDExNWY0MjU0YzNiMGEwMjZlYjk1ZTFiYzM5MzgzZGJiMGQ5YmRkMTZkYTBiMDA1MzQzNzMxYTM4Mg==" },
  { username: "hooktopus", ciphertext: "YTgxM2RhY2MwZGE1ODg0OWY3OWZhOTg5ZDE1ZWIwNzU3NWZhYjJkNmFjNWIxYzMyZTAwMDIyMDdiM2NhMjYwYw==" },
  { username: "innocentbystander", ciphertext: "ZDY4MTI0YjUzNjg0YmIzN2NhODY5ZmNiZDI0YWVmMzIyYWQ1NWFiMzcyNmUwYzhiNDViMzZlZTUyOTYwYTM5NA==" },
] as const;

export function encryptForCheck(plaintext: string): string {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(CRYPTO_KEY), Buffer.from(CRYPTO_IV));
  const hex = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]).toString("hex");
  return Buffer.from(hex).toString("base64");
}

export function findCryptoVictim(username: string) {
  return CRYPTO_VICTIMS.find((victim) => victim.username === username.trim().toLowerCase()) ?? null;
}
