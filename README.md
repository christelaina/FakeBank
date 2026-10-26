# FakeBank

FakeBank is a fictional online banking application for an authorized student cybersecurity lab. It includes a banking UI backed by Neon Postgres, and an optional lab mode with intentionally vulnerable challenges, a student progress page, an admin leaderboard, and paid walkthroughs (hints) that reduce a student's score.

> **Warning:** Lab mode contains intentional security weaknesses. Run it only on infrastructure you control, with synthetic data and no real customer information.

## Features

- Banking pages: overview, accounts, transfers, transactions, investments, profile, documents, and security center.
- Session sign-in with an httpOnly cookie.
- Lab mode (`LAB_MODE=on`): challenge catalog, student progress, admin leaderboard, and hints.

## Technology stack

- Next.js 14 (App Router) and React 18, TypeScript (strict)
- Tailwind CSS and Lucide icons
- Neon Postgres via `@neondatabase/serverless`
- Vercel Blob for profile pictures and document uploads
- Zod validation
- Vitest with Testing Library, and Playwright end-to-end tests

## Requirements

- Node.js **18.18+** (Node 20 or 22 LTS recommended)
- A Neon Postgres database
- Optional: a Vercel Blob store for uploads

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with the variables listed below.
3. Apply the database schema by running every file in `database/schema/` in order, from `0001` to `0014`. Load files in `database/seeds/` as needed.
4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run test:all
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Banking database connection string, used when lab mode is off |
| `LAB_MODE` | Set to `on` to enable lab routes. Any other value disables them |
| `LAB_DATABASE_URL` | Lab database connection string, required when `LAB_MODE=on`. Use a separate database from the banking one |
| `AUTH_LAB_KEY_HEX`, `AUTH_LAB_IV_HEX` | Server-only key material for the lab password scheme |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for uploads |
| `NEXT_PUBLIC_DATA_MODE` | `mock` (default) or `live` |
| `NEXT_PUBLIC_API_BASE_URL` | External API origin, used only in live mode |

Never place keys, tokens, passwords, or flags in `NEXT_PUBLIC_*` variables. Keep `.env.local` out of git; it is already ignored.

## Application structure

```text
src/
  app/                 # App Router pages and API routes (app/api, app/lab, app/admin)
  components/          # Layout shell, UI primitives, feedback states
  features/            # Feature components (accounts, transfers, lab, admin, ...)
  lib/api/             # Client-side API helpers and mock repositories
  lib/server/          # Server-side services (auth, lab, banking)
  lib/config/          # Environment handling
  lib/validation/      # Zod schemas
  types/               # Shared TypeScript models
  tests/               # Unit, component, and end-to-end tests
database/
  schema/              # Ordered SQL migrations (0001 to 0014)
  seeds/               # Demo and reference data
scripts/               # Lab seeding helpers
```

Primary navigation: Overview, Accounts, Transfers, Transactions, Investments, Profile and Settings, Documents, and Security Center. With `LAB_MODE=on`, signed-in students also see **Progress**, admins see **Leaderboard**, and a hint button appears in the header.

## Adding a page or feature

1. Add a route under `src/app/<feature>/page.tsx`.
2. Place feature UI in `src/features/<feature>/components`.
3. Put server logic in `src/lib/server/<feature>` and keep it separate from presentation.
4. Add a navigation item in `src/components/layout/Navigation.tsx` only if it belongs in the main shell.
5. Validate request bodies with Zod.

## Database changes

1. Add a new file to `database/schema/` with the next number, for example `0015.description.sql`.
2. Write it to be idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`) so it can be re-run safely.
3. Apply it to each environment before deploying code that depends on it.

## Authentication

Protected pages redirect to `/sign-in` without a session, and protected API routes return `401 AUTH_REQUIRED`.

- `POST /api/auth/sign-in` takes `{ "email", "password" }` and sets the `fakebank_session` cookie (httpOnly, 8 hours).
- `POST /api/auth/sign-out` revokes the session.
- Session tokens are random. Only their SHA-256 hash is stored in `auth_sessions`.

The password scheme is a deliberate teaching weakness. It is not suitable for production. Real systems must use a slow, salted password hash such as Argon2id or bcrypt. Lab key material is read on the server only and must never use a `NEXT_PUBLIC_` prefix.

## Lab mode

- `LAB_MODE=on` enables lab routes. When it is off, lab routes return 404.
- Challenges, point values, and solves are stored in `lab_challenges` and `lab_solves`.
- `GET /api/lab/progress` returns the signed-in student's own solves, hint cost, and total points.
- `GET /api/admin/leaderboard` (admins only) is read-only and excludes hidden victim accounts.
- Hints: `POST /api/lab/hints` buys a walkthrough for one challenge. Each costs half the challenge points and is charged once. Scores can go negative.
- Flag submission is not built yet.

Seed helpers in `scripts/` (`seed-lab-challenges.mjs`, `seed-lab-admin.mjs`, `seed-lab-demo.mjs`) should be read before running, and only against the lab database.

## Testing

```bash
npm test          # Vitest unit and component tests
npm run test:e2e  # Playwright tests (starts the app)
npm run typecheck
```

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Set Production environment variables: `DATABASE_URL`, `LAB_DATABASE_URL`, `LAB_MODE`, the `AUTH_LAB_*` keys, and `BLOB_READ_WRITE_TOKEN`.
3. Apply every schema file to the database that Vercel uses.
4. Deploy, then test sign-in and one lab challenge on the live URL.

Live deployment: https://fake-bank-mfzi1w8c5-ruthogadina22-4409s-projects.vercel.app/

Enable `LAB_MODE=on` only on deployments meant for students. Redeploy after changing environment variables, because existing deployments keep their old values.

## Security and authorized use

- All customers, balances, and documents are synthetic.
- Lab weaknesses are intentional. Do not deploy the lab alongside real data.
- Students may test only the FakeBank environment they have been authorized to use. Do not attack unrelated systems or the host machine.
- Flags and admin credentials must never appear in frontend code or public environment variables.
- Challenge objectives are given out by instructors. Students see only their own progress; admins can view but not edit points.
