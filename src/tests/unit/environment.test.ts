import { afterEach, describe, expect, it } from "vitest";
import {
  assertLiveApiConfigured,
  getEnvironment,
} from "@/lib/config/environment";
import { createRepositoriesForMode, getRepositories, resetRepositoryCache } from "@/lib/api";

describe("environment and data mode", () => {
  afterEach(() => {
    resetRepositoryCache();
    process.env.NEXT_PUBLIC_DATA_MODE = "mock";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("defaults to mock mode", () => {
    delete process.env.NEXT_PUBLIC_DATA_MODE;
    const env = getEnvironment();
    expect(env.isMockMode).toBe(true);
    expect(getRepositories().mode).toBe("mock");
  });

  it("requires API URL in live mode", () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "live";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const env = getEnvironment();
    expect(env.isLiveMode).toBe(true);
    expect(env.apiBaseUrl).toBeNull();
    expect(() => assertLiveApiConfigured(env)).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it("creates live repositories when requested", () => {
    const repos = createRepositoriesForMode("live");
    expect(repos.mode).toBe("live");
  });


  it("does not silently fall back when live mode is misconfigured", () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "live";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    resetRepositoryCache();
    expect(() => getRepositories()).toThrow(/not configured/i);
  });
});
