// src/lib/server/auth/session.ts
// Server-only. Sessions are random tokens in an httpOnly cookie. The database stores only a SHA-256 hash of each token.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const SESSION_COOKIE = "fakebank_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export class AuthRequiredError extends Error {
  constructor() {
    super("Sign in required");
    this.name = "AuthRequiredError";
  }
}

export function isAuthRequiredError(error: unknown): error is AuthRequiredError {
  return error instanceof AuthRequiredError;
}

// Standard 401 body for route handlers when no valid session exists.
export function authRequiredResponse() {
  return NextResponse.json(
    { code: "AUTH_REQUIRED", message: "Sign in required." },
    { status: 401 },
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Creates a session row for the user and returns the raw token for the cookie.
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO auth_sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, now() + make_interval(secs => ${SESSION_MAX_AGE_SECONDS}))
  `;
  return token;
}

// Returns the signed-in user's id, or null when there is no valid, unexpired session.
export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = (await sql`
    SELECT user_id
    FROM auth_sessions
    WHERE token_hash = ${hashToken(token)} AND expires_at > now()
  `) as { user_id: string }[];
  return rows[0]?.user_id ?? null;
}

// Use in server modules that read or write user data. Throws AuthRequiredError when signed out.
export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthRequiredError();
  return userId;
}

// Removes the session row for the token in the cookie, if any.
export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await sql`DELETE FROM auth_sessions WHERE token_hash = ${hashToken(token)}`;
}
