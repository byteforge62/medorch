MedOrch repository context

This guide describes the committed source snapshot `60f52729794502fd125010ac5b9d3fa712917aba` of `byteforge62/medorch` as inspected on 2026-10-05. It is intended as a fast, source-backed orientation for coding agents. The accompanying interactive overview is [the MedOrch architecture diagram](.archify/architecture-medorch-20261005-103322/medorch-architecture.html); its pinned specification is [candidate.json](.archify/architecture-medorch-20261005-103322/candidate.json).

The application is a single Next.js App Router project for operating-theatre scheduling and resource management. Its UI, JSON API Route Handlers, NextAuth configuration, domain modules, and Prisma client are in the same TypeScript application. PostgreSQL is the configured database. There is no separate backend service in this repository.

## Repository map

| Path | Responsibility |
| --- | --- |
| [`src/app/`](src/app/) | App Router pages, root layout, loading/error/not-found states, and `api/**/route.ts` handlers. |
| [`src/components/`](src/components/) | Client UI: layout/header/sidebar; dashboard widgets; schedule forms, filters, lists and status actions; alert center; user list; login form; reusable UI primitives. |
| [`src/modules/`](src/modules/) | Domain-oriented services, Prisma repositories, and Zod validation for alerts, audit, departments, doctors, equipment, OT rooms, patients, schedules, and users. |
| [`src/lib/api/`](src/lib/api/) | API authorization adapter, fetch client/error type, request IDs, response envelope, error mapping, and a generic Zod body parser. |
| [`src/lib/auth/`](src/lib/auth/) | Server-page/API auth guards, role-permission map, role/status helpers, and bcrypt password helpers. |
| [`src/lib/db/`](src/lib/db/) | Server-only Prisma singleton backed by `@prisma/adapter-pg`. |
| [`src/generated/prisma/`](src/generated/prisma/) | Generated Prisma client and model/enumeration types. Treat these as generated output, not hand-maintained domain code. |
| [`prisma/`](prisma/) | Prisma schema, migrations, Prisma CLI configuration, and seed. The client generator writes to `src/generated/prisma`. |
| [`public/`](public/) | Static SVG assets. |
| Root configuration | `package.json`/lockfile, TypeScript, Next.js, Tailwind/PostCSS, ESLint, Prettier, and local PostgreSQL Compose configuration. |

The tracked tree contains 155 files in the inspected revision. It has no tracked test files and `package.json` defines no test script.

## Runtime and entry points

- `src/app/layout.tsx` is the root layout and wraps the route tree in the client-side NextAuth `SessionProvider`.
- `/` is a public marketing/landing page; `/login` renders the credentials form.
- `/dashboard` and `/schedules` call `requireAuth()` on the server. `/users` (implemented in the `(dashboard)` route group) calls `requireRole("ADMIN")`.
- `/unauthorized` is the role-denial destination. The root `loading.tsx` and `error.tsx` provide global App Router states.
- `/api/auth/[...nextauth]` exports NextAuth's `GET` and `POST` handlers. The other `src/app/api/**/route.ts` files implement the application's JSON API.
- The dashboard composes operational counts, quick links, recent schedules, OT rooms, and an alert summary. `OperationalOverview` obtains rooms, schedules, equipment, and alerts concurrently and derives counts in the client.
- `SchedulePage` loads schedules plus departments, rooms, patients, and doctors from the API; applies status/priority/date/department/room/search filters in the browser; and opens `ScheduleForm` for create/edit. The form sends JSON to `/api/schedules` or `/api/schedules/:id`.
- `AlertCenter` polls `/api/alerts` every 30 seconds and supports marking one/all read and deleting. `UserList` fetches `/api/users` and filters client-side.
- `AppShell`, `Header`, and `Sidebar` are shared authenticated-app layout components. Components under `components/ui` are the shared presentational primitives and loading/error/empty states.

Current source caveat: the dashboard's `QuickActions` includes links to `/ot-rooms` and `/equipment`, but the tracked App Router tree contains API endpoints for those resources and no corresponding page files. Do not assume those links resolve to implemented pages.

## Request and data flow

