// src/app/api/security/activity/route.ts
import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { getSecurityActivity } from "@/lib/server/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await getSecurityActivity() });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load security activity:", error);
    return NextResponse.json(
      { code: "SECURITY_FAILED", message: "Failed to load security activity" },
      { status: 500 },
    );
  }
}
