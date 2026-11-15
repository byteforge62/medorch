# MedOrch

MedOrch is a role-based operating-theatre and hospital workflow platform. It
brings theatre scheduling, staff and equipment assignment, patient records,
operational alerts and audit history into one Next.js application backed by
PostgreSQL.

## Features

- **Role-aware access** for administrators, doctors, OT staff and patients,
  enforced on the server for every page and API route.
- **Operational dashboards** tailored to each role: theatre readiness, equipment
  state, upcoming and in-progress cases, alerts and personal appointments.
- **Scheduling** with room, surgeon, staff and equipment assignment, conflict
  detection, status transitions and clinical notes.
- **Management modules** for users, departments, doctors, patients, operating
  rooms and equipment.
- **Patient portal** limited to the signed-in patient's own appointments and
  alerts, with read/unread tracking.
- **Audit trail** of security-relevant operations, visible to administrators.
- **Account lifecycle**: credentials sign-in, patient registration, email
  verification and password reset.

## Technology

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Route Handlers) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL with Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Auth.js (NextAuth v5) credentials provider |
| Validation | Zod |
| Email | Nodemailer / Resend |
| Tests | Node test runner (`tsx`), Playwright |
| CI | GitHub Actions |

## Requirements

- Node.js 22 and npm
- PostgreSQL 17, either through the bundled Docker Compose service or an
  existing server

## Getting started

```bash
npm ci
```

Create your local environment file from the example and fill in the values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start PostgreSQL and apply the database setup:

```bash
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run db:seed:demo     # deterministic synthetic demo data
```

`npm run dev` also runs the seed before starting, so the demo data and demo
accounts always exist in development. Seeded records are synthetic and intended
for local evaluation only.

Open <http://localhost:3000>. The demo seed defines one account per role; the
credentials live in `prisma/demo-data.ts` and are not reproduced here.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma and the app |
| `TEST_DATABASE_URL` | Isolated database for automated tests; loopback host and a name ending in `_test` |
| `AUTH_SECRET` | Auth.js session/cookie signing secret |
| `NEXTAUTH_URL` | Public origin of the application, for example `http://localhost:3000` |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional Google OAuth credentials |
| `RESEND_API_KEY`, `EMAIL_FROM` | Outbound email for verification and password reset |

Only `.env.example` is committed. Real values belong in `.env` or a deployment
secret store and must never be committed.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Seed demo data and start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run prisma:validate` / `prisma:generate` | Validate the schema / regenerate the client |
| `npm run test` | Unit and integration tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Database-backed tests against the isolated test database |
| `npm run test:e2e` | Playwright browser and API journeys |
| `npm run test:runtime` | Role authorization probes against a disposable database and production server |
| `npm run test:coverage` | V8 coverage for the unit-level modules |
| `npm run test:ci` | Validation, lint, unit, integration and build checks |
| `npm run test:db:prepare` / `test:db:reset` / `test:db:seed` | Create and migrate / recreate / reseed the test database |

The browser suite uses the locally installed Google Chrome (`channel: "chrome"`),
so no Playwright browser download is required.

## Testing

Tests never touch the development database:

- `TEST_DATABASE_URL` must be a loopback PostgreSQL database whose name ends in
  `_test`; the test loader refuses anything else and refuses a value equal to
  `DATABASE_URL`.
- Database fixtures delete and recreate only the records they own.
- The browser suite starts a production server pointed at the test database.
- The runtime suite creates and drops a `medorch_runtime_test_*` database.

See [docs/TESTING.md](docs/TESTING.md) for setup, fixtures, coverage and the CI
workflow. The workflow in `.github/workflows/ci.yml` runs schema validation,
lint, type checking, unit tests, database tests, the production build and the
Playwright suite against a PostgreSQL service container.

## Roles

| Role | Scope |
| --- | --- |
| `ADMIN` | Full operational management, users, audit |
| `DOCTOR` | Own schedules and permitted patient/schedule information |
| `OT_STAFF` | Assignment-scoped theatre, schedule and equipment information |
| `PATIENT` | Own appointments and alerts only |

Authorization is enforced in route handlers and services, not only in the UI.

## Project structure

```text
src/app/          Pages, layouts and API route handlers
src/features/     Feature UI and client-side domain logic
src/components/   Shared UI, layout, navigation and visual primitives
src/server/       Services, repositories, validation, auth, database and API infrastructure
src/lib/          Browser API client, shared domain constants and environment helpers
prisma/           Schema, migrations and synthetic seed data
tests/            Unit, integration and fixture suites
e2e/              Playwright journeys and authorization checks
scripts/          Test database, test server and runtime harness scripts
docs/             Architecture, API, data model and testing documentation
```

## Documentation

- [Architecture](docs/architecture.md)
- [API reference](docs/api-reference.md)
- [Data model](docs/data-model.md)
- [Development guide](docs/development.md)
- [Product overview](docs/product-overview.md)
- [Decisions](docs/decisions.md)
- [Testing](docs/TESTING.md)
- [Component catalog](docs/design-system/COMPONENT_CATALOG.md)

## Limitations

- Email delivery requires `RESEND_API_KEY` (or equivalent SMTP configuration);
  without it, verification and reset messages are not delivered.
- Google OAuth is optional and only enabled when its credentials are present.
- The demo seed is synthetic development data and must not be used for real
  patient information.
