// src/app/api/admin/sign-in/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { verifyAdminPassword } from "@/lib/server/auth/admin-password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSession } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

const adminSignInSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(255),
});

const INVALID_CREDENTIALS = {
  code: "INVALID_CREDENTIALS",
  message: "Email or password is incorrect.",
};

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = adminSignInSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });

  try {
    const rows = (await sql`
      SELECT id, display_name, password_hash, role
      FROM users
      WHERE email = ${parsed.data.email}
    `) as { id: string; display_name: string; password_hash: string; role: string }[];

    const user = rows[0];
    if (
      !user ||
      user.role !== "admin" ||
      !(await verifyAdminPassword(parsed.data.password, user.password_hash))
    ) {
      return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
    }

    const token = await createSession(user.id);
    const response = NextResponse.json({
      data: { userId: user.id, displayName: user.display_name, role: "admin" },
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Failed to sign in admin:", error);
    return NextResponse.json(
      { code: "SIGN_IN_FAILED", message: "Sign-in could not be completed." },
      { status: 500 },
    );
  }
}
