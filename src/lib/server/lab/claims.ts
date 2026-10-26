// Server-only. Awards a challenge only after a detection exists and the flag matches.
import { pool } from "@/lib/db";
import { generateFlag } from "@/lib/lab/flags";

export type LabClaimErrorCode = "CHALLENGE_NOT_FOUND" | "NOT_DETECTED" | "WRONG_FLAG";

export class LabClaimError extends Error {
  constructor(
    readonly code: LabClaimErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export type LabClaimResult = {
  challengeId: string;
  points: number;
  alreadySolved: boolean;
};

export async function claimLabFlag(
  studentId: string,
  challengeId: string,
  submittedFlag: string,
): Promise<LabClaimResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const challengeRows = (
      await client.query("SELECT points FROM lab_challenges WHERE id = $1", [challengeId])
    ).rows as { points: number }[];
    if (challengeRows.length === 0) {
      throw new LabClaimError("CHALLENGE_NOT_FOUND", "Challenge not found.");
    }
    const points = challengeRows[0].points;

    const detectionRows = (
      await client.query(
        "SELECT 1 FROM lab_detections WHERE student_id = $1 AND challenge_id = $2",
        [studentId, challengeId],
      )
    ).rows;
    if (detectionRows.length === 0) {
      throw new LabClaimError("NOT_DETECTED", "Trigger this challenge before submitting a flag.");
    }

    if (submittedFlag.trim() !== generateFlag(studentId, challengeId)) {
      throw new LabClaimError("WRONG_FLAG", "That flag is not correct.");
    }

    const solveRows = (
      await client.query(
        `INSERT INTO lab_solves (student_id, challenge_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, challenge_id) DO NOTHING
         RETURNING challenge_id`,
        [studentId, challengeId],
      )
    ).rows;

    if (solveRows.length === 0) {
      await client.query("COMMIT");
      return { challengeId, points, alreadySolved: true };
    }

    await client.query(
      `INSERT INTO lab_points (student_id, points)
       VALUES ($1, $2)
       ON CONFLICT (student_id)
       DO UPDATE SET points = lab_points.points + EXCLUDED.points, updated_at = now()`,
      [studentId, points],
    );

    await client.query("COMMIT");
    return { challengeId, points, alreadySolved: false };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
