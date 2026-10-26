// src/app/api/lab/claims/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { claimLabFlag, LabClaimError } from "@/lib/server/lab/claims";
import { isClaimBlocked, recordWrongClaim } from "@/lib/server/lab/claim-rate-limit";

export const dynamic = "force-dynamic";

const claimSchema = z.object({
  challengeId: z.string().min(1).max(64),
  flag: z.string().min(1).max(200),
});

const STATUS_BY_CODE = {
  CHALLENGE_NOT_FOUND: 404,
  NOT_DETECTED: 403,
  WRONG_FLAG: 400,
} as const;

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const studentId = await requireUserId();
    const parsed = claimSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_FAILED", message: "Enter a challenge and a flag." },
        { status: 400 },
      );
    }

    if (isClaimBlocked(studentId)) {
      return NextResponse.json(
        { code: "TOO_MANY_ATTEMPTS", message: "Too many incorrect flags. Wait a minute and try again." },
        { status: 429 },
      );
    }

    let result;
    try {
      result = await claimLabFlag(studentId, parsed.data.challengeId, parsed.data.flag);
    } catch (error) {
      if (error instanceof LabClaimError && error.code === "WRONG_FLAG") recordWrongClaim(studentId);
      throw error;
    }
    return NextResponse.json({ data: result });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (error instanceof LabClaimError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: STATUS_BY_CODE[error.code] },
      );
    }
    console.error("Failed to claim lab flag:", error);
    return NextResponse.json(
      { code: "CLAIM_FAILED", message: "The flag could not be submitted." },
      { status: 500 },
    );
  }
}
