import { createHttpRepositories } from "@/lib/api/http";
import { createMockRepositories } from "@/lib/api/mock";
import type { FakeBankRepositories } from "@/lib/api/repositories";
import { getEnvironment } from "@/lib/config/environment";
import { ApiError } from "@/types/api";

export type { FakeBankRepositories } from "@/lib/api/repositories";
export { ApiError } from "@/types/api";

let cached: FakeBankRepositories | null = null;

/**
 * Returns the active data repository based on environment configuration.
 * Live mode never silently falls back to mock on failure.
 */
export function getRepositories(): FakeBankRepositories {
  if (cached) return cached;

  const env = getEnvironment();

  if (env.isLiveMode) {
    if (!env.apiBaseUrl) {
      throw new ApiError(
        "Live API mode is selected but NEXT_PUBLIC_API_BASE_URL is not configured.",
        { status: 500, code: "LIVE_API_MISCONFIGURED" },
      );
    }
    cached = createHttpRepositories();
    return cached;
  }

  cached = createMockRepositories();
  return cached;
}

/** Test helper to reset provider cache between cases. */
export function resetRepositoryCache(): void {
  cached = null;
}

/**
 * Test/helper factory that builds repositories without mutating NEXT_PUBLIC_* env vars
 * (those are inlined by Next.js at build time and cannot be assigned).
 */
export function createRepositoriesForMode(mode: "mock" | "live"): FakeBankRepositories {
  if (mode === "live") {
    return createHttpRepositories();
  }
  return createMockRepositories();
}
