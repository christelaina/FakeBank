import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { grantMagicLoan } from "@/lib/server/magic-loan";

export async function POST() {
  try {
    const result = await grantMagicLoan();
    if (!result) {
      return NextResponse.json(
        { code: "NO_CHEQUING_ACCOUNT", message: "No active chequing account was found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to grant magic loan:", error);
    return NextResponse.json(
      { code: "MAGIC_LOAN_FAILED", message: "Magic loan could not be added." },
      { status: 500 },
    );
  }
}
