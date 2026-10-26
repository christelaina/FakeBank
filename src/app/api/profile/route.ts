// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { getProfile, updateProfile } from "@/lib/server/profile";
import { updateProfileSchema } from "@/lib/validation/profile";
import { isLabEnabled } from "@/lib/lab/config";
import { hasExecutableMarkup } from "@/lib/lab/xss";
import { recordLabDetection } from "@/lib/server/lab/detections";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await getProfile() });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load profile:", error);
    return NextResponse.json({ code: "PROFILE_FAILED", message: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "INVALID_PROFILE",
        message: parsed.error.issues[0]?.message ?? "Invalid profile update.",
      },
      { status: 400 },
    );
  }

  try {
    const profile = await updateProfile(parsed.data);
    if (isLabEnabled() && hasExecutableMarkup(profile.displayName)) {
      await recordLabDetection(profile.id, "xss");
    }
    return NextResponse.json({ data: profile });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { code: "PROFILE_UPDATE_FAILED", message: "Profile could not be updated." },
      { status: 500 },
    );
  }
}
