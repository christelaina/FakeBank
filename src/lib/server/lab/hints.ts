// Server-only. Walkthrough steps are returned only after a student buys them. A hint costs half the challenge points and is subtracted from the score.
import { sql } from "@/lib/db";

const WALKTHROUGHS: Record<string, string[]> = {
  api: [
    "Open one of your own accounts and note the account ID in the request to /api/accounts/{id}.",
    "Request the same endpoint with a different account ID. The app returns the record without checking that you own it.",
    "Look for the lab note in the returned data. It contains the canary that proves the exposure.",
  ],
  xss: [
    "Open Profile and set your display name to HTML that runs script when rendered, such as an image tag with an error handler.",
    "Reload a page. The header renders the name as HTML, so the script runs in your browser.",
  ],
  race: [
    "Pick an account with a balance you can spend and note the balance.",
    "Send several transfers at the same moment so they all check the balance before any debit is applied.",
    "Check the account balance. If it went below zero, the overdraw is recorded.",
  ],
  crypto: [
    "Open the lab page for user secrets and view the page source to find the cipher key and IV.",
    "Open the decrypt page and use those values to decrypt a stored password record.",
  ],
  file: [
    "Open the lab files page and upload a file whose name looks like an image but whose contents are HTML containing a script.",
    "Open the uploaded file's URL directly in the browser. The script runs and can call the server as your signed-in session.",
  ],
  "access-control": [
    "Call the admin accounts endpoint, /api/admin/accounts, in the browser while signed in as a student.",
    "Read the victim activity it returns. The lab note in that data contains the canary.",
  ],
};

export type LabHintView = {
  id: string;
  title: string;
  cost: number;
  purchased: boolean;
  steps: string[] | null;
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
