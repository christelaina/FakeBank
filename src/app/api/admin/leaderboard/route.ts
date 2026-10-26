// src/app/api/admin/leaderboard/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { requireAdminUserId, isAdminRequiredError } from "@/lib/server/admin/guard";
import { getLeaderboard } from "@/lib/server/lab/progress";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    await requireAdminUserId();
    const rows = await getLeaderboard();
    return NextResponse.json({ data: rows });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (isAdminRequiredError(error)) {
      return NextResponse.json({ code: "FORBIDDEN", message: "Admin role required." }, { status: 403 });
    }
    console.error("Failed to load leaderboard:", error);
    return NextResponse.json(
      { code: "LEADERBOARD_FAILED", message: "Leaderboard could not be loaded." },
      { status: 500 },
    );
  }
}
