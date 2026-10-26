import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { ApiError } from "@/types/api";
import { getProfilePicture, saveProfilePicture } from "@/lib/server/profile-picture";
import { getPrivateObject } from "@/lib/server/storage";
import {
  profilePictureUploadSchema,
  sniffImageMime,
  PROFILE_PICTURE_MAX_BYTES,
} from "@/lib/validation/profile-picture";

export const dynamic = "force-dynamic";

// Stored images are served inert: no script, no framing, and nosniff.
const IMAGE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; sandbox",
  "Cache-Control": "private, max-age=86400, immutable",
};

export async function GET() {
  try {
    const picture = await getProfilePicture();
    if (!picture) {
      return NextResponse.json(
        { code: "PICTURE_NOT_FOUND", message: "No profile picture set." },
        { status: 404 },
      );
    }
    const body = picture.blobPathname
      ? (await getPrivateObject(picture.blobPathname))?.stream ?? null
      : new Uint8Array(Buffer.from(picture.legacyBase64 ?? "", "base64"));
    if (!body) {
      return NextResponse.json(
        { code: "PICTURE_NOT_FOUND", message: "No profile picture set." },
        { status: 404 },
      );
    }
    return new NextResponse(body, {
      headers: { ...IMAGE_HEADERS, "Content-Type": picture.mimeType },
    });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load profile picture:", error);
    return NextResponse.json(
      { code: "PICTURE_FAILED", message: "Profile picture could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = profilePictureUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "INVALID_PICTURE",
        message: parsed.error.issues[0]?.message ?? "Invalid profile picture.",
      },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(Buffer.from(parsed.data.contentBase64, "base64"));
  if (bytes.length !== parsed.data.sizeBytes || bytes.length > PROFILE_PICTURE_MAX_BYTES) {
    return NextResponse.json(
      { code: "SIZE_MISMATCH", message: "File size does not match the uploaded content." },
      { status: 400 },
    );
  }
  if (sniffImageMime(bytes) !== parsed.data.mimeType) {
    return NextResponse.json(
      { code: "TYPE_MISMATCH", message: "File contents do not match the declared image type." },
      { status: 400 },
    );
  }

  try {
    await saveProfilePicture({
      mimeType: parsed.data.mimeType,
      bytes,
    });
    return NextResponse.json(
      {
        data: {
          uploadId: randomUUID(),
          status: "accepted",
          message: "Profile picture updated.",
          verifiedByBackend: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to save profile picture:", error);
    return NextResponse.json(
      { code: "PICTURE_UPLOAD_FAILED", message: "Profile picture could not be saved." },
      { status: 500 },
    );
  }
}
