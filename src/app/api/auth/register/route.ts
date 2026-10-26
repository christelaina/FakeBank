// src/app/api/auth/register/route.ts
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CHEQUING_NICKNAME,
  CREDIT_NICKNAMES,
  NEW_CREDIT_LIMIT,
  SAVINGS_NICKNAMES,
  SECONDARY_CHEQUING_NAME,
  SECONDARY_CHEQUING_NICKNAME,
  STARTER_ACCOUNT_DOMAIN,
} from "@/lib/config/starter-accounts";
import { pool } from "@/lib/db";
import { isLabEnabled } from "@/lib/lab/config";
import { createLabVictim } from "@/lib/lab/victims";
import { encryptPassword } from "@/lib/server/auth/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSession,
} from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  displayName: z.string().trim().min(1).max(255),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(255)
    .refine((value) => value.endsWith(STARTER_ACCOUNT_DOMAIN), {
      message: `Use a fake email ending in ${STARTER_ACCOUNT_DOMAIN}.`,
    }),
  password: z.string().min(8).max(255),
  savingsNickname: z.enum(SAVINGS_NICKNAMES).nullish(),
  creditNickname: z.enum(CREDIT_NICKNAMES).nullish(),
});

type StarterAccount = {
  name: string;
  nickname: string;
  type: "chequing" | "savings" | "credit";
  availableBalance: number;
};

// Every user gets two chequing accounts. Savings and credit are optional.
function starterAccounts(savingsNickname: string | null, creditNickname: string | null): StarterAccount[] {
  const accounts: StarterAccount[] = [
    { name: "Everyday Chequing", nickname: CHEQUING_NICKNAME, type: "chequing", availableBalance: 0 },
    { name: SECONDARY_CHEQUING_NAME, nickname: SECONDARY_CHEQUING_NICKNAME, type: "chequing", availableBalance: 0 },
  ];
  if (savingsNickname) {
    accounts.push({ name: "High Yield Savings", nickname: savingsNickname, type: "savings", availableBalance: 0 });
  }
  if (creditNickname) {
    accounts.push({ name: "Visa Cashback", nickname: creditNickname, type: "credit", availableBalance: NEW_CREDIT_LIMIT });
  }
  return accounts;
}

function randomMaskedNumber(): string {
  return String(randomInt(1_000_000, 10_000_000));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "INVALID_INPUT",
        message: `Enter a display name, an email ending in ${STARTER_ACCOUNT_DOMAIN}, and a password of at least 8 characters.`,
      },
      { status: 400 },
    );
  }

  const { displayName, email, password, savingsNickname, creditNickname } = parsed.data;

  const client = await pool.connect();
  let user: { id: string; display_name: string } | undefined;
  try {
    await client.query("BEGIN");
    // ON CONFLICT keeps the email uniqueness check atomic with the account inserts.
    const userRows = (
      await client.query(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, display_name`,
        [email, encryptPassword(password), displayName],
      )
    ).rows as { id: string; display_name: string }[];

    user = userRows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { code: "EMAIL_TAKEN", message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    let chequingId: string | undefined;
    for (const account of starterAccounts(savingsNickname ?? null, creditNickname ?? null)) {
      const accountRows = (
        await client.query(
          `INSERT INTO accounts (user_id, name, nickname, type, masked_number, balance, available_balance)
           VALUES ($1, $2, $3, $4, $5, 0, $6)
           RETURNING id`,
          [user.id, account.name, account.nickname, account.type, randomMaskedNumber(), account.availableBalance],
        )
      ).rows as { id: string }[];
      if (account.type === "chequing") chequingId = accountRows[0].id;
    }

    if (isLabEnabled() && chequingId) {
      await createLabVictim(client, user.id, chequingId);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { code: "REGISTER_FAILED", message: "Account could not be created." },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  try {
    const token = await createSession(user.id);
    const response = NextResponse.json(
      { data: { userId: user.id, displayName: user.display_name } },
      { status: 201 },
    );
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { code: "REGISTER_FAILED", message: "Account could not be created." },
      { status: 500 },
    );
  }
}
