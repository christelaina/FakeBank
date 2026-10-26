// src/app/api/admin/victims/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { requireAdminUserId, isAdminRequiredError } from "@/lib/server/admin/guard";
import { listLabVictimAccounts } from "@/lib/server/admin/victims";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    await requireAdminUserId();
    const victims = await listLabVictimAccounts();
    return NextResponse.json({ data: victims });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (isAdminRequiredError(error)) {
      return NextResponse.json({ code: "FORBIDDEN", message: "Admin role required." }, { status: 403 });
    }
    console.error("Failed to load victim accounts:", error);
    return NextResponse.json(
      { code: "VICTIMS_FAILED", message: "Victim accounts could not be loaded." },
      { status: 500 },
    );
  }
}
