// src/app/api/profile/history/route.ts
import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { getChangeHistory } from "@/lib/server/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await getChangeHistory() });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load profile history:", error);
    return NextResponse.json(
      { code: "HISTORY_FAILED", message: "Failed to load profile history" },
      { status: 500 },
    );
  }
}