1. A browser page renders through the Next.js App Router. Interactive components use `apiClient` (`fetch`, JSON content type) to call same-origin `/api/...` endpoints.
2. Each API handler obtains a request ID, calls `authorizeApiRole(...)`, validates path/query/body data (usually with the domain Zod schema's `safeParse`), invokes a domain service, then returns `apiSuccess(data, 200)` or a structured `apiError`.
3. API authorization obtains the NextAuth session and enforces the role list written in that route. The service performs use-case rules and calls its repository; most repositories issue typed Prisma model operations. Some OT-room status/active operations call Prisma directly in the service.
4. `src/lib/db/prisma.ts` constructs the shared server-only Prisma Client with `PrismaPg` and `DATABASE_URL`. Prisma's configured datasource is PostgreSQL. In development, the client instance is reused via `globalThis`.
5. Mutating domain services commonly await `recordAudit(...)`; the audit repository inserts an `AuditLog` row through the same Prisma client. These are sequential service calls; application-owned `src/` code does not use `$transaction`.

The success envelope is `{ success: true, data }`. Errors use `{ success: false, message, details?, requestId? }`. Routes generally log caught server errors with the request ID and map known validation/domain/Prisma errors to HTTP responses. The request-ID helper currently reads the literal header name `x-requesst-id` (two `s` characters in `requesst`) before falling back to a generated UUID; callers should not assume the usual `x-request-id` spelling is recognized.

### Representative schedule creation flow

`SchedulePage` loads the schedule list and lookup data. An ADMIN submits the form to `POST /api/schedules`; the route validates UUIDs, required fields, date coercion, enums, and `endTime > startTime`. `createScheduleWithValidation` checks patient existence; department active status; room active/department/status compatibility; that the surgeon is an active `DOCTOR`; and overlapping schedules for the same room or surgeon. Conflicts exclude `CANCELLED` and `COMPLETED` rows and use strict interval overlap (`existing.startTime < requested.endTime` and `existing.endTime > requested.startTime`). The repository creates the schedule, then the service writes an audit log. The form refreshes the schedule list after success.

Schedule status transitions are validated in the service (not just by the enum schema):

| Current | Allowed next status |
| --- | --- |
| `SCHEDULED` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `IN_PROGRESS`, `DELAYED`, `CANCELLED` |
| `IN_PROGRESS` | `COMPLETED`, `DELAYED` |
| `DELAYED` | `CONFIRMED`, `IN_PROGRESS`, `CANCELLED` |
| `COMPLETED`, `CANCELLED` | none |

Schedule staff assignment requires an existing active user. Equipment assignment requires an existing `AVAILABLE` item; release stamps the assignment's `releasedAt`. Schedule notes are authored by the signed-in user; update/delete require the note author in the service. The database's uniqueness constraints provide additional duplicate guards for staff/equipment assignments.

## Authentication and authorization

- `src/auth.ts` configures NextAuth Credentials. It validates credential types, trims/lowercases email, looks up `User`, rejects missing or non-`ACTIVE` users, and compares passwords via `bcryptjs`. The session strategy is JWT; callbacks copy `id`, `role`, and `status` between the authenticated user, JWT, and session.
- `src/lib/auth/authorization.ts` provides page guards (`requireAuth`, `requireRole`, `requirePermission`) and API session/role helpers. Page guards redirect to `/login` or `/unauthorized`; API role checks return `null` on missing/disallowed sessions.
- `src/lib/api/auth.ts` adapts that API result into a 401 response. Role checks on actual API endpoints are explicit `authorizeApiRole` allowlists. `ROLE_PERMISSIONS` in `src/lib/auth/permission.ts` is a separate fine-grained permission map used by `requirePermission`; do not assume each API route consults that map.
- The four roles are `ADMIN`, `DOCTOR`, `OT_STAFF`, and `PATIENT`; account states are `PENDING`, `ACTIVE`, `SUSPENDED`, and `REJECTED`. The credentials provider admits only ACTIVE accounts.
- Password hashing uses bcryptjs with 12 salt rounds. The seed is an upsert for a local development administrator and includes a hard-coded development credential; inspect that source carefully before running it outside a disposable local environment.

### API surface and route-role gates

Role names below describe the route's explicit `authorizeApiRole` check; resource ownership checks are additional service behavior.

| Routes | Methods and gates |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth `GET` and `POST` handlers. |
| `/api/users`, `/api/users/:id` | `GET`: ADMIN. These routes expose reads only; no user create/update handler is present. |
| `/api/departments`, `/api/departments/:id` | `GET`: ADMIN/DOCTOR/OT_STAFF. `POST`, `PATCH`, `DELETE`: ADMIN. DELETE deactivates rather than deleting. |
| `/api/doctors`, `/api/doctors/:id` | `GET`: ADMIN/DOCTOR/OT_STAFF. `POST`, `PATCH`, `PATCH /:id/status`: ADMIN. |
| `/api/patients`, `/api/patients/:id` | `GET`: ADMIN/DOCTOR/OT_STAFF. `POST`, `PATCH`: ADMIN. |
| `/api/ot-rooms`, `/api/ot-rooms/:id` | `GET`: ADMIN/DOCTOR/OT_STAFF. `POST`, `PATCH`, `PATCH /:id/status`, `PATCH /:id/active`: ADMIN. |
| `/api/equipment`, `/api/equipment/:id` | `GET`: ADMIN/DOCTOR/OT_STAFF. `POST`, `PATCH`, `PATCH /:id/status`: ADMIN. |
| `/api/schedules`, `/api/schedules/:id` | List/detail `GET`: ADMIN/DOCTOR/OT_STAFF. Create `POST`, edit `PATCH`, and `PATCH /:id/status`: ADMIN. |
| `/api/schedules/:id/staff` | `GET`: ADMIN/DOCTOR/OT_STAFF; `POST`: ADMIN. `/staff/:staffId` DELETE: ADMIN. |
| `/api/schedules/:id/equipment` | `GET`: ADMIN/DOCTOR/OT_STAFF; `POST`: ADMIN. `/equipment/:equipmentId` PATCH (release): ADMIN. |
| `/api/schedules/:id/notes` | `GET` and `POST`: ADMIN/DOCTOR/OT_STAFF. `/notes/:noteId` PATCH/DELETE: same route roles, plus service author check (the service does not special-case ADMIN as an override). |
| `/api/alerts`, `/api/alerts/:id` | GET/PATCH/DELETE: all four roles. Service restricts non-ADMIN users to their own alerts. `POST /api/alerts`: ADMIN/DOCTOR/OT_STAFF. |
| `/api/alerts/:id/read`, `/api/alerts/read-all` | PATCH: all four roles. Service restricts non-ADMIN users to their own alert/user ID. |

All route files are in `src/app/api`; inspect the route itself when adding or changing an endpoint because allowlists are not generated from one central route policy.

## Persistence model

The authoritative schema is [`prisma/schema.prisma`](prisma/schema.prisma). It defines enums for account role/status, OT room and equipment status, schedule status/priority, staff role, alert type/severity, and audit action.

| Model | Purpose and important relations |
| --- | --- |
| `User` | Identity, unique email, password hash, role/status and approval timestamp. Optional one-to-one `DoctorProfile` and `Patient`; created/surgeon schedules; staff assignments; notes; alerts; audit logs. |
| `DoctorProfile` | One-to-one user profile, optional department membership, unique optional license number, and optional department-head relation. |
| `Patient` | Patient record with unique `patientCode`, optional one-to-one linked user, and schedules. |
| `Department` | Unique name, optional unique head doctor, active flag; has doctors, OT rooms, equipment, schedules. |
| `OTRoom` | Unique code, required department, status/active state, capacity; has schedules. |
| `Equipment` | Category, optional unique serial number, status, optional department and maintenance due date; has schedule assignments. |
| `Schedule` | Required patient, department, OT room, surgeon user, creator user, procedure and times; enum status/priority; has staff, equipment assignments, notes, and alerts. |
| `ScheduleStaff` | Join/assignment row with user, role, assignment time; unique on schedule/user/role. |
| `ScheduleEquipment` | Join/assignment row with assigned/released times; unique on schedule/equipment. |
| `ScheduleNote` | Schedule-scoped content and author. |
| `Alert` | User-owned typed/severity notification, optionally linked to schedule; includes `isRead` and `readAt`. |
| `AuditLog` | Action/entity/entity ID, optional actor, description/JSON metadata, timestamp. |

The schema declares explicit deletion semantics: schedule's patient/department/room/surgeon/creator references restrict deletion; schedule-owned staff/equipment/note rows cascade with the schedule; alert rows cascade with their user or linked schedule; audit actor and optional patient/doctor department links use `SetNull` where declared. Check the relation declaration before changing delete behavior.

Migrations are `20260926140643_init` and `20260926144114_add_audit_logging`. Generated Prisma code is configured to `src/generated/prisma`; the server entry is `@/generated/prisma/client`, with a browser entry also generated. The PostgreSQL 17 local Compose service publishes port 5432, persists data in a named volume, and has a `pg_isready` health check.

## Domain module map

Each listed module owns its use-case logic in a `*.service.ts`, Prisma calls in a `*.repository.ts`, and request schemas in a `*.validation.ts` (audit has service/repository but no request schema):

- **schedules** — list/detail/create/update, availability/conflict checks, status transitions, staff/equipment assignments, release, schedule notes; audit logging on mutations.
- **alerts** — filter/list/get/create/update/delete, owner checks, mark-one/all read; alert repository selects related user/schedule display fields.
- **audit** — narrow `recordAudit` service and Prisma `auditLog.create` repository.
- **departments** — list/detail/create/update/deactivate; audit writes.
- **doctors** — profile list/detail/create/update and linked User status change; creation requires a DOCTOR user with no existing profile; status activation sets `approvedAt`.
- **OT rooms** — list/detail/create/update, status and active-state changes; audit writes.
- **equipment** — list/detail/create/update/status changes; audit writes.
- **patients** — list/detail/create/update; audit writes.
- **users** — list/detail/email lookups. The exposed API routes currently use list/detail only.

Repository functions use explicit `select`/`include` shapes where data is returned, rather than returning password hashes in the user list/detail selects. Request DTOs and enum/string unions are TypeScript-oriented. Route schemas generally use Zod UUIDs, bounded/trimmed strings, optional/nullable update fields, enum allowlists, and `z.coerce.date()` where applicable.

## Configuration and dependencies

- Runtime dependencies: Next.js `16.3.6`, React/React DOM `19.2.8`, NextAuth `5.0.0-beta.32`, Prisma/Prisma Client `7.10.x`, `@prisma/adapter-pg`, `pg`, Zod `4.6.x`, and `bcryptjs`.
- Styling/build: Tailwind CSS 4 via `@tailwindcss/postcss`; `next.config.ts` enables the React Compiler.
- TypeScript is strict, uses bundler module resolution and `@/*` → `./src/*` aliases. Prettier uses single quotes, semicolons, trailing commas, and `prettier-plugin-tailwindcss`; ESLint composes Next Core Web Vitals and Next TypeScript presets.
- Required DB configuration is `DATABASE_URL`. `prisma.config.ts` loads `dotenv/config`, points to `prisma/schema.prisma` and `prisma/migrations`, configures `tsx prisma/seed.ts`, and reads `DATABASE_URL`. `.env*` is ignored by Git.
- Package scripts are `dev`, `build`, `start`, `lint`, `format`, and `format:check`. There is no declared test, migration, or database-start script; the local Postgres service is in `docker-compose.yml`.
- `README.md` is still the generic create-next-app starter, so prefer the code/schema and this guide over its feature description.

## Agent conventions and cautions

1. Keep business rules in the domain service and persistence queries in that domain's repository; add/adjust request schemas with the route that consumes them.
2. For API mutations, update the route allowlist and API validation explicitly, return the shared envelope, and map known service errors to appropriate statuses. Server routes use `await params` for dynamic route parameters.
3. Update Prisma schema and a migration together when changing persisted data; regenerate the client to the configured output and do not hand-edit `src/generated/prisma`.
4. Add audit behavior intentionally when introducing audited mutations; audit insertion is an awaited, separate Prisma operation in existing service flows.
5. Preserve two different authorization layers: page-level redirects and endpoint role allowlists. Data ownership is separately enforced in the alert and note services; a route role check alone does not establish record ownership.
6. Do not infer automatic alerts from schedule mutations: schedule services call the audit service, while alert creation is a separate alerts API/service operation.
7. There are no tests to run from the package scripts in this snapshot. Available checks are `npm run lint`, `npm run build`, and `npm run format:check`; choose the smallest relevant validation for a code change.

## Primary source anchors

- Authentication/session: [`src/auth.ts`](src/auth.ts), [`src/lib/auth/authorization.ts`](src/lib/auth/authorization.ts), [`src/lib/auth/permission.ts`](src/lib/auth/permission.ts).
- API conventions: [`src/lib/api/auth.ts`](src/lib/api/auth.ts), [`src/lib/api/response.ts`](src/lib/api/response.ts), [`src/lib/api/request-id.ts`](src/lib/api/request-id.ts), [`src/lib/api/client.ts`](src/lib/api/client.ts).
- UI call sites: [`src/components/schedules/SchedulePage.tsx`](src/components/schedules/SchedulePage.tsx), [`src/components/schedules/ScheduleForm.tsx`](src/components/schedules/ScheduleForm.tsx), [`src/components/dashboard/OperationalOverview.tsx`](src/components/dashboard/OperationalOverview.tsx), [`src/components/alerts/AlertCenter.tsx`](src/components/alerts/AlertCenter.tsx).
- Scheduling rules/persistence: [`src/modules/schedules/schedule.service.ts`](src/modules/schedules/schedule.service.ts), [`src/modules/schedules/schedule.repository.ts`](src/modules/schedules/schedule.repository.ts), [`src/modules/schedules/schedule.validation.ts`](src/modules/schedules/schedule.validation.ts).
- Database/development: [`prisma/schema.prisma`](prisma/schema.prisma), [`prisma.config.ts`](prisma.config.ts), [`prisma/seed.ts`](prisma/seed.ts), [`docker-compose.yml`](docker-compose.yml).