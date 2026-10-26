// Server-only. Read-only: returns victim accounts without password hashes or session data.
import { sql } from "@/lib/db";

export type LabVictimAccount = {
  victimUserId: string;
  studentId: string;
  studentEmail: string;
  studentDisplayName: string;
  accountId: string | null;
  accountName: string | null;
  nickname: string | null;
  maskedNumber: string | null;
  balance: number | null;
  availableBalance: number | null;
};

type VictimRow = {
  victim_user_id: string;
  student_id: string;
  student_email: string;
  student_display_name: string;
  account_id: string | null;
  account_name: string | null;
  nickname: string | null;
  masked_number: string | null;
  balance: string | null;
  available_balance: string | null;
};

export async function listLabVictimAccounts(): Promise<LabVictimAccount[]> {
  const rows = (await sql`
    SELECT v.victim_user_id,
           v.student_id,
           s.email AS student_email,
           s.display_name AS student_display_name,
           a.id AS account_id,
           a.name AS account_name,
           a.nickname,
           a.masked_number,
           a.balance,
           a.available_balance
    FROM lab_victims v
    JOIN users s ON s.id = v.student_id
    LEFT JOIN accounts a ON a.user_id = v.victim_user_id
    ORDER BY s.created_at, a.created_at
  `) as VictimRow[];

  return rows.map((row) => ({
    victimUserId: row.victim_user_id,
    studentId: row.student_id,
    studentEmail: row.student_email,
    studentDisplayName: row.student_display_name,
    accountId: row.account_id,
    accountName: row.account_name,
    nickname: row.nickname,
    maskedNumber: row.masked_number,
    balance: row.balance === null ? null : Number(row.balance),
    availableBalance: row.available_balance === null ? null : Number(row.available_balance),
  }));
}
