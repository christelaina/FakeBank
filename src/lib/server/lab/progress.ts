// Server-only. Points are derived from lab_solves so they cannot drift from the recorded solves.
import { sql } from "@/lib/db";
import { CHALLENGE_DESCRIPTIONS } from "@/lib/server/lab/walkthroughs";
import type { LabLeaderboardRow, LabProgress } from "@/types/lab";

type ProgressRow = {
  id: string;
  title: string;
  points: number;
  solved_at: string | Date | null;
};

type LeaderboardDbRow = {
  display_name: string;
  points: string | number;
  solved_count: string | number;
};

export async function getStudentProgress(studentId: string): Promise<LabProgress> {
  const rows = (await sql`
    SELECT c.id, c.title, c.points, s.solved_at
    FROM lab_challenges c
    LEFT JOIN lab_solves s ON s.challenge_id = c.id AND s.student_id = ${studentId}
    ORDER BY c.points, c.id
  `) as ProgressRow[];

  const challenges = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: CHALLENGE_DESCRIPTIONS[row.id] ?? "",
    points: row.points,
    solved: row.solved_at !== null,
    solvedAt: row.solved_at === null ? null : new Date(row.solved_at).toISOString(),
  }));
  const solved = challenges.filter((challenge) => challenge.solved);

  const hintRows = (await sql`
    SELECT COALESCE(SUM(cost), 0) AS total
    FROM lab_hint_purchases
    WHERE student_id = ${studentId}
  `) as { total: string | number }[];
  const hintCost = Number(hintRows[0].total);

  return {
    totalPoints: solved.reduce((sum, challenge) => sum + challenge.points, 0) - hintCost,
    hintCost,
    solvedCount: solved.length,
    challenges,
  };
}

// Excludes hidden victim users. Returns display names only, not emails.
// Points are solved challenge points minus hint costs, so they can be negative.
export async function getLeaderboard(): Promise<LabLeaderboardRow[]> {
  const rows = (await sql`
    SELECT u.display_name,
           COALESCE((
             SELECT SUM(c.points) FROM lab_solves s
             JOIN lab_challenges c ON c.id = s.challenge_id
             WHERE s.student_id = u.id
           ), 0) - COALESCE((
             SELECT SUM(h.cost) FROM lab_hint_purchases h
             WHERE h.student_id = u.id
           ), 0) AS points,
           (SELECT COUNT(*) FROM lab_solves s WHERE s.student_id = u.id) AS solved_count
    FROM users u
    WHERE u.role = 'student'
      AND u.id NOT IN (SELECT victim_user_id FROM lab_victims)
    ORDER BY points DESC, solved_count DESC, u.display_name ASC
  `) as LeaderboardDbRow[];

  return rows.map((row, index) => ({
    rank: index + 1,
    displayName: row.display_name,
    points: Number(row.points),
    solvedCount: Number(row.solved_count),
  }));
}
