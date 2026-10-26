import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { getDashboardSummary } from "@/lib/server/dashboard";

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load dashboard:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
