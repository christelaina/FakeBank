// Pure price-step logic for the simulated market. No database access.
export const TICK_INTERVAL_MS = 5 * 60 * 1000;

export function currentTickBucket(nowMs: number): number {
  return Math.floor(nowMs / TICK_INTERVAL_MS);
}

// Sum of three uniform draws, rescaled to a standard deviation of about 1.
export function nextPrice(
  previous: number,
  volatility: number,
  random: () => number = Math.random,
): number {
  const shock = (random() + random() + random() - 1.5) * 2;
  const next = previous * (1 + shock * volatility);
  return Math.max(0.01, Math.round(next * 10000) / 10000);
}
