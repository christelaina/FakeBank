// src/lib/server/security.ts
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/server/auth/session";
import type { SecurityActivity } from "@/types/banking";

type SignInRow = {
  id: string;
  created_at: string | Date;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  severity: string;
  read_flag: boolean;
  created_at: string | Date;
};

export async function getSecurityActivity(): Promise<SecurityActivity> {
  const userId = await requireUserId();
  const [signIns, notifications] = (await Promise.all([
    sql`
      SELECT id, created_at
      FROM security_events
      WHERE user_id = ${userId} AND event_type = 'sign_in' AND success = true
      ORDER BY created_at DESC
      LIMIT 20
    `,
    sql`
      SELECT id, title, body, severity, read_flag, created_at
      FROM security_notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ])) as [SignInRow[], NotificationRow[]];

  return {
    signIns: signIns.map((row) => ({
      id: row.id,
      occurredAt: new Date(row.created_at).toISOString(),
    })),
    notifications: notifications.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      severity: row.severity,
      read: row.read_flag,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  } as SecurityActivity;
}
