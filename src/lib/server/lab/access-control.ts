// Server-only. Lab-only and intentionally vulnerable: lists victim accounts with their activity, with no admin check.
import { sql } from "@/lib/db";

export type VictimActivity = {
  accountId: string;
  accountName: string;
  maskedNumber: string;
  balance: number;
  transactions: { date: string; description: string; amount: number; status: string }[];
};

type VictimRow = {
  account_id: string;
  account_name: string;
  masked_number: string;
  balance: string;
  date: Date | string | null;
  description: string | null;
  amount: string | null;
  status: string | null;
};

export async function listVictimActivity(): Promise<VictimActivity[]> {
  const rows = (await sql`
    SELECT a.id AS account_id, a.name AS account_name, a.masked_number, a.balance,
           t.date, t.description, t.amount, t.status
    FROM lab_victims v
    JOIN accounts a ON a.user_id = v.victim_user_id
    LEFT JOIN transactions t ON t.account_id = a.id
    ORDER BY a.id, t.date DESC
  `) as VictimRow[];

  const byAccount = new Map<string, VictimActivity>();
  for (const row of rows) {
    let account = byAccount.get(row.account_id);
    if (!account) {
      account = {
        accountId: row.account_id,
        accountName: row.account_name,
        maskedNumber: row.masked_number,
        balance: Number(row.balance),
        transactions: [],
      };
      byAccount.set(row.account_id, account);
    }
    if (row.description !== null && row.date !== null) {
      account.transactions.push({
        date: new Date(row.date).toISOString(),
        description: row.description,
        amount: Number(row.amount),
        status: row.status ?? "",
      });
    }
  }
  return [...byAccount.values()];
}
