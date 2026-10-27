// src/app/api/admin/student-logins/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { requireAdminUserId, isAdminRequiredError } from "@/lib/server/admin/guard";
import { listStudentLogins } from "@/lib/server/admin/student-logins";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  try {
    await requireAdminUserId();
    const logins = await listStudentLogins();
    return NextResponse.json({ data: logins });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    if (isAdminRequiredError(error)) {
      return NextResponse.json({ code: "FORBIDDEN", message: "Admin role required." }, { status: 403 });
    }
    console.error("Failed to load student logins:", error);
    return NextResponse.json(
      { code: "STUDENT_LOGINS_FAILED", message: "Student logins could not be loaded." },
      { status: 500 },
    );
  }
}
