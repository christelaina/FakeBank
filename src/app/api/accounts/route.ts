import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { listAccounts } from "@/lib/server/accounts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json({ data: accounts });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load accounts:", error);
    return NextResponse.json(
      { error: "Failed to load accounts" },
      { status: 500 }
    );
  }
}
