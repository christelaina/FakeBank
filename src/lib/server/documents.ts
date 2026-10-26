// src/lib/server/documents.ts
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import { putPrivateObject } from "@/lib/server/storage";
import type { DocumentMeta } from "@/types/banking";

type DocumentRow = {
  id: string;
  name: string;
  category: string;
  mime_type: string | null;
  size_bytes: string | number;
  uploaded_at: string | Date;
};

function mapDocumentRow(row: DocumentRow): DocumentMeta {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    mimeType: row.mime_type ?? "application/octet-stream",
    sizeBytes: Number(row.size_bytes),
    uploadedAt: new Date(row.uploaded_at).toISOString(),
  } as DocumentMeta;
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  const userId = await requireUserId();
  const rows = (await sql`
    SELECT id, name, category, mime_type, size_bytes, uploaded_at
    FROM documents
    WHERE user_id = ${userId}
    ORDER BY uploaded_at DESC
  `) as DocumentRow[];

  return rows.map(mapDocumentRow);
}

export async function saveDocument(input: {
  name: string;
  category: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<DocumentMeta> {
  const userId = await requireUserId();
  const pathname = `documents/${userId}/${randomUUID()}`;
  await putPrivateObject(pathname, input.bytes, input.mimeType);
  const rows = (await sql`
    INSERT INTO documents (user_id, name, category, mime_type, size_bytes, blob_pathname)
    VALUES (${userId}, ${input.name}, ${input.category}, ${input.mimeType}, ${input.bytes.length}, ${pathname})
    RETURNING id, name, category, mime_type, size_bytes, uploaded_at
  `) as DocumentRow[];
  return mapDocumentRow(rows[0]);
}
