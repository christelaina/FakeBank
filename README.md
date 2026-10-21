# FakeBank

FakeBank is a fictional online banking frontend for an authorized student cybersecurity competition. Participants investigate the interface and a separately controlled backend, recover server-generated flags, and present those flags to organizers in person.

This repository contains the **frontend only**. It is intentionally free of competition scoring, leaderboards, flag submission forms, and challenge dashboards.

## Technology stack

- Next.js (App Router)
- React + TypeScript (strict)
- Tailwind CSS
- Accessible UI primitives (shadcn-style)
- Lucide icons
- Zod validation
- Vitest + React Testing Library
- Playwright smoke tests

## Requirements

- Node.js **18.18+** (Node 20 or 22 LTS recommended; this project was verified on Node 24)

## Installation and development

```bash
npm install
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
```

## Environment configuration

Copy `.env.example` to `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DATA_MODE=mock
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_DATA_MODE` | `mock` (default) or `live` |
| `NEXT_PUBLIC_API_BASE_URL` | Isolated FakeBank API origin used only in live mode |

Never put signing keys, administrator credentials, private tokens, or challenge flags in frontend environment variables.

## Mock mode and live API mode

- **Mock mode** (`NEXT_PUBLIC_DATA_MODE=mock`) uses in-memory repositories under `src/lib/api/mock` and seed data under `src/lib/mock-data`.
- **Live mode** (`NEXT_PUBLIC_DATA_MODE=live`) issues real HTTP requests through `src/lib/api/client.ts` to `NEXT_PUBLIC_API_BASE_URL`.
- Live mode does **not** silently fall back to mock success when the API fails.
- If live mode is selected without an API URL, the application surfaces a clear configuration error.

Repository selection is centralized in `src/lib/api/index.ts`. UI components call typed API helpers and never hardcode provider-specific responses.

## Application structure

```text
src/
  app/                 # App Router pages
  components/          # Shell, UI primitives, feedback
  features/            # Feature-specific components
  lib/api/             # HTTP client + mock/live repositories
  lib/config/          # Environment validation
  lib/mock-data/       # Synthetic CAD banking data
  lib/validation/      # Zod / upload validation
  types/               # Shared TypeScript models
  tests/               # Unit, component, and e2e tests
```

Primary navigation:

1. Overview
2. Accounts
3. Transfers
4. Transactions
5. Investments
6. Profile and Settings
7. Documents
8. Security Center

There is no Competition Challenges navigation item.

## How to add a new page or feature

1. Add a route under `src/app/<feature>/page.tsx`.
2. Place feature UI in `src/features/<feature>/components`.
3. Add types in `src/types/banking.ts` when needed.
4. Add a navigation item in `src/components/layout/Navigation.tsx` only if it belongs in the primary banking shell.
5. Keep presentation separate from repository / API logic.

## How to add a new API endpoint

1. Extend the relevant repository interface in `src/lib/api/repositories.ts`.
2. Implement the method in both:
   - `src/lib/api/mock/index.ts`
   - `src/lib/api/http/index.ts`
3. Export a typed helper from `src/lib/api/<domain>.ts`.
4. Call the helper from a feature hook/component or server component.
5. Validate responses with Zod when the contract stabilizes.

## Connecting the future isolated FakeBank backend

1. Deploy or run the isolated API (for example at `http://localhost:8000`).
2. Configure CORS on the API to allow the frontend origin (for example `http://localhost:3000` and the Vercel deployment URL). CORS is a browser access-control mechanism, not an authorization control.
3. Set:

```dotenv
NEXT_PUBLIC_DATA_MODE=live
NEXT_PUBLIC_API_BASE_URL=https://your-fakebank-api.example
```

4. Expected relative endpoints currently used by the HTTP repository:

- `GET /api/dashboard`
- `GET /api/accounts`
- `GET /api/accounts/:accountId`
- `GET /api/transactions`
- `POST /api/transfers`
- `GET /api/investments/portfolio`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/profile/history`
- `GET /api/documents`
- `POST /api/profile/picture`
- `GET /api/security/activity`

Responses may be either the raw JSON payload or `{ "data": ... }`. Include `X-Request-Id` where useful. Authorization, balance authority, and exploit verification belong exclusively on the backend.

## Backend-ready security challenge surfaces

The frontend prepares integration points for five challenge categories without implementing the vulnerabilities itself:

1. **XSS** — user-controlled fields (display name, transaction description, nicknames) render through React text nodes / `SafeText`. No `dangerouslySetInnerHTML` for untrusted content.
2. **File upload** — Documents page supports local image selection/preview and a typed `uploadProfilePicture` API method. SVG/HTML are rejected client-side for usability; the backend must perform authoritative validation.
3. **Cryptography / token discovery** — API traffic and public config remain inspectable in DevTools. No private keys or challenge answers are shipped in the bundle.
4. **API manipulation** — centralized typed HTTP methods with ordinary JSON request/response bodies.
5. **Race conditions** — transfer workflow returns transfer IDs and statuses (`pending`, `completed`, `failed`, `uncertain`). Balances are not treated as client-authoritative. No unbounded request loop is included.

Mock operations set `verifiedByBackend: false` so UI success cannot be presented as proof of a real exploit.

## Testing

```bash
npm test          # Vitest unit/component tests
npm run test:e2e  # Playwright smoke tests (starts the Next.js app)
```

Covered areas include shell navigation, repository loading, API failure handling, transfer validation, transaction rendering, upload rejection/safe preview, mock vs live mode switching, safe text rendering, and mock transfer non-verification.

## Deploying to Vercel

1. Push the repository to your Git provider.
2. Import the project in Vercel.
3. Set environment variables:
   - `NEXT_PUBLIC_DATA_MODE=live` (when the API is ready)
   - `NEXT_PUBLIC_API_BASE_URL=<isolated API origin>`
4. Deploy. The frontend is a standard Next.js App Router app and does not embed a banking backend.

For local static-like checks, `npm run build && npm run start` is sufficient.

## Security limitations and authorized testing boundaries

- FakeBank is fictional. All customers, balances, and documents are synthetic.
- This frontend does not implement real authentication, password storage, or payment rails.
- Do not treat client-side simulations as verified security exploits.
- Security testing must remain within the explicitly authorized FakeBank environment.
- Do not attack unrelated systems, compromise the host machine, or execute uploaded files.
- Challenge objectives and point values are distributed by organizers outside this application.
- Flags and administrative credentials must never be placed in frontend source or public env vars.

## Recommended next steps

1. Stand up the isolated FakeBank API with disposable challenge state.
2. Implement controlled challenge endpoints and server-side flag issuance.
3. Align CORS and auth headers with the competition environment.
4. Add contract tests against the live OpenAPI/schema once available.
5. Optionally harden production headers (CSP) for the non-challenge deployment profile while keeping a separate training profile for intentional labs.
