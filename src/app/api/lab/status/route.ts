// src/app/api/lab/status/route.ts
import { NextResponse } from "next/server";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLabEnabled()) return labNotFoundResponse();
  return NextResponse.json({ data: { enabled: true } });
}
