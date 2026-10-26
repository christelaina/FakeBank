import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { createTransfer } from "@/lib/server/transfers";
import { createTransferSchema } from "@/lib/validation/transfers";
import { ApiError } from "@/types/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = createTransferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "INVALID_TRANSFER",
        message: parsed.error.issues[0]?.message ?? "Invalid transfer request.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await createTransfer(parsed.data);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "TRANSFER_REJECTED", message: error.message },
        { status: error.status },
      );
    }
    console.error("Failed to create transfer:", error);
    return NextResponse.json(
      { code: "TRANSFER_FAILED", message: "Transfer could not be completed." },
      { status: 500 },
    );
  }
}
