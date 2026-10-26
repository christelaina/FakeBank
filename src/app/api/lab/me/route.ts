// src/app/api/lab/me/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isLabEnabled } from "@/lib/lab/config";
import { getSessionUserId } from "@/lib/server/auth/session";
import type { LabMe } from "@/types/lab";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) {
    const body: LabMe = { enabled: false, role: null };
    return NextResponse.json({ data: body });
  }
  const userId = await getSessionUserId();
  if (!userId) {
    const body: LabMe = { enabled: true, role: null };
    return NextResponse.json({ data: body });
  }
  const rows = (await sql`SELECT role FROM users WHERE id = ${userId}`) as { role: string }[];
  const role = rows[0]?.role === "admin" ? "admin" : "student";
  const body: LabMe = { enabled: true, role };
  return NextResponse.json({ data: body });
}
