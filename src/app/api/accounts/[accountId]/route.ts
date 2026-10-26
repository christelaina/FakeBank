import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { getAccount } from "@/lib/server/accounts";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { accountId: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const account = await getAccount(params.accountId);

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: account });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load account:", error);
    return NextResponse.json(
      { error: "Failed to load account" },
      { status: 500 }
    );
  }
}