// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/types/api";

const createTransfer = vi.fn();

vi.mock("@/lib/server/transfers", () => ({
  createTransfer: (...args: unknown[]) => createTransfer(...args),
}));

vi.mock("@/lib/server/auth/session", () => ({
  isAuthRequiredError: () => false,
  authRequiredResponse: () => Response.json({ code: "AUTH_REQUIRED" }, { status: 401 }),
}));

const { POST } = await import("@/app/api/transfers/route");

const valid = {
  sourceAccountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  destinationAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  amount: 25,
  idempotencyKey: "0f8fad5b-d9cb-469f-a165-8c0e7e1b2c3d",
};

function post(body: unknown) {
  return new Request("http://localhost/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/transfers", () => {
  beforeEach(() => {
    createTransfer.mockReset();
  });

  it("returns 201 with the transfer result in data", async () => {
    createTransfer.mockResolvedValue({
      transferId: "t1",
      status: "completed",
      message: "Transfer completed.",
      createdAt: "2026-10-26T00:00:00.000Z",
      verifiedByBackend: true,
    });
    const response = await POST(post(valid));
    expect(response.status).toBe(201);
    expect((await response.json()).data.transferId).toBe("t1");
  });

  it("returns 400 for malformed JSON without calling the service", async () => {
    const response = await POST(post("{not json"));
    expect(response.status).toBe(400);
    expect(createTransfer).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid destination without calling the service", async () => {
    const response = await POST(post({ ...valid, destinationAccountId: "1001" }));
    expect(response.status).toBe(400);
    expect(createTransfer).not.toHaveBeenCalled();
  });

  it("maps domain rejections to their status and code", async () => {
    createTransfer.mockRejectedValue(
      new ApiError("Insufficient available funds.", { status: 422, code: "INSUFFICIENT_FUNDS" }),
    );
    const response = await POST(post(valid));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      code: "INSUFFICIENT_FUNDS",
      message: "Insufficient available funds.",
    });
  });

  it("returns a generic 500 without leaking database errors", async () => {
    createTransfer.mockRejectedValue(new Error("connection string postgres://secret"));
    const response = await POST(post(valid));
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.code).toBe("TRANSFER_FAILED");
    expect(JSON.stringify(body)).not.toContain("postgres://");
  });
});
