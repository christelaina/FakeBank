import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { placeTrade } from "@/lib/server/trading";
import { createTradeSchema } from "@/lib/validation/trades";
import { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

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

  const parsed = createTradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "INVALID_TRADE",
        message: parsed.error.issues[0]?.message ?? "Invalid trade request.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await placeTrade(parsed.data);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "TRADE_REJECTED", message: error.message },
        { status: error.status },
      );
    }
    console.error("Failed to place trade:", error);
    return NextResponse.json(
      { code: "TRADE_FAILED", message: "Trade could not be completed." },
      { status: 500 },
    );
  }
}
