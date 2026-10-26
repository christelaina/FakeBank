// Lab-only and intentionally vulnerable (race condition). It checks the balance, waits, then debits
// without re-checking, so parallel requests can overdraw the account. Reached only when LAB_MODE is on.
import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { isLabEnabled, labNotFoundResponse } from "@/lib/lab/config";
import { authRequiredResponse, isAuthRequiredError, requireUserId } from "@/lib/server/auth/session";
import { recordLabDetection } from "@/lib/server/lab/detections";

export const dynamic = "force-dynamic";

const PROCESSING_DELAY_MS = 500;

const bodySchema = z.object({
  sourceAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  amount: z.number().positive().max(10_000),
});

export async function POST(request: Request) {
  if (!isLabEnabled()) return labNotFoundResponse();

  try {
    const userId = await requireUserId();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ code: "INVALID_TRANSFER", message: "Invalid transfer request." }, { status: 400 });
    }
    const { sourceAccountId, destinationAccountId, amount } = parsed.data;

    const sourceRows = (await sql`
      SELECT available_balance FROM accounts
      WHERE id = ${sourceAccountId} AND user_id = ${userId} AND type <> 'credit'
    `) as { available_balance: string }[];
    const destinationRows = await sql`
      SELECT id FROM accounts WHERE id = ${destinationAccountId} AND user_id = ${userId}
    `;
    if (!sourceRows[0] || destinationRows.length === 0) {
      return NextResponse.json({ code: "ACCOUNT_NOT_FOUND", message: "Account not found." }, { status: 404 });
    }
    if (Number(sourceRows[0].available_balance) < amount) {
      return NextResponse.json({ code: "INSUFFICIENT_FUNDS", message: "Insufficient available funds." }, { status: 422 });
    }

    // The balance check above is stale by the time the debit runs.
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));

    const debited = (await sql`
      UPDATE accounts
      SET balance = balance - ${amount}, available_balance = available_balance - ${amount}, updated_at = now()
      WHERE id = ${sourceAccountId}
      RETURNING available_balance
    `) as { available_balance: string }[];
    await sql`
      UPDATE accounts
      SET balance = balance + ${amount}, available_balance = available_balance + ${amount}, updated_at = now()
      WHERE id = ${destinationAccountId}
    `;

    if (Number(debited[0].available_balance) < 0) {
      await recordLabDetection(userId, "race");
    }

    return NextResponse.json(
      { data: { status: "completed", message: "Transfer completed.", availableBalance: Number(debited[0].available_balance) } },
      { status: 201 },
    );
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to process lab transfer:", error);
    return NextResponse.json(
      { code: "TRANSFER_FAILED", message: "Transfer could not be completed." },
      { status: 500 },
    );
  }
}
