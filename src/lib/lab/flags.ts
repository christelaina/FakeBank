import { createHmac } from "node:crypto";

const MIN_SECRET_LENGTH = 32;

// Deterministic per student and challenge. Requires the server secret LAB_SECRET.
export function generateFlag(studentId: string, challengeId: string): string {
  const secret = process.env.LAB_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`LAB_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  }
  const digest = createHmac("sha256", secret)
    .update(`${studentId}:${challengeId}`)
    .digest("hex");
  return `BC2{${digest.slice(0, 32)}}`;
}
