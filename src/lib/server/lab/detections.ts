// Server-only. Records a lab detection when a response discloses a victim canary.
import { sql } from "@/lib/db";

export async function recordDetectionIfCanaryExposed(
  studentId: string,
  challengeId: string,
  accountId: string,
  responseBody: unknown,
): Promise<boolean> {
  const rows = (await sql`
    SELECT v.canary
    FROM lab_victims v
    JOIN accounts a ON a.user_id = v.victim_user_id
    WHERE a.id = ${accountId} AND v.canary IS NOT NULL
  `) as { canary: string }[];

  const canary = rows[0]?.canary;
  if (!canary || !JSON.stringify(responseBody).includes(canary)) return false;

  await sql`
    INSERT INTO lab_detections (student_id, challenge_id)
    VALUES (${studentId}, ${challengeId})
    ON CONFLICT (student_id, challenge_id) DO NOTHING
  `;
  return true;
}

export async function recordLabDetection(studentId: string, challengeId: string): Promise<void> {
  await sql`
    INSERT INTO lab_detections (student_id, challenge_id)
    VALUES (${studentId}, ${challengeId})
    ON CONFLICT (student_id, challenge_id) DO NOTHING
  `;
}

export async function hasLabDetection(studentId: string, challengeId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM lab_detections
    WHERE student_id = ${studentId} AND challenge_id = ${challengeId}
  `) as unknown[];
  return rows.length > 0;
}
