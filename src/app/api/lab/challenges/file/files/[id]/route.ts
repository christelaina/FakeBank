// Lab-only and intentionally vulnerable: serves stored content with no Content-Type so the browser sniffs it. Owner-only.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { getOwnedLabFile } from "@/lib/server/lab/file-uploads";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const userId = await requireUserId();
    const id = z.string().uuid().safeParse(params.id);
    const file = id.success ? await getOwnedLabFile(userId, id.data) : null;
    if (!file) {
      return NextResponse.json({ code: "NOT_FOUND", message: "File not found." }, { status: 404 });
    }

    return new Response(new Uint8Array(Buffer.from(file.content, "utf8")), {
      headers: {
        "Content-Security-Policy": "connect-src 'self'",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load lab file:", error);
    return NextResponse.json(
      { code: "FILE_LOAD_FAILED", message: "The file could not be loaded." },
      { status: 500 },
    );
  }
}
