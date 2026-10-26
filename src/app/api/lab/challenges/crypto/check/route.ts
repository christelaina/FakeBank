// Lab-only and intentionally vulnerable (weak AES-128 with a key in the page source). Reached only when LAB_MODE is on.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { generateFlag } from "@/lib/lab/flags";
import { encryptForCheck, findCryptoVictim } from "@/lib/lab/crypto-victims";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { recordLabDetection } from "@/lib/server/lab/detections";

export const dynamic = "force-dynamic";

const CHALLENGE_ID = "crypto";

const bodySchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const userId = await requireUserId();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_FAILED", message: "Enter a username and a password." },
        { status: 400 },
      );
    }

    const victim = findCryptoVictim(parsed.data.username);
    if (!victim || encryptForCheck(parsed.data.password) !== victim.ciphertext) {
      return NextResponse.json(
        { code: "NO_MATCH", message: "That password does not decrypt to this user's record." },
        { status: 422 },
      );
    }

    await recordLabDetection(userId, CHALLENGE_ID);
    return NextResponse.json({
      data: { challengeId: CHALLENGE_ID, flag: generateFlag(userId, CHALLENGE_ID) },
    });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to check crypto challenge:", error);
    return NextResponse.json(
      { code: "CHECK_FAILED", message: "The check could not be completed." },
      { status: 500 },
    );
  }
}
