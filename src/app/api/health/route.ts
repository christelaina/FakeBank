import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`SELECT 1`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      { success: false, message: "Database connection failed" },
      { status: 500 }
    );
  }
}