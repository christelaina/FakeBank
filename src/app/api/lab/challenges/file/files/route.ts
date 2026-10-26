// Lab-only and intentionally vulnerable: stores content without checking it matches the declared type.
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { containsScript, labFileSchema, nameMatchesType } from "@/lib/lab/file-challenge";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { recordLabDetection } from "@/lib/server/lab/detections";
import { insertLabFile } from "@/lib/server/lab/file-uploads";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const userId = await requireUserId();
    const parsed = labFileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { code: "INVALID_FILE", message: parsed.error.issues[0]?.message ?? "Invalid file." },
        { status: 400 },
      );
    }

    if (
      !nameMatchesType(parsed.data.fileName, parsed.data.mimeType) &&
      containsScript(parsed.data.content)
    ) {
      await recordLabDetection(userId, "file");
    }

    const id = await insertLabFile(
      userId,
      parsed.data.fileName,
      parsed.data.mimeType,
      parsed.data.purpose,
      parsed.data.content,
    );
    return NextResponse.json(
      { data: { id, fileName: parsed.data.fileName, mimeType: parsed.data.mimeType, purpose: parsed.data.purpose } },
      { status: 201 },
    );
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to save lab file:", error);
    return NextResponse.json(
      { code: "FILE_SAVE_FAILED", message: "The file could not be saved." },
      { status: 500 },
    );
  }
}
