import { assertLiveApiConfigured, getEnvironment } from "@/lib/config/environment";
import { ApiError } from "@/types/api";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Use a relative URL on the same origin instead of NEXT_PUBLIC_API_BASE_URL. */
  sameOrigin?: boolean;
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Central HTTP helper for live API mode.
 * Requests remain inspectable in DevTools; no secret encoding is applied.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const env = getEnvironment();
  const baseUrl = options.sameOrigin ? "" : assertLiveApiConfigured(env);
  const requestId = createRequestId();
  const method = options.method ?? "GET";
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal: options.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed.",
      { status: 0, requestId, code: "NETWORK_ERROR" },
    );
  }

  const responseRequestId = response.headers.get("x-request-id") ?? requestId;
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}.`;
    const code =
      typeof payload === "object" &&
      payload &&
      "code" in payload &&
      typeof (payload as { code: unknown }).code === "string"
        ? (payload as { code: string }).code
        : undefined;

    // Session expired or was removed server-side: send the user to sign in.
    if (response.status === 401 && code === "AUTH_REQUIRED" && typeof window !== "undefined") {
      if (window.location.pathname !== "/sign-in") {
        window.location.assign("/sign-in");
      }
    }

    throw new ApiError(message, {
      status: response.status,
      requestId: responseRequestId,
      code,
    });
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}
