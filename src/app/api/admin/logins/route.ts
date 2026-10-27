// src/app/api/admin/logins/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { requireAdminUserId, isAdminRequiredError } from "@/lib/server/admin/guard";
import { listLogins } from "@/lib/server/admin/logins";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    await requireAdminUserId();
    const logins = await listLogins();
    return NextResponse.json({ data: logins });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (isAdminRequiredError(error)) {
      return NextResponse.json({ code: "FORBIDDEN", message: "Admin role required." }, { status: 403 });
    }
    console.error("Failed to load logins:", error);
    return NextResponse.json(
      { code: "LOGINS_FAILED", message: "Logins could not be loaded." },
      { status: 500 },
    );
  }
}
