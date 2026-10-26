// src/app/api/admin/session/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { requireAdminUserId, isAdminRequiredError } from "@/lib/server/admin/guard";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    const userId = await requireAdminUserId();
    return NextResponse.json({ data: { userId, role: "admin" } });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (isAdminRequiredError(error)) {
      return NextResponse.json({ code: "FORBIDDEN", message: "Admin role required." }, { status: 403 });
    }
    console.error("Failed to check admin session:", error);
    return NextResponse.json(
      { code: "ADMIN_FAILED", message: "Admin check could not be completed." },
      { status: 500 },
    );
  }
}
