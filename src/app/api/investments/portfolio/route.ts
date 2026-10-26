// src/app/api/investments/portfolio/route.ts
import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { getPortfolio } from "@/lib/server/investments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await getPortfolio() });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load portfolio:", error);
    return NextResponse.json(
      { code: "PORTFOLIO_FAILED", message: "Failed to load portfolio" },
      { status: 500 },
    );
  }
}
