// src/lib/server/profile.ts
import { pool, sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import type {
  ProfileChangeEntry,
  ProfileUpdateInput,
  UserProfile,
} from "@/types/banking";

type UserRow = {
  id: string;
  display_name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  preferred_language: string | null;
  marketing_emails: boolean | null;
  two_factor_enabled: boolean;
  picture_updated_at?: string | Date | null;
};

type ChangeRow = {
  id: string;
  field_name: string;
  summary: string;
  changed_at: string | Date;
};

const FIELD_LABELS: Record<keyof ProfileUpdateInput, string> = {
  displayName: "Updated display name",
  phone: "Updated mobile number",
  preferredLanguage: "Updated preferred language",
  marketingEmails: "Updated marketing email preference",
};

function mapUserRow(row: UserRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    phone: row.phone ?? "",
    addressLine1: row.address_line1 ?? "",
    city: row.city ?? "",
    province: row.province ?? "",
    postalCode: row.postal_code ?? "",
    preferredLanguage: (row.preferred_language ?? "en-CA") as UserProfile["preferredLanguage"],
    marketingEmails: row.marketing_emails ?? false,
    twoFactorEnabled: row.two_factor_enabled,
    profilePictureUpdatedAt: row.picture_updated_at
      ? new Date(row.picture_updated_at).toISOString()
      : null,
  } as UserProfile;
}

function mapChangeRow(row: ChangeRow): ProfileChangeEntry {
  return {
    id: row.id,
    field: row.field_name,
    summary: row.summary,
    changedAt: new Date(row.changed_at).toISOString(),
  } as ProfileChangeEntry;
}

// Returns the fields the caller asked to change and that actually differ from the current row.
export function findChangedFields(
  current: UserProfile,
  input: ProfileUpdateInput,
): (keyof ProfileUpdateInput)[] {
  const changed: (keyof ProfileUpdateInput)[] = [];
  if (input.displayName !== undefined && input.displayName !== current.displayName) {
    changed.push("displayName");
  }
  if (input.phone !== undefined && input.phone !== current.phone) changed.push("phone");
  if (input.preferredLanguage !== undefined && input.preferredLanguage !== current.preferredLanguage) {
    changed.push("preferredLanguage");
  }
  if (input.marketingEmails !== undefined && input.marketingEmails !== current.marketingEmails) {
    changed.push("marketingEmails");
  }
  return changed;
}

export async function getProfile(): Promise<UserProfile> {
  const userId = await requireUserId();
  const rows = (await sql`
    SELECT id, display_name, email, phone, address_line1, city, province, postal_code,
           preferred_language, marketing_emails, two_factor_enabled,
           (SELECT updated_at FROM profile_pictures p WHERE p.user_id = users.id) AS picture_updated_at
    FROM users
    WHERE id = ${userId}
  `) as UserRow[];
  if (!rows[0]) throw new Error("User not found");
  return mapUserRow(rows[0]);
}

// Locks the row, applies the update, and logs changed fields in one transaction.
export async function updateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  const userId = await requireUserId();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const currentRows = (
      await client.query(
        `SELECT id, display_name, email, phone, address_line1, city, province, postal_code,
                preferred_language, marketing_emails, two_factor_enabled
         FROM users
         WHERE id = $1
         FOR UPDATE`,
        [userId],
      )
    ).rows as UserRow[];
    if (!currentRows[0]) throw new Error("User not found");

    const changed = findChangedFields(mapUserRow(currentRows[0]), input);

    const rows = (
      await client.query(
        `UPDATE users
         SET display_name = COALESCE($2, display_name),
             phone = COALESCE($3, phone),
             preferred_language = COALESCE($4, preferred_language),
             marketing_emails = COALESCE($5, marketing_emails),
             updated_at = now()
         WHERE id = $1
         RETURNING id, display_name, email, phone, address_line1, city, province, postal_code,
                   preferred_language, marketing_emails, two_factor_enabled`,
        [
          userId,
          input.displayName ?? null,
          input.phone ?? null,
          input.preferredLanguage ?? null,
          input.marketingEmails ?? null,
        ],
      )
    ).rows as UserRow[];

    for (const field of changed) {
      await client.query(
        `INSERT INTO profile_changes (user_id, field_name, summary)
         VALUES ($1, $2, $3)`,
        [userId, field, FIELD_LABELS[field]],
      );
    }

    await client.query("COMMIT");
    return mapUserRow(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getChangeHistory(): Promise<ProfileChangeEntry[]> {
  const userId = await requireUserId();
  const rows = (await sql`
    SELECT id, field_name, summary, changed_at
    FROM profile_changes
    WHERE user_id = ${userId}
    ORDER BY changed_at DESC
    LIMIT 50
  `) as ChangeRow[];
  return rows.map(mapChangeRow);
}
