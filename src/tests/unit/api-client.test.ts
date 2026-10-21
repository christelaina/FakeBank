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
