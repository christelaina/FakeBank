// Server-only. Walkthrough steps are returned only after a student buys them. A hint costs half the challenge points and is subtracted from the score.
import { sql } from "@/lib/db";
import { FREE_POINTERS, WALKTHROUGHS } from "@/lib/server/lab/walkthroughs";

export type LabHintView = {
  id: string;
  title: string;
  cost: number;
  purchased: boolean;
  steps: string[] | null;
  pointer: string | null;
};

export class LabHintError extends Error {
  constructor(
    readonly code: "HINT_NOT_FOUND",
    message: string,
  ) {
    super(message);
  }
}

type HintRow = {
  id: string;
  title: string;
  points: number;
  cost: number | null;
};

export async function listHints(studentId: string): Promise<LabHintView[]> {
  const rows = (await sql`
    SELECT c.id, c.title, c.points, h.cost
    FROM lab_challenges c
    LEFT JOIN lab_hint_purchases h ON h.challenge_id = c.id AND h.student_id = ${studentId}
    ORDER BY c.points, c.id
  `) as HintRow[];

  return rows.map((row) => {
    const purchased = row.cost !== null;
    return {
      id: row.id,
      title: row.title,
      cost: row.cost ?? Math.max(Math.floor(row.points / 2), 1),
      purchased,
      steps: purchased ? (WALKTHROUGHS[row.id] ?? []) : null,
      pointer: FREE_POINTERS[row.id] ?? null,
    };
  });
}

export async function purchaseHint(
  studentId: string,
  challengeId: string,
): Promise<{ challengeId: string; cost: number; alreadyPurchased: boolean; steps: string[] }> {
  const challenge = (await sql`SELECT id FROM lab_challenges WHERE id = ${challengeId}`) as {
    id: string;
  }[];
  if (challenge.length === 0) {
    throw new LabHintError("HINT_NOT_FOUND", "Walkthrough not found.");
  }

  const inserted = (await sql`
    INSERT INTO lab_hint_purchases (student_id, challenge_id, cost)
    SELECT ${studentId}, c.id, GREATEST(c.points / 2, 1)
    FROM lab_challenges c
    WHERE c.id = ${challengeId}
    ON CONFLICT (student_id, challenge_id) DO NOTHING
    RETURNING cost
  `) as { cost: number }[];

  const cost =
    inserted[0]?.cost ??
    (
      (await sql`
        SELECT cost FROM lab_hint_purchases
        WHERE student_id = ${studentId} AND challenge_id = ${challengeId}
      `) as { cost: number }[]
    )[0].cost;

  return {
    challengeId,
    cost,
    alreadyPurchased: inserted.length === 0,
    steps: WALKTHROUGHS[challengeId] ?? [],
  };
}
