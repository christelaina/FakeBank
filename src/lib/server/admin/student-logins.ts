// Server-only. Lab admin view: student emails with decrypted (clear text) passwords. Excludes victim users.
import { sql } from "@/lib/db";
import { decryptPassword } from "@/lib/server/auth/password";

export type StudentLogin = {
  userId: string;
  displayName: string;
  email: string;
  password: string;
};

type StudentLoginRow = {
  id: string;
  display_name: string;
  email: string;
  password_hash: string;
};

export async function listStudentLogins(): Promise<StudentLogin[]> {
  const rows = (await sql`
    SELECT u.id, u.display_name, u.email, u.password_hash
    FROM users u
    WHERE u.role = 'student'
      AND u.id NOT IN (SELECT victim_user_id FROM lab_victims)
    ORDER BY u.email
  `) as StudentLoginRow[];

  return rows.map((row) => ({
    userId: row.id,
    displayName: row.display_name,
    email: row.email,
    password: decryptPassword(row.password_hash),
  }));
}
