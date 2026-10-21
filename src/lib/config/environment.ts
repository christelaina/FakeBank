import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_DATA_MODE: z.enum(["mock", "live"]).default("mock"),
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
});

export type DataMode = "mock" | "live";

export interface AppEnvironment {
  dataMode: DataMode;
  apiBaseUrl: string | null;
  isMockMode: boolean;
  isLiveMode: boolean;
}

function readRawEnv() {
  return {
    NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  };
}

export function getEnvironment(): AppEnvironment {
  const parsed = envSchema.safeParse(readRawEnv());

  if (!parsed.success) {
    return {
      dataMode: "mock",
      apiBaseUrl: null,
      isMockMode: true,
      isLiveMode: false,
    };
  }

  const dataMode = parsed.data.NEXT_PUBLIC_DATA_MODE;
  const apiBaseUrl = parsed.data.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || null;

  if (dataMode === "live" && !apiBaseUrl) {
    // Configuration is invalid; callers should surface a clear error.
    return {
      dataMode: "live",
      apiBaseUrl: null,
      isMockMode: false,
      isLiveMode: true,
    };
  }

  return {
    dataMode,
    apiBaseUrl,
    isMockMode: dataMode === "mock",
    isLiveMode: dataMode === "live",
  };
}

export function assertLiveApiConfigured(env: AppEnvironment = getEnvironment()): string {
  if (!env.isLiveMode) {
    throw new Error("Live API helpers were called while DATA_MODE is mock.");
  }
  if (!env.apiBaseUrl) {
    throw new Error(
      "Live API mode is enabled but NEXT_PUBLIC_API_BASE_URL is not configured.",
    );
  }
  return env.apiBaseUrl;
}
