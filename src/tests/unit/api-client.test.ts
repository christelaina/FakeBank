import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/types/api";

describe("api client failure handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_DATA_MODE = "mock";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("throws ApiError on non-success HTTP responses", async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "live";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Service unavailable", code: "UNAVAILABLE" }),
      }),
    );

    await expect(apiRequest("/api/accounts")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      message: "Service unavailable",
    });
  });

  it("redirects to sign-in when the session has expired", async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "live";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { pathname: "/accounts", assign } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ code: "AUTH_REQUIRED", message: "Sign in required." }),
      }),
    );

    await expect(apiRequest("/api/accounts")).rejects.toMatchObject({ status: 401 });
    expect(assign).toHaveBeenCalledWith("/sign-in");
  });

  it("does not redirect on failed sign-in attempts", async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "live";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { pathname: "/sign-in", assign } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ code: "INVALID_CREDENTIALS", message: "Wrong email or password." }),
      }),
    );

    await expect(apiRequest("/api/auth/sign-in", { method: "POST" })).rejects.toMatchObject({
      status: 401,
    });
    expect(assign).not.toHaveBeenCalled();
  });

  it("throws on network failures without falling back to mock success", async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "live";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Failed to fetch")),
    );

    await expect(apiRequest("/api/accounts")).rejects.toBeInstanceOf(ApiError);
  });
});
