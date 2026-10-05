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

The repository currently has no `test` or `typecheck` npm script. `npm run build` is the available production compilation check; it does not replace automated behavior tests.

## Validation before sharing changes

Run the checks relevant to the changed files:

```bash
npm run lint
npm run build
```

For schema changes, generate the Prisma client and verify migrations against a disposable local database. For API or domain behavior changes, add or run targeted tests once a test harness is established; no dedicated test suite is currently configured.

## Troubleshooting

- **Database connection errors:** confirm the Compose service is healthy (`docker compose ps`) and `DATABASE_URL` matches the local port, database, username, and password.
- **Missing Prisma client:** run `npx prisma generate` after dependency install or schema changes.
- **No seeded sign-in account:** ensure the database migrations completed, then run `npx prisma db seed`.
- **Port 5432 already in use:** stop or reconfigure the conflicting local PostgreSQL service before starting Compose.
