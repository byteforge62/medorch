# MedOrch automated testing

The suite runs on the tools the project already had — Node's built-in test
runner with `tsx` — plus Playwright for browser journeys. It uses the Chrome
already installed on the machine (`channel: 'chrome'`), so no browser download
is needed.

## Layers

| Layer | Command | What it covers |
| --- | --- | --- |
| Unit | `npm run test:unit` | Shared status contract, formatting helpers, badges, role navigation, permissions, redaction, request validation, accessibility of repeated controls |
| Integration | `npm run test:integration` | Repository/service behaviour and SQL constraints against PostgreSQL (overlaps, concurrency, audit atomicity, privacy scoping) |
| Browser / API | `npm run test:e2e` | Real sign-in for all four roles, dashboards, cross-module consistency, patient isolation, mark-as-read, equipment mutation, navigation |
| Runtime authorization | `npm run test:runtime` | Signs in over HTTP against a production server on a disposable, freshly migrated and demo-seeded database and probes every role's API boundaries |
| Coverage | `npm run test:coverage` | Node's V8 coverage for the unit-level modules |
| Everything | `npm test` | Unit + integration |

`npm run test:ci` runs schema validation, lint, unit, integration and the
production build (the browser suite is a separate step because it needs a
build and a database-backed server).

`npm run test:runtime` creates its own `medorch_runtime_test_*` database, runs
the committed migrations, seeds demo data with `SEED_VERIFIED_PATIENTS=1`,
starts `next start` on a free loopback port and drops the database afterwards.
It needs a running PostgreSQL and an existing production build; CI does not run
it because the workflow's database role has no create-database privilege.

## Database isolation

Nothing destructive ever targets the development database:

- `TEST_DATABASE_URL` must be loopback-only and its database name must end in
  `_test`. `tests/setup/test-env.ts` enforces this before any application
  module loads, then points `DATABASE_URL` at the test database.
- `assert`/guards refuse to run when `TEST_DATABASE_URL` equals `DATABASE_URL`.
- `scripts/test-db-setup.mjs` creates/migrates only the guarded database;
  `--reset` drops only that database.
- `tests/fixtures/seed-test-db.ts` deletes and recreates **only** the rows it
  owns, in the `*_test` database, and refuses any other database name.
- Browser runs start a production server whose `DATABASE_URL` is replaced with
  the test URL (`scripts/start-test-server.mjs`), so the development server
  and database are untouched.

### Local setup

```bash
docker compose up -d            # PostgreSQL on localhost:5432
# .env
DATABASE_URL=postgresql://medorch:medorch_dev_password@localhost:5432/medorch
TEST_DATABASE_URL=postgresql://medorch:medorch_dev_password@localhost:5432/medorch_test

npm run test:db:prepare         # create + migrate medorch_test
npm run test:unit
npm run test:integration
npm run build
npm run test:e2e                # resets, migrates and seeds medorch_test itself
```

`npm run test:db:reset` recreates the test database from scratch.
`npm run test:db:seed` re-seeds fixtures without dropping the schema.

## Fixtures

`tests/fixtures/seed-test-db.ts` creates fixed ids and a deterministic
scenario: two theatres (one ready, one in maintenance), three equipment items
(available, in use, maintenance), six schedules across every meaningful state,
two patients with their own alerts, and one account per role. Password:
`QaPass!2345`, accounts `qa.*@medorch.test`.

Specs call `resetFixtures()` in `beforeAll`, so each file owns its data and
files can be run individually or in any order.

## Environment variables

| Variable | Required by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Prisma, app | Development database; never used by destructive tests |
| `TEST_DATABASE_URL` | all database/browser tests | Loopback, name ending `_test` |
| `AUTH_SECRET` | auth | Falls back to a test-only value in tests |
| `NEXTAUTH_URL` / `AUTH_URL` | NextAuth | Test server sets these automatically |
| `E2E_PORT` | Playwright | Defaults to 5301 |

No secret is printed by the suite. `.auth/`, `test-results/` and
`playwright-report/` are gitignored.

## CI

`.github/workflows/ci.yml` runs on push and pull request with a PostgreSQL 17
service: install, `prisma generate`/`validate`, lint, `tsc --noEmit`, unit
tests, test database preparation, integration tests, production build, and the
Playwright suite. Playwright reports and traces are uploaded only on failure.
