// src/app/api/lab/progress/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { getStudentProgress } from "@/lib/server/lab/progress";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    const userId = await requireUserId();
    const progress = await getStudentProgress(userId);
    return NextResponse.json({ data: progress });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load lab progress:", error);
    return NextResponse.json(
      { code: "PROGRESS_FAILED", message: "Progress could not be loaded." },
      { status: 500 },
    );
  }
}
