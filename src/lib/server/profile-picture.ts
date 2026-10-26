import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import { deletePrivateObject, putPrivateObject } from "@/lib/server/storage";

export type ProfilePictureRecord = {
  mimeType: string;
  blobPathname: string | null;
  // Legacy pictures stored before Blob; only set when blobPathname is null.
  legacyBase64: string | null;
  updatedAt: string;
};

type PictureRow = {
  mime_type: string;
  blob_pathname: string | null;
  content_base64: string | null;
  updated_at: string | Date;
};

export async function getProfilePicture(): Promise<ProfilePictureRecord | null> {
  const userId = await requireUserId();
  const rows = (await sql`
    SELECT mime_type, blob_pathname, content_base64, updated_at
    FROM profile_pictures
    WHERE user_id = ${userId}
  `) as PictureRow[];
  const row = rows[0];
  if (!row || (!row.blob_pathname && !row.content_base64)) return null;
  return {
    mimeType: row.mime_type,
    blobPathname: row.blob_pathname,
    legacyBase64: row.blob_pathname ? null : row.content_base64,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

// Replaces the current picture and returns the new update time.
export async function saveProfilePicture(input: {
  mimeType: string;
  bytes: Uint8Array;
}): Promise<string> {
  const userId = await requireUserId();
  const pathname = `profile-pictures/${userId}/${randomUUID()}`;
  await putPrivateObject(pathname, input.bytes, input.mimeType);

  const rows = (await sql`
    WITH previous AS (
      SELECT blob_pathname FROM profile_pictures WHERE user_id = ${userId}
    ),
    upserted AS (
      INSERT INTO profile_pictures (user_id, mime_type, size_bytes, blob_pathname, content_base64, updated_at)
      VALUES (${userId}, ${input.mimeType}, ${input.bytes.length}, ${pathname}, NULL, now())
      ON CONFLICT (user_id) DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        size_bytes = EXCLUDED.size_bytes,
        blob_pathname = EXCLUDED.blob_pathname,
        content_base64 = NULL,
        updated_at = now()
      RETURNING updated_at
    )
    SELECT upserted.updated_at, previous.blob_pathname AS previous_pathname
    FROM upserted LEFT JOIN previous ON true
  `) as { updated_at: string | Date; previous_pathname: string | null }[];

  const previous = rows[0].previous_pathname;
  if (previous && previous !== pathname) {
    await deletePrivateObject(previous);
  }
  return new Date(rows[0].updated_at).toISOString();
}
