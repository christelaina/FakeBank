// src/app/api/lab/hints/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { LabHintError, listHints, purchaseHint } from "@/lib/server/lab/hints";

export const dynamic = "force-dynamic";

const purchaseSchema = z.object({
  challengeId: z.string().min(1).max(64),
});

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    const studentId = await requireUserId();
    const hints = await listHints(studentId);
    return NextResponse.json({ data: hints });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load hints:", error);
    return NextResponse.json(
      { code: "HINTS_FAILED", message: "Walkthroughs could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    const studentId = await requireUserId();
    const parsed = purchaseSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_FAILED", message: "Choose a walkthrough to buy." },
        { status: 400 },
      );
    }
    const result = await purchaseHint(studentId, parsed.data.challengeId);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (error instanceof LabHintError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: 404 });
    }
    console.error("Failed to buy hint:", error);
    return NextResponse.json(
      { code: "HINT_FAILED", message: "The walkthrough could not be bought." },
      { status: 500 },
    );
  }
}
