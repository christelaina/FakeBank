// Server-only. Every admin route must call requireAdminUserId() before reading or writing.
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";

export class AdminRequiredError extends Error {
  constructor() {
    super("Admin role required");
    this.name = "AdminRequiredError";
  }
}

export function isAdminRequiredError(error: unknown): error is AdminRequiredError {
  return error instanceof AdminRequiredError;
}

export async function requireAdminUserId(): Promise<string> {
  const userId = await requireUserId();
  const rows = (await sql`
    SELECT role FROM users WHERE id = ${userId}
  `) as { role: string }[];
  if (rows[0]?.role !== "admin") throw new AdminRequiredError();
  return userId;
}
