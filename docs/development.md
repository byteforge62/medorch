# Local development

## Prerequisites

- Node.js 20.9 or newer
- npm
- Docker Desktop or a compatible Docker Compose runtime

## First-time setup

From the repository root:

```bash
npm install
docker compose up -d
```

Create `.env` in the repository root:

```dotenv
DATABASE_URL="postgresql://medorch:medorch_dev_password@localhost:5432/medorch?schema=public"
```

The Compose service starts PostgreSQL 17 on port `5432`, creates the `medorch` database, and stores its data in the `medorch_postgres_data` named volume. The configured user/password are local development defaults, not deployment credentials.

Generate the client, apply committed migrations, seed the local admin, then start Next.js:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The current seed script creates or updates `admin@medorch.local` with the password `MedOrch@Dev123!`. It resets the password each time it runs; keep this behavior confined to local development. See [Security and project boundaries](./security-and-limitations.md#local-development-credentials).

`NEXTAUTH_URL` must match the origin the dev server actually listens on. Sign-out resolves its callback through it, and `src/lib/email/send-verification-email.ts` builds verification and reset links from it, so running the server on any other port (for example `npm run dev -- -p 3210` while `NEXTAUTH_URL` is `http://localhost:3000`) makes sign-out request a dead origin and would send links pointing at the wrong one. If you change the port, change `NEXTAUTH_URL` to match.

Seeded `PATIENT` accounts cannot sign in by default: `src/auth.ts` requires a populated `emailVerifiedAt` for the `PATIENT` role, and `prisma/seed.ts` does not set it. For development-only patient-role testing you have two options:

- **Seed flag (no SMTP):** run the seed with `SEED_VERIFIED_PATIENTS=1`, for example `SEED_VERIFIED_PATIENTS=1 npx prisma db seed`. This marks seeded PATIENT accounts as email-verified **at seed time only**. The flag is unset by default, so normal seeding behaves exactly as before, and the authentication policy itself is never weakened. Never enable it for production seeding.
- **Real verification:** configure `SMTP_USER`, `SMTP_APP_PASSWORD`, `EMAIL_FROM`, and a correct `NEXTAUTH_URL`, then use the normal verification-email flow.

## Database tests

`npm run test:database` includes `tests/alerts-repository-audit.test.ts`, which **requires** a disposable database whose name matches `medorch_alerts_test_<lowercase-or-digits>` on a localhost host. This safety assertion is intentional — it prevents the suite from running against a development database — so the suite exits non-zero until `DATABASE_URL` points at such a database:

1. Start an isolated PostgreSQL (for example a throwaway container with a tmpfs data directory and a loopback-only port).
2. Create a database named `medorch_alerts_test_<suffix>` and apply migrations with `npx prisma migrate deploy`.
3. Run `DATABASE_URL=postgresql://<user>@localhost:<port>/medorch_alerts_test_<suffix>?schema=public npm run test:database`.

Remove the container/database afterwards. Never point the suite at your development database.

## Database workflow

Prisma configuration is in `prisma.config.ts`; the schema is in `prisma/schema.prisma`; committed SQL migrations are under `prisma/migrations/`; and the seed is `prisma/seed.ts`.

When changing the schema during local development:

```bash
npx prisma migrate dev --name describe_the_change
npx prisma generate
```

Review the generated migration before sharing it. Environments applying committed migrations should use `npx prisma migrate deploy`, not create migrations as part of deployment.

Useful local database commands:

```bash
docker compose ps
docker compose logs postgres
docker compose down
```

`docker compose down` stops and removes the container while retaining the named database volume. Removing the volume is destructive to local data; do that only when you intentionally want a fresh database.

## Application commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve a previously built application. |
| `npm run lint` | Run ESLint. |
| `npm run format` | Format the repository with Prettier. |
| `npm run format:check` | Check formatting with Prettier. |

There is no aggregate `test` or `typecheck` npm script. TypeScript is checked by `npm run build` or `npx tsc --noEmit`; neither replaces automated behavior tests.

## Automated tests

The project uses Node's test runner with `tsx`:

```powershell
node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts
npm run test:permissions
```

PostgreSQL integration tests require `DATABASE_URL` to point to a confirmed disposable database. `npm run test:database` runs the constraint, schedule-status concurrency, repository/audit, and synthetic privacy-boundary integration tests. It uses Node's `react-server` export condition so tests can import server-only Prisma modules. Never run it against a valuable development or production database.

The more focused `npm run test:schedule-constraints` command runs only the overlap-constraint suite and also requires a disposable database.

## Validation before sharing changes

Run the checks relevant to the changed files:

```bash
npm run lint
npm run build
```

For schema changes, generate the Prisma client and verify migrations against a disposable local database. For API or domain behavior changes, add or run the focused tests above, then run `npm run test:database` when the changed behavior relies on PostgreSQL.

## Troubleshooting

- **Database connection errors:** confirm the Compose service is healthy (`docker compose ps`) and `DATABASE_URL` matches the local port, database, username, and password.
- **Missing Prisma client:** run `npx prisma generate` after dependency install or schema changes.
- **No seeded sign-in account:** ensure the database migrations completed, then run `npx prisma db seed`.
- **Port 5432 already in use:** stop or reconfigure the conflicting local PostgreSQL service before starting Compose.
