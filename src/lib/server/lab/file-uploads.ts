// Server-only. Lab file storage. Reached only when isLabEnabled().
import { sql } from "@/lib/db";
import type { LabFilePurpose } from "@/lib/lab/file-challenge";

export type LabFileRow = {
  id: string;
  file_name: string;
  mime_type: string;
  purpose: LabFilePurpose;
  created_at: string;
};

export async function insertLabFile(
  studentId: string,
  fileName: string,
  mimeType: string,
  purpose: LabFilePurpose,
  content: string,
): Promise<string> {
  const rows = (await sql`
    INSERT INTO lab_file_uploads (student_id, file_name, mime_type, purpose, content)
    VALUES (${studentId}, ${fileName}, ${mimeType}, ${purpose}, ${content})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function listLabFiles(studentId: string): Promise<LabFileRow[]> {
  return (await sql`
    SELECT id, file_name, mime_type, purpose, created_at
    FROM lab_file_uploads
    WHERE student_id = ${studentId}
    ORDER BY created_at DESC
    LIMIT 50
  `) as LabFileRow[];
}

export async function getStudentDisplayName(studentId: string): Promise<string | null> {
  const rows = (await sql`
    SELECT display_name FROM users WHERE id = ${studentId}
  `) as { display_name: string }[];
  return rows[0]?.display_name ?? null;
}

// Owner-only lookup. Returns null for other students' files.
export async function getOwnedLabFile(
  studentId: string,
  fileId: string,
): Promise<{ fileName: string; mimeType: string; content: string } | null> {
  const rows = (await sql`
    SELECT file_name AS "fileName", mime_type AS "mimeType", content
    FROM lab_file_uploads
    WHERE id = ${fileId} AND student_id = ${studentId}
  `) as { fileName: string; mimeType: string; content: string }[];
  return rows[0] ?? null;
}
