// Lab-only and intentionally vulnerable: this admin path has no admin role check, so any signed-in student can read it.
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { listVictimActivity } from "@/lib/server/lab/access-control";
import { hasLabDetection, recordDetectionIfCanaryExposed } from "@/lib/server/lab/detections";

export const dynamic = "force-dynamic";

const CHALLENGE_ID = "access-control";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const userId = await requireUserId();
    const victims = await listVictimActivity();

    for (const victim of victims) {
      await recordDetectionIfCanaryExposed(userId, CHALLENGE_ID, victim.accountId, { victims });
    }

    const detected = await hasLabDetection(userId, CHALLENGE_ID);
    const nextStep = detected ? "Flag unlocked. Open /lab/progress to see it and claim your points." : null;

    return NextResponse.json({ data: { victims, nextStep } });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load victim activity:", error);
    return NextResponse.json(
      { code: "VICTIMS_FAILED", message: "Victim activity could not be loaded." },
      { status: 500 },
    );
  }
}
