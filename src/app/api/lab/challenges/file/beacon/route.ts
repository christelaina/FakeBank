// Lab-only beacon. Called by a script inside a stored file; records a detection only for a mismatched file that contains a script.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { containsScript, nameMatchesType, type LabFileMimeType } from "@/lib/lab/file-challenge";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { recordLabDetection } from "@/lib/server/lab/detections";
import { getOwnedLabFile } from "@/lib/server/lab/file-uploads";

export const dynamic = "force-dynamic";

const CHALLENGE_ID = "file";

const beaconSchema = z.object({ fileId: z.string().uuid() });

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const userId = await requireUserId();
    const parsed = beaconSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ code: "INVALID_BEACON", message: "Invalid beacon." }, { status: 400 });
    }

    const file = await getOwnedLabFile(userId, parsed.data.fileId);
    if (!file) {
      return NextResponse.json({ code: "NOT_FOUND", message: "File not found." }, { status: 404 });
    }

    const detected =
      !nameMatchesType(file.fileName, file.mimeType as LabFileMimeType) && containsScript(file.content);
    if (detected) await recordLabDetection(userId, CHALLENGE_ID);

    return NextResponse.json({ data: { challengeId: CHALLENGE_ID, detected } });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to record file detection:", error);
    return NextResponse.json(
      { code: "BEACON_FAILED", message: "The detection could not be recorded." },
      { status: 500 },
    );
  }
}
