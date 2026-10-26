// Server-only. In-memory per server instance, so counts reset on restart.
const WINDOW_MS = 60_000;
const MAX_WRONG_CLAIMS = 5;

const wrongClaimTimes = new Map<string, number[]>();

function recentWrongClaims(studentId: string, now: number): number[] {
  const recent = (wrongClaimTimes.get(studentId) ?? []).filter((time) => now - time < WINDOW_MS);
  wrongClaimTimes.set(studentId, recent);
  return recent;
}

export function isClaimBlocked(studentId: string, now = Date.now()): boolean {
  return recentWrongClaims(studentId, now).length >= MAX_WRONG_CLAIMS;
}

export function recordWrongClaim(studentId: string, now = Date.now()): void {
  const recent = recentWrongClaims(studentId, now);
  recent.push(now);
  wrongClaimTimes.set(studentId, recent);
}
