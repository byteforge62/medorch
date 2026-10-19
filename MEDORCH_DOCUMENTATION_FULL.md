# MedOrch — Complete Documentation Bundle

This file concatenates the full contents of the documentation pack files as of the uploaded repository snapshot reviewed on 2026-10-19. It is a reading/reference copy; individual files remain the canonical files to copy into the repository. Runtime verification was not performed as part of preparing this bundle.



---

# Source document: `README.md`

# MedOrch Documentation Pack

This is a documentation-only overlay for the uploaded MedOrch snapshot, reviewed 2026-10-19. It contains refreshed project context/status and supporting architecture, API, data-model, development, product, security, file-index, workflow, decision, roadmap and AI coding workflow documents.

## Apply

Copy the files/folders in this ZIP into the root of your local MedOrch repository, allowing these documentation files to replace their existing counterparts. Review the diff before committing. No source code, environment files, dependencies, or database contents are included.

## Important

The status records previously reported test outcomes separately from tests independently executed during this documentation task. It explicitly marks PostgreSQL-backed schedule-constraint and concurrency verification as outstanding.


---

# Source document: `docs/ai-coding-workflow.md`

# AI Coding Workflow for MedOrch

This document is for future ChatGPT sessions and coding agents. Its purpose is to prevent repeated audits, guessed code, and endless one-file-at-a-time debugging.

## Before changing code

1. Read `PROJECT_CONTEXT.md`, `PROJECT_STATUS.md`, and the relevant section of `docs/roadmap.md`.
2. Inspect the **current local file**, not just a previous chat or uploaded archive.
3. Trace the full feature path as applicable: page/component → API route → authorization → Zod schema → service → repository → Prisma model/migration → tests.
4. Search for every caller of a changed service/function and every alternate API path exposing the same resource.
5. Confirm existing conventions, error codes, response envelope and role/ownership rules.
6. State the specific change and its acceptance criteria before editing; do not restart a completed phase without new evidence.

## Editing rules

- Prefer a focused diff over rewriting whole files.
- Never invent line numbers. Quote a stable nearby function/statement as the insertion point.
- When the user asks for exact replacement, identify the exact file and exact block to replace; otherwise edit directly only if the coding environment permits it.
- Preserve established architecture and avoid unrelated refactors.
- Do not add dependencies or schema migrations unless the feature genuinely requires them.
- For a schema change: update Prisma schema, generate client as needed, create migration using the project workflow, and test against a disposable DB.
- Server-side authorization is mandatory; hiding a button is not access control.
- Keep sensitive fields out of API responses unless the role and use case require them.
- Treat Prisma/database constraints as authoritative for concurrent integrity; service pre-checks alone are not race-safe.
- Keep permission tests free of accidental imports of `server-only`, Next.js runtime or Prisma modules when they are intended to be pure unit tests.

## Verification rules

Run only relevant checks first, then the full available suite for meaningful changes. Common checks:

```powershell
npx tsc --noEmit
npm run lint
node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts
npm run test:schedule-constraints
npm run build
```

Also use `npx prisma validate` and `npx prisma migrate status` for schema/migration work. DB tests must point to a disposable test database. Never run a seed or destructive test against valuable data.

Report command results honestly: PASS only if run and passed; BLOCKED if prerequisites are missing; NOT RUN if not attempted. Do not infer success from old logs.

## How to finish a task

The final response must include:
1. What changed and why.
2. Exact files changed.
3. Commands run and observed results.
4. Remaining risks/blockers.
5. Whether the task's acceptance criteria are met.
6. The next single task.

Update `PROJECT_STATUS.md` and relevant docs only after implementation and verification. Keep the next task explicit. Do not end by asking the user to paste a file already available in the current working repository/snapshot.

## Context across chats

A chat model may not retain every line of every source file between conversations. These repository documents preserve durable project context; the current source code remains authoritative. When a new chat begins, upload a fresh lightweight archive or provide the current Git diff if local code changed since the last snapshot.


---

# Source document: `docs/api-reference.md`

# API reference

The JSON API is implemented by Next.js Route Handlers under `src/app/api`. Dynamic identifiers shown in braces (for example, `{id}`) are path segments. Resource operations require an authenticated session; allowed roles vary by method. Auth.js, registration, verification, and account-recovery endpoints are public as required by those flows.

## Response format

Successful responses use the shared envelope:

```json
{
  "success": true,
  "data": {}
}
```

Error responses use this shape:

```json
{
  "success": false,
  "message": "Invalid schedule data.",
  "details": {},
  "requestId": "generated-request-id"
}
```

`details` and `requestId` are optional. Resource handlers generally respond with HTTP `200`, including create operations; registration and account-recovery handlers may return `202`. Typical error statuses include `400` for invalid input or a rejected domain rule, `401` for missing/unauthorized sessions, `404` for missing records, `409` for duplicate assignments, `429` for throttled requests, and `500` for unexpected handler failures. The endpoint implementation determines the precise status and error text.

## Route inventory

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/[...nextauth]` | Auth.js handler. |
| `POST` | `/api/auth/[...nextauth]` | Auth.js handler, including credentials sign-in. |
| `POST` | `/api/auth/register` | Register a patient account. |
| `POST` | `/api/auth/verify-email` | Verify a patient email address. |
| `POST` | `/api/auth/resend-verification` | Request another verification email. |
| `POST` | `/api/auth/forgot-password` | Request password-reset instructions. |
| `POST` | `/api/auth/reset-password` | Reset a password using a one-time token. |
| `GET`, `POST` | `/api/users` | List users or create a user. |
| `GET` | `/api/users/{id}` | Get one user. |
| `POST` | `/api/users/{id}/approve` | Approve a verified pending patient account. |
| `GET`, `POST` | `/api/doctors` | List or create a doctor record/profile. |
| `GET`, `PATCH` | `/api/doctors/{id}` | Get or update a doctor. |
| `PATCH` | `/api/doctors/{id}/status` | Change doctor account status. |
| `GET`, `POST` | `/api/patients` | List or create a patient record. |
| `GET`, `PATCH` | `/api/patients/{id}` | Get or update a patient. |
| `GET`, `POST` | `/api/departments` | List or create departments. |
| `GET`, `PATCH`, `DELETE` | `/api/departments/{id}` | Get, update, or delete a department. |
| `GET`, `POST` | `/api/ot-rooms` | List or create operating rooms. |
| `GET`, `PATCH` | `/api/ot-rooms/{id}` | Get or update an operating room. |
| `PATCH` | `/api/ot-rooms/{id}/status` | Change room status. |
| `PATCH` | `/api/ot-rooms/{id}/active` | Change room active state. |
| `GET`, `POST` | `/api/equipment` | List or create equipment. |
| `GET`, `PATCH` | `/api/equipment/{id}` | Get or update equipment. |
| `PATCH` | `/api/equipment/{id}/status` | Change equipment status. |
| `GET`, `POST` | `/api/schedules` | List schedules or create a validated schedule. |
| `GET`, `PATCH` | `/api/schedules/{id}` | Get or update a validated schedule. |
| `PATCH` | `/api/schedules/{id}/status` | Apply a supported lifecycle transition. |
| `GET`, `POST` | `/api/schedules/{id}/staff` | List or assign schedule staff. |
| `DELETE` | `/api/schedules/{id}/staff/{staffId}` | Remove a staff assignment. |
| `GET`, `POST` | `/api/schedules/{id}/equipment` | List or assign schedule equipment. |
| `PATCH` | `/api/schedules/{id}/equipment/{equipmentId}` | Update/release a schedule equipment assignment. |
| `GET`, `POST` | `/api/schedules/{id}/notes` | List or add schedule notes. |
| `PATCH`, `DELETE` | `/api/schedules/{id}/notes/{noteId}` | Update or delete a schedule note. |
| `GET` | `/api/me/schedules` | List the signed-in doctor's surgical schedules. |
| `GET` | `/api/me/staff-schedules` | List the signed-in OT staff member's assignments. |
| `GET` | `/api/me/appointments` | List appointments linked to the signed-in patient. |
| `GET`, `POST` | `/api/alerts` | List visible alerts or create an alert. |
| `GET`, `PATCH`, `DELETE` | `/api/alerts/{id}` | Get, update, or delete an alert. |
| `PATCH` | `/api/alerts/{id}/read` | Mark one alert as read. |
| `PATCH` | `/api/alerts/read-all` | Mark alerts read for a user. |
| `GET` | `/api/audit` | Query audit records (administrator only). |

The inventory reflects the implemented handlers; it is not a promise that every operation has a corresponding screen in the current UI.

## Authorization matrix

Role names used by the API:

- `ADMIN` — administrator
- `DOCTOR` — doctor
- `OT_STAFF` — operating-theatre staff
- `PATIENT` — patient

| Operation group | Read operations | Write operations |
| --- | --- | --- |
| Users | `ADMIN` | `ADMIN` can create users and approve verified pending patients; there are no general user update/delete handlers. |
| Doctors | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Patients | `ADMIN`, `DOCTOR` | `ADMIN` |
| Departments, rooms, equipment | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Schedules | `ADMIN`, `DOCTOR`, `OT_STAFF`; OT staff can fetch an individual schedule and its staff/equipment only when assigned. Patients can read only their own appointments through `/api/me/appointments`. OT-staff schedule responses redact clinical notes and patient email, date of birth, and gender. | Schedule create/update/status and staff/equipment assignment require `ADMIN`; schedule-note operations allow `ADMIN`, `DOCTOR`. |
| Alerts | All four roles can read; non-admins are restricted to their own alerts by the service. | Alert creation allows `ADMIN`, `DOCTOR`, `OT_STAFF`; alert changes are available to all four roles, with non-admin ownership checks in the service. |
| Audit | `ADMIN` | No audit mutation endpoint is exposed. |

This table describes the current Route Handler guards and service-level ownership checks. It is intentionally distinct from the role-permission map in `src/lib/auth/permission.ts`. Patients do not receive general schedule access; their appointment endpoint filters records by the signed-in account.

## Query and body validation

Handlers validate route IDs and request data with Zod schemas located in each domain module's `*.validation.ts` file. Malformed JSON request bodies return HTTP `400`. For example, schedule input requires UUID references, a trimmed procedure name from 1–200 characters, an end time later than the start time, and a supported optional priority. Schedule notes are trimmed and limited to 5,000 characters.

`GET /api/alerts` accepts these query parameters:

| Parameter | Meaning |
| --- | --- |
| `userId` | Filter by recipient; service logic still limits non-admin users to their own alerts. |
| `isRead` | Filter read state. |
| `severity` | Filter alert severity. |
| `type` | Filter alert type. |

For exact request shapes and domain error mapping, consult the matching route and validation schema; this reference summarizes the API surface rather than duplicating every Zod definition.

## Schedule lifecycle values

`PATCH /api/schedules/{id}/status` accepts `SCHEDULED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, or `DELAYED`. Valid transitions are checked by the schedule service. See [Product and workflow overview](./product-overview.md#status-and-priority-are-separate-concepts).


## Source-of-truth note (2026-10-19)

This inventory was cross-checked against the uploaded source snapshot. The current route files include `POST /api/users`, `/api/users/{id}/approve`, patient/doctor/OT-room/equipment management pages, `/schedules/{id}` detail UI, and the audit page/API. Older project notes that say these are absent are stale. For the exact permission required by any operation, inspect that method's `authorizeApiPermission(...)` call in its current route handler and `src/lib/auth/permission.ts`; do not infer permission solely from this table. This document lists routes but does not replace source-level review or integration tests.


---

# Source document: `docs/architecture.md`

# Architecture

## System shape

MedOrch is a single Next.js application backed by PostgreSQL. It uses the App Router for rendered pages and Route Handlers for JSON APIs; it does not have a separately deployed frontend or API service.

```text
Browser
  │
  ├── App Router pages and layouts
  │     ├── server-side authentication and page guards
  │     └── React client components for interactive views
  │
  └── /api Route Handlers
        ├── session / role authorization
        ├── Zod input validation
        ├── domain services
        ├── Prisma repositories
        └── PostgreSQL
```

## Request lifecycle

1. A page or interactive component loads a view. Client components use the shared `apiClient` for JSON requests.
2. A Route Handler obtains a request identifier and applies the authorization appropriate to that operation.
3. The handler parses route parameters, query values, or JSON bodies with the domain's Zod schemas.
4. A domain service enforces rules that require related database records or state—for example, checking a schedule's room, department, surgeon, and conflicts.
5. A repository performs the Prisma query or write.
6. The handler returns a shared success or error response; the client converts error responses to `ApiClientError`.

Not every module uses precisely the same helper path. Use the individual route and service as the source of truth for an operation's current behavior.

## Code organization

| Location | Responsibility |
| --- | --- |
| `src/app/` | App Router pages, layouts, error states, and API Route Handlers. |
| `src/components/` | Dashboard, schedule, alert, user, layout, and shared interface components. |
| `src/lib/auth/` | Credential verification, session access, role checks, and permission definitions. |
| `src/lib/api/` | Request authorization helper, response envelope, validation helper, request identifier, and browser API client. |
| `src/lib/db/` | Prisma client configured with the PostgreSQL adapter. |
| `src/modules/<domain>/` | Domain validation, service rules, and repository access for a feature area. |
| `src/modules/audit/` | Audit record service and persistence access. |
| `src/generated/prisma/` | Generated Prisma client and model types. |
| `prisma/` | Prisma schema, SQL migrations, and development seed. |

The domain modules include alerts, audit, departments, doctors, equipment, operating rooms, patients, schedules, and users.

## Architectural choices

### Domain services own cross-record rules

Schema validation handles input shape and local constraints such as enum membership and time ordering. The schedule service performs checks that depend on persisted data: active department, room-to-department alignment, room availability, surgeon role/status, and conflicting schedules. This separates request parsing from operational rules.

### Route Handlers own transport concerns

Handlers translate HTTP input into validated domain calls, enforce operation-level access, and translate domain failures into HTTP responses. Shared response and client helpers provide a common envelope, while error mapping remains endpoint-aware.

### Prisma models the operational relationships

The relational schema makes schedule ownership and assignments explicit. Foreign keys and uniqueness constraints protect identity and association rules; indexes target common lookups such as schedule time, room, surgeon, status, and unread alerts.

## Persistence and runtime

Prisma 7 uses the PostgreSQL adapter (`@prisma/adapter-pg`). The application client is a shared module instance and is cached on `globalThis` during development to avoid repeated connections during hot reload. Docker Compose provisions PostgreSQL 17 for local development.

## Current trade-offs and boundaries

- Dashboard counts are assembled from API list requests on the client; there is no dedicated aggregate endpoint or push-based update channel.
- Schedule lists and their filters are loaded and filtered in the browser in the current interface.
- Schedule conflict detection is performed in service logic for readable errors and is also enforced by PostgreSQL GiST exclusion constraints in migration `20261010224215_schedule_overlap_constraints` for room, surgeon and patient intervals. The constraints exclude `CANCELLED` and `COMPLETED` schedules and use half-open `[startTime, endTime)` ranges.
- Role permissions are enforced at route level and differ by operation. The permission definition is not a universal policy engine; consult the [API reference](./api-reference.md).
- Audit records are written by selected domain operations. Their presence does not by itself provide a compliance-grade immutable audit system.

These are documented implementation limits, not claims about a production architecture.


---

# Source document: `docs/data-model.md`

# Data model

The Prisma schema at `prisma/schema.prisma` is the authoritative definition. PostgreSQL is the persistence layer; UUID strings identify most records, with database enums used for role, status, priority, and action fields.

## Entities

| Model | Purpose and notable fields |
| --- | --- |
| **User** | Login identity, password hash, role, account status, approval timestamp, and profile basics. Relates to doctor or patient profiles, created schedules, assigned staff, notes, alerts, and audit records. |
| **DoctorProfile** | Doctor-specific specialization, license number, and optional department. A profile belongs to one user; its license number is unique when present. |
| **Patient** | Patient code, demographic/contact fields, optional user account, and optional medical-history text. A patient may have multiple schedules. |
| **Department** | Named service line, active flag, optional head doctor, doctors, rooms, equipment, and schedules. Department name is unique. |
| **OTRoom** | Room name/code, required department, optional capacity, active flag, and operational status. Room code is unique. |
| **Equipment** | Name, category, optional unique serial number, status, optional department, and optional maintenance due date. |
| **Schedule** | Procedure, scheduled date and time range, lifecycle status, priority, optional clinical notes, and required patient, department, room, surgeon, and creator references. |
| **ScheduleStaff** | Join record for a user assigned to a schedule with a staff role and assignment time. |
| **ScheduleEquipment** | Join record for equipment assigned to a schedule, with assignment and optional release timestamps. |
| **ScheduleNote** | Schedule note content, author, and create/update timestamps. |
| **Alert** | User-facing alert type, severity, optional schedule relation, message, read flag, and read timestamp. |
| **AuditLog** | Actor (optional), action, entity identifier, optional description/JSON metadata, and creation time. |

## Relationship outline

```text
Department ──< DoctorProfile
     │       ├──< OTRoom
     │       ├──< Equipment
     │       └──< Schedule >── Patient
     │                  ├──── User (surgeon)
     │                  ├──── User (creator)
     │                  ├──< ScheduleStaff >── User
     │                  ├──< ScheduleEquipment >── Equipment
     │                  ├──< ScheduleNote >── User (author)
     │                  └──< Alert
     └── User (optional department head)

User ── optional DoctorProfile
User ── optional Patient
User ──< Alert
User ──< AuditLog
```

`Schedule.surgeonId` and `Schedule.createdById` are separate relations to `User`. A doctor's profile is a one-to-one extension of the user record, not a separate login identity.

## Enumerated values

| Enum | Values |
| --- | --- |
| `UserRole` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` |
| `UserStatus` | `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED` |
| `OTRoomStatus` | `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `DISABLED` |
| `EquipmentStatus` | `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED` |
| `ScheduleStatus` | `SCHEDULED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DELAYED` |
| `SchedulePriority` | `ELECTIVE`, `URGENT`, `EMERGENCY` |
| `StaffRole` | `SURGEON`, `NURSE`, `ANESTHETIST`, `TECHNICIAN`, `OTHER` |
| `AlertType` | `SCHEDULE`, `RESOURCE`, `SYSTEM`, `MAINTENANCE` |
| `AlertSeverity` | `INFO`, `WARNING`, `CRITICAL` |
| `AuditAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `APPROVE`, `REJECT`, `CANCEL`, `COMPLETE` |

## Constraints and lifecycle behavior

- Email, patient code, room code, department name, and optional license/serial identifiers have uniqueness constraints.
- A user can have at most one doctor profile and one linked patient record.
- A department head is unique across departments.
- A schedule staff assignment is unique for a given schedule, user, and role.
- A schedule-equipment pair is unique.
- Schedule references to patient, department, room, surgeon, and creator use restrictive deletion behavior; related notes and assignments cascade with schedule deletion.
- Room/department, equipment/department, and doctor/department references are optionality-aware. Several optional associations use `SetNull` on deletion.
- Indexes cover role/status, department and resource status, schedule date/time/status/priority and foreign keys, alert owner/read state, and audit entity/action/time.

The schema's unique constraints do not enforce non-overlapping schedule intervals. The current conflict check is in service logic; see [Architecture](./architecture.md#current-trade-offs-and-boundaries).


---

# Source document: `docs/decisions.md`

# MedOrch Architecture Decisions and Open Questions

This file records current implementation facts and decisions that must be made explicitly. It does not invent historical rationale.

## Confirmed implementation facts

1. **Single Next.js application:** UI and JSON API live in the same App Router application; there is no separate API service in this repository.
2. **PostgreSQL + Prisma 7:** PostgreSQL is the persistence layer; Prisma uses `@prisma/adapter-pg`.
3. **Auth.js credentials + JWT:** credentials provider verifies bcrypt hashes; JWT callbacks check account state and `sessionVersion`.
4. **Domain layering:** most features have validation, service and repository files under `src/modules/<domain>/`.
5. **Shared API envelope:** success and error envelopes are centralized in `src/lib/api/response.ts`.
6. **Database schedule constraints:** migration `20261010224215_schedule_overlap_constraints` adds GiST exclusion constraints for overlapping patient, room and surgeon intervals; cancelled/completed schedules are excluded.
7. **Half-open schedule intervals:** database range uses `[startTime, endTime)`, allowing adjacent bookings with no overlap.
8. **Generated Prisma code:** `src/generated/prisma/` is generated output, not a source of manual edits.
9. **Synthetic-data boundary:** do not use real patient/clinical data for development, screenshots, demos or testing.

## Open decisions (do not silently choose)

1. **Sign-in and registration rate limits:** determine acceptable per-IP/per-account policy and storage mechanism before implementing broad throttling.
2. **Audit transactionality and event coverage:** define which business mutations must fail/roll back if audit persistence fails, and which events are mandatory.
3. **OT staff clinical data:** confirm the minimum patient fields and schedule details OT staff need. Current helper redacts clinical notes, schedule notes, email, DOB and gender from relevant responses.
4. **Doctor schedule mutation scope:** define whether doctors may manage any schedule or only schedules assigned to them/created by them. Current permission map grants `schedules:manage` to DOCTOR; do not impose a different rule without product confirmation.
5. **Patient access policy:** document whether patients can see only appointments or any other schedule metadata; preserve own-record scoping.
6. **Account provisioning:** define which roles can register publicly and which roles must be created/approved by administrators. Current public registration is for patients.
7. **Production deployment/security baseline:** decide hosting, secrets management, backup/restore, monitoring, incident response, data retention and applicable healthcare/legal compliance requirements before production use.

## Change log discipline

When a decision is made, record date, decision, reason, alternatives considered, affected files/migrations and any migration/rollout risk. Link to the implementing PR/commit when available.


---

# Source document: `docs/development.md`

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


---

# Source document: `docs/file-index.md`

# File and Route Index

This index is an orientation map for the current uploaded snapshot. Use `Get-ChildItem -Recurse` or IDE search for the current local tree before making changes.

## Pages and route families

| UI path | Source path | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Public landing page. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Role-aware operational dashboard. |
| `/login` | `src/app/login/page.tsx`, `src/components/auth/LoginForm.tsx` | Credentials login. |
| `/register` | `src/app/register/page.tsx` | Patient registration. |
| `/verify-email` | `src/app/verify-email/page.tsx` | Email verification. |
| `/resend-verification` | `src/app/resend-verification/page.tsx` | Request verification email again. |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Request reset instructions. |
| `/reset-password` | `src/app/reset-password/page.tsx` | Reset with token. |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | Permission-denied destination. |
| `/schedules` | `src/app/schedules/page.tsx`, `src/components/schedules/SchedulePage.tsx` | Schedule listing, filters and create/edit interactions. |
| `/schedules/[id]` | `src/app/schedules/[id]/page.tsx`, `ScheduleDetails.tsx` | Schedule detail UI. |
| `/patients` | `src/app/patients/page.tsx`, `PatientRegistry.tsx` | Patient registry. |
| `/patients/[id]` | `src/app/patients/[id]/page.tsx`, `PatientDetail.tsx` | Patient detail. |
| `/patients/appointments` | `src/app/patients/appointments/page.tsx`, `MyAppointments.tsx` | Patient's own appointments. |
| `/patients/appointments/[id]` | `src/app/patients/appointments/[id]/page.tsx`, `AppointmentDetail.tsx` | Appointment detail. |
| `/doctors` | `src/app/doctors/page.tsx`, `DoctorDirectory.tsx` | Doctor directory. |
| `/doctors/[id]` | `src/app/doctors/[id]/page.tsx`, `DoctorDetail.tsx` | Doctor detail. |
| `/ot-rooms` | `src/app/ot-rooms/page.tsx`, `OtRoomManagement.tsx` | OT room management. |
| `/equipment` | `src/app/equipment/page.tsx`, `EquipmentManagement.tsx` | Equipment management. |
| `/audit` | `src/app/(dashboard)/audit/page.tsx`, `AuditLogViewer.tsx` | Audit event viewer in dashboard route group. |
| `/users` | `src/app/(dashboard)/users/page.tsx` | User listing/management surface. |

## API route inventory

Auth and account recovery:

- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js handlers.
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/resend-verification/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`

User and profile resources:

- `src/app/api/users/route.ts`, `src/app/api/users/[id]/route.ts`, `src/app/api/users/[id]/approve/route.ts`
- `src/app/api/doctors/route.ts`, `src/app/api/doctors/[id]/route.ts`, `src/app/api/doctors/[id]/status/route.ts`
- `src/app/api/patients/route.ts`, `src/app/api/patients/[id]/route.ts`
- `src/app/api/departments/route.ts`, `src/app/api/departments/[id]/route.ts`
- `src/app/api/ot-rooms/route.ts`, `src/app/api/ot-rooms/[id]/route.ts`, `src/app/api/ot-rooms/[id]/status/route.ts`, `src/app/api/ot-rooms/[id]/active/route.ts`
- `src/app/api/equipment/route.ts`, `src/app/api/equipment/[id]/route.ts`, `src/app/api/equipment/[id]/status/route.ts`

Scheduling:

- `src/app/api/schedules/route.ts`
- `src/app/api/schedules/[id]/route.ts`
- `src/app/api/schedules/[id]/status/route.ts`
- `src/app/api/schedules/[id]/staff/route.ts`
- `src/app/api/schedules/[id]/staff/[staffId]/route.ts`
- `src/app/api/schedules/[id]/equipment/route.ts`
- `src/app/api/schedules/[id]/equipment/[equipmentId]/route.ts`
- `src/app/api/schedules/[id]/notes/route.ts`
- `src/app/api/schedules/[id]/notes/[noteId]/route.ts`
- `src/app/api/me/schedules/route.ts` — doctor-specific schedule list.
- `src/app/api/me/staff-schedules/route.ts` — OT staff assignment list.
- `src/app/api/me/appointments/route.ts` — patient's own appointments.

Other:

- `src/app/api/alerts/route.ts`, `src/app/api/alerts/read-all/route.ts`, `src/app/api/alerts/[id]/route.ts`, `src/app/api/alerts/[id]/read/route.ts`
- `src/app/api/audit/route.ts`

## Domain modules

| Module | Key files | Main responsibilities |
|---|---|---|
| Auth | `src/auth.ts`, `src/lib/auth/*`, `src/lib/api/auth.ts` | Credential verification, session validity, page/API authorization. |
| Schedules | `src/modules/schedules/schedule.validation.ts`, `schedule.service.ts`, `schedule.repository.ts`, `schedule-access.ts`, `schedule-conflict-error.ts` | Schedule rules, status transitions, conflict handling, staff/equipment/note operations and response access helpers. |
| Patients | `src/modules/patients/patient.validation.ts`, `patient.service.ts`, `patient.repository.ts` | Patient input validation and data access. |
| Doctors | `src/modules/doctors/doctor.validation.ts`, `doctor.service.ts`, `doctor.repository.ts` | Doctor profiles and status. |
| Departments | `src/modules/departments/department.validation.ts`, `department.service.ts`, `department.repository.ts` | Department records. |
| OT rooms | `src/modules/ot-rooms/ot-room.validation.ts`, `ot-room.service.ts`, `ot-room.repository.ts` | Room inventory, status and activation. |
| Equipment | `src/modules/equipment/equipment.validation.ts`, `equipment.service.ts`, `equipment.repository.ts` | Equipment inventory and lifecycle. |
| Users | `src/modules/users/user.validation.ts`, `user.service.ts`, `user.repository.ts` | User records and account operations. |
| Alerts | `src/modules/alerts/alerts.validation.ts`, `alerts.service.ts`, `alerts.repository.ts` | User-scoped alert operations. |
| Audit | `src/modules/audit/audit.service.ts`, `audit.repository.ts` | Audit event writes and reads. |

## Shared infrastructure

- `src/lib/api/response.ts`: response envelopes.
- `src/lib/api/validation.ts`: malformed JSON handling and Zod parsing helper.
- `src/lib/api/request-id.ts`: request correlation ID.
- `src/lib/api/error.ts`: Prisma/domain error message mapping utilities.
- `src/lib/api/client.ts`: browser-side API client.
- `src/lib/db/prisma.ts`: Prisma singleton.
- `src/lib/env.ts`: environment validation.
- `src/components/layout/`: `AppShell`, `Header`, `Sidebar`.
- `src/components/dashboard/`: dashboards and operational widgets.
- `src/components/schedules/`: schedule calendar, card, filters, form, list, status actions/badge.
- `src/components/alerts/AlertCenter.tsx`: alert drawer/center.
- `src/components/ui/`: shared buttons, badges, cards, empty/error/loading states.

## Tests

| Test | Focus | External dependency |
|---|---|---|
| `tests/api-request-validation.test.ts` | Shared JSON-body validation behavior. | No database intended. |
| `tests/foundation-validation.test.ts` | Foundation validation rules. | No database intended. |
| `tests/permissions.test.ts` | Role-to-permission map. | Keep isolated from Auth.js/Prisma imports. |
| `tests/schedule-access.test.ts` | Schedule transitions/access/redaction helpers. | No database intended. |
| `tests/schedule-constraints.test.ts` | PostgreSQL exclusion constraints for overlapping schedules. | Requires `DATABASE_URL` to a disposable test DB. |


---

# Source document: `docs/product-overview.md`

# Product and workflow overview

## Product intent

Operating-theatre coordination depends on several connected facts: which patient and procedure are planned, which room and surgeon are assigned, whether those resources are available, and how the schedule changes over time. MedOrch is a portfolio prototype that brings those records into one operational workspace and models the checks that make a schedule plausible.

The product goal is operational visibility and coordination. It is not clinical decision support: the application does not recommend treatment, assess clinical suitability, or replace a hospital information system.

## Users represented in the application

The domain model and permission definitions represent four roles:

| Role | Intended responsibility |
| --- | --- |
| **Administrator** | Maintain users and operational master data; coordinate schedules and access. |
| **Doctor** | Review schedules and resource context; contribute to schedule operations. |
| **Operating-theatre staff** | Review theatre schedules and coordinate assigned operational resources. |
| **Patient** | A represented account role with intended access to personal schedule and alert information. |

These roles describe the product model, not a claim that every workflow is available to every role in the current UI or API. Effective endpoint access is route-specific; see the [API authorization matrix](./api-reference.md#authorization-matrix) and [known boundaries](./security-and-limitations.md#known-implementation-boundaries).

## Implemented workflow

### 1. Prepare operational records

Administrators can work with department, doctor, patient, room, equipment, and user records through their API resources. Rooms belong to departments; equipment can be associated with a department; doctor profiles can identify a department and specialization.

### 2. Propose a schedule

A schedule links a patient, department, operating room, surgeon, creator, procedure description, date, start and end times, priority, and optional clinical notes. Input validation requires UUID identifiers, a non-empty procedure name, a valid time range, and supported priority values.

### 3. Validate operational fit

The schedule service checks referenced records and room/surgeon eligibility. It rejects an inactive department, an unavailable or mismatched room, an inactive or non-doctor surgeon, and an overlapping schedule for the selected room or surgeon. Updates exclude the schedule being edited from their own conflict check.

### 4. Coordinate the schedule

The API supports assigning staff with a role, assigning equipment, releasing assigned equipment, and adding, editing, or deleting schedule notes. The data model records assignment timestamps and equipment release time.

### 5. Track lifecycle and surface changes

Schedule status is constrained to supported transitions. Alerts can be listed and marked read; non-administrator alert access is scoped to the requesting user in the service layer. Selected domain mutations create audit records.

## Status and priority are separate concepts

**Lifecycle status** describes progress:

`SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED`

Alternative supported paths include `SCHEDULED → CANCELLED`, `CONFIRMED → DELAYED`, and `DELAYED → CONFIRMED`, `IN_PROGRESS`, or `CANCELLED`. `COMPLETED` and `CANCELLED` are terminal in the service transition map.

**Priority** describes urgency: `ELECTIVE`, `URGENT`, or `EMERGENCY`. It does not itself advance a schedule's lifecycle.

## Interface and operational visibility

The authenticated dashboard presents room availability, schedule and equipment counts, recent schedules, quick actions, and alert summaries. The schedule page supports filters by status, priority, date, department, room, and text matching against procedure, patient, and surgeon names.

The dashboard requests data when it loads and derives its summary counts in the browser. The room panel offers a manual refresh. This implementation is useful for demonstrating operational aggregation and UI states, but it is not a continuously synchronized or real-time monitoring system.

## Suggested demonstration

For a concise recruiter walkthrough:

1. Start with the dashboard and explain which operational records feed its summary.
2. Move to the schedule list and demonstrate a filter or search.
3. Create or update a schedule using synthetic data.
4. Explain why the room/department relationship and room/surgeon overlap checks belong in the domain service rather than only in the form.
5. Trace the request through a Route Handler, service, repository, and Prisma model.
6. Show the status transition map and the related audit event behavior.

The seed supplies only a local administrator account; it does not populate a realistic demo hospital or prebuilt schedule scenario.


---

# Source document: `docs/roadmap.md`

# MedOrch Development Roadmap

This roadmap prioritizes confidence and completion over starting more features. Reorder only when a real blocker or product requirement justifies it.

## Phase 0 — Baseline and documentation (in progress)

**Goal:** Keep project status, architecture, API map and agent instructions aligned with source.

Acceptance criteria:
- [ ] Updated `PROJECT_CONTEXT.md` and `PROJECT_STATUS.md` are in the repository.
- [ ] Page/API/file index matches the current tree.
- [ ] Workflows and domain constraints are documented.
- [ ] Each later phase has an explicit exit criterion.

## Phase 1 — Complete API/security verification (current engineering priority)

**Goal:** Prove that the recent auth, permission, redaction, request validation and schedule concurrency changes work against the actual DB/runtime.

Tasks:
- [ ] Create/use a disposable PostgreSQL test database; confirm `DATABASE_URL` points only to it.
- [ ] Run `npm run test:schedule-constraints` and capture exact output.
- [ ] Integration-test conditional schedule status updates under concurrent changes.
- [ ] Test OT_STAFF assignment checks and redaction across every relevant schedule/staff/equipment/note read path.
- [ ] Test role and ownership boundaries for schedule mutations, alerts, patients, users and account recovery.
- [ ] Verify malformed JSON and known Prisma/domain errors map to intended status codes.
- [ ] Run typecheck, lint, focused tests and production build on the same revision.
- [ ] Update `PROJECT_STATUS.md` with observed results and remaining policy decisions.

Exit criteria: database-backed schedule tests and concurrency test pass; permission/redaction tests cover recent changes; all available checks pass or blockers are precisely documented.

## Phase 2 — End-to-end workflow validation

**Goal:** Confirm actual role-based UI workflows rather than source presence alone.

Suggested scenarios:
- [ ] Admin provisions/approves accounts and manages departments, rooms, equipment and doctors.
- [ ] Admin creates, edits, confirms, delays, cancels and completes schedules using valid/invalid inputs.
- [ ] Doctor sees permitted schedules and performs only allowed mutations.
- [ ] OT staff sees only assigned schedules and only approved fields; can use authorized staff/equipment workflows.
- [ ] Patient sees only their own appointments and cannot access another patient's records.
- [ ] Alert read/unread/update/delete behavior is user-scoped.
- [ ] Verification and password-reset happy paths, expired tokens, reused tokens and rate limits work with test mail configuration.
- [ ] Error/loading/empty states are useful and consistent.

Exit criteria: scenario checklist passes in a local test environment with synthetic data; defects are filed by severity and fixed or accepted.

## Phase 3 — Close confirmed product gaps

**Goal:** Implement only gaps confirmed by requirements and the end-to-end audit.

Possible candidates, pending evidence:
- User lifecycle actions beyond current list/detail/create/approval paths.
- Better operational schedule assignment UX if the detail page does not fully expose existing APIs.
- Automated alert triggers for schedule lifecycle events.
- Stronger audit consistency/coverage based on a written audit policy.
- Pagination/filtering and server-side query efficiency where actual data scale requires it.

Exit criteria: each chosen feature has requirements, permission rules, validation, tests, documentation and acceptance checks.

## Phase 4 — Portfolio/demo readiness

- [ ] Reliable one-command local setup instructions.
- [ ] Deterministic synthetic seed/demo dataset.
- [ ] Clear role-based demo accounts stored safely for local use only.
- [ ] Responsive UI review and end-to-end demo walkthrough.
- [ ] Updated screenshots/demo script and architecture explanation.
- [ ] CI runs lint, typecheck, unit tests, Prisma validation and build.

Exit criteria: another developer can follow the setup guide and demonstrate core workflows without manual debugging.

## Phase 5 — Production-readiness assessment (separate from portfolio demo)

- [ ] Threat model and security review.
- [ ] Secrets management, HTTPS/security headers, logging/monitoring and alerting.
- [ ] Database backup/restore drill and migration rollback strategy.
- [ ] Data retention, privacy, access review and incident response.
- [ ] Formal review of applicable healthcare and privacy obligations.

**Boundary:** a successful build and demo do not establish production readiness for real clinical data.


---

# Source document: `docs/security-and-limitations.md`

# Security and project boundaries

## Intended use

MedOrch is a portfolio and development prototype. It is not an electronic health record, a medical device, a clinical decision-support tool, or an approved system for storing protected health information. Use synthetic data only. The schema includes patient and clinical-note fields, but their presence does not establish that the application meets healthcare privacy, security, availability, or regulatory requirements.

No production deployment or compliance assessment is documented in this repository. Do not use this project to make clinical decisions or to coordinate real patient care.

## Controls implemented in the code

- **Credential sign-in:** Auth.js credentials authenticate against a stored password hash. Email input is trimmed and normalized to lowercase. Only users in `ACTIVE` status can sign in.
- **Password hashing:** Password hashes use bcryptjs with 12 salt rounds.
- **Session lifecycle:** Auth.js uses JWT sessions and exposes user ID, role, and status. The JWT callback checks that the account remains active and that its session version still matches; invalid or outdated sessions do not populate `session.user`.
- **Password reset:** Reset tokens are hashed at rest, consumed transactionally, and increment the user session version so existing sessions are invalidated.
- **Page and API guards:** Server-side helpers gate authenticated pages and role-restricted API operations. Endpoint permissions vary by method; consult the [authorization matrix](./api-reference.md#authorization-matrix).
- **Input validation:** Domain Zod schemas validate request bodies, identifiers, enums, and selected cross-field constraints. Services perform persisted-record and operational checks.
- **Alert ownership:** Non-admin alert reads and mutations are checked against the requesting user's ID in alert service logic.
- **Audit records:** The schema supports audit actions and JSON metadata. Domain services write audit records for selected operational mutations.

These are implementation observations, not a security certification or guarantee.

## Local development credentials

The repository includes development credentials in both `docker-compose.yml` and `prisma/seed.ts`:

- PostgreSQL: `medorch` / `medorch_dev_password`
- Seed administrator: `admin@medorch.local` / `MedOrch@Dev123!`

The seed upserts the account and resets its password when run. These values are public development defaults. Do not deploy them, reuse them, or place real data in the local instance. Production use would require replacing the credential and secret-management approach, removing or redesigning the seed account behavior, and reviewing the deployment configuration.

## Known implementation boundaries

1. **Prototype data only.** There is no documented production operations plan for backups, monitoring, incident response, encryption configuration, retention, or recovery.
2. **Declared permission versus effective access.** `src/lib/auth/permission.ts` defines role permissions, while Route Handlers also apply route-specific checks and ownership filters. For example, patients can read only their own appointments through `/api/me/appointments`; they do not receive general schedule-list access. Treat handler and service checks as the effective API behavior.
3. **Schedule conflict concurrency.** Application services check for overlapping room, surgeon, and patient schedules, and the PostgreSQL migration adds exclusion constraints for all three resources. The database constraints provide concurrency-safe enforcement when migrations are applied; deployment state was not verified as part of this repository audit.
4. **Audit scope.** Audit events are written for selected mutations, not every read or every conceivable state change. The table is not demonstrated as immutable, tamper-evident, retention-controlled, or compliance-grade.
5. **Operational freshness.** Dashboard values are fetched on page load and summarized in the client. There is no push-based real-time feed.
6. **Automated verification.** The repository has focused permission and PostgreSQL schedule-constraint tests, but no tests for authentication/session invalidation, endpoint ownership, or password/email token flows. Expand automated coverage for those boundaries before production adaptation.

## Before any production adaptation

Treat deployment as a separate engineering project. At minimum, define and validate the threat model, authorization policy, secret handling, data classification, encryption and transport requirements, audit/retention requirements, backups and recovery, observability, incident response, and applicable legal/regulatory controls. Add automated tests for access boundaries and schedule concurrency. Obtain qualified security, privacy, and compliance review before introducing real personal or health information.


---

# Source document: `docs/workflows.md`

# MedOrch Workflows and Domain Rules

This document describes the intended/source-observed path across layers. The exact handler remains authoritative if a detail differs.

## 1. Sign-in and session validation

1. The login form submits credentials through Auth.js.
2. `src/auth.ts` validates credential types, normalizes the email, loads the user and verifies the password hash.
3. Patient accounts must have verified email; every account must be `ACTIVE`.
4. The JWT carries user ID, role, status and session version.
5. On subsequent JWT callback execution, the current database user is checked. Missing/inactive users or a mismatched session version invalidate the token/session.
6. Login/logout audit events are attempted; failures are logged and do not replace the auth result.

Related files: `src/auth.ts`, `src/lib/auth/password.ts`, `src/lib/auth/authorization.ts`, `src/lib/auth/permission.ts`, `src/modules/audit/`.

## 2. Patient registration and account recovery

- Registration: `POST /api/auth/register`.
- Email verification: `POST /api/auth/verify-email`; resend: `POST /api/auth/resend-verification`.
- Forgot password: `POST /api/auth/forgot-password`; reset: `POST /api/auth/reset-password`.
- Token models and throttling records are in Prisma (`EmailVerificationToken`, `PasswordResetToken`, `VerificationEmailRequest`).
- Email delivery depends on SMTP/Nodemailer environment configuration.
- Preserve generic responses where needed to avoid exposing whether an email/account exists. Keep token consumption one-time and atomic; add integration tests for concurrent reuse.

## 3. Create a schedule

1. UI: `src/components/schedules/SchedulePage.tsx` and `ScheduleForm.tsx` submit to `POST /api/schedules`.
2. Route: checks `schedules:create`, parses JSON, validates with `createScheduleSchema`.
3. Service: `createScheduleWithValidation` checks patient, active department, room existence/active/status/department, active doctor surgeon, and `endTime > startTime`.
4. Service conflict lookup checks room, surgeon and patient intervals and maps the conflict to a domain error.
5. Repository writes the schedule. PostgreSQL exclusion constraints independently prevent overlapping room/surgeon/patient bookings for non-cancelled/non-completed schedules.
6. Service records an audit event; API returns the standard success envelope.

Important: application-level pre-checks improve error messages but are not a substitute for database constraints under concurrency.

## 4. Update a schedule

`PATCH /api/schedules/{id}` validates the route ID and body, then calls `updateScheduleWithValidation`. The service loads the existing schedule, rejects edits to completed/cancelled schedules, merges omitted fields with persisted values for validation, revalidates the patient/department/room/surgeon and time range, checks conflicts excluding the current schedule, writes the update and records audit. The database may still reject a concurrent overlap; ensure route mapping translates known exclusion violations to `409`.

## 5. Change schedule status

1. `PATCH /api/schedules/{id}/status` validates requested status and permission.
2. `isScheduleStatusTransitionAllowed` validates the lifecycle map in `schedule-access.ts`.
3. The service passes the status it previously read to the repository conditional update.
4. If the stored status has changed concurrently, the update should fail rather than overwrite the newer state; the route should translate this into a conflict response.
5. Audit records the transition.

The conditional-update behavior still needs runtime integration verification against PostgreSQL according to the latest agent report.

## 6. Assign or remove staff

- GET/POST: `/api/schedules/{id}/staff`; DELETE: `/api/schedules/{id}/staff/{staffId}`.
- Assignment validates schedule and active user, then enforces account-role compatibility.
- `SURGEON` and `ANESTHETIST` assignments require a `DOCTOR` account with a `doctorProfile`; other staff roles require `OT_STAFF`.
- Deletion must scope the assignment by both its ID and the parent schedule ID so a mismatched parent does not delete another schedule's assignment.
- Assignment changes are audited.

## 7. Assign/release equipment

- GET/POST: `/api/schedules/{id}/equipment`; release/update: `/api/schedules/{id}/equipment/{equipmentId}`.
- Assignment requires an existing schedule and equipment in `AVAILABLE` state.
- Release must verify the assignment belongs to the requested schedule and has not already been released. Equipment should not become available if another active assignment still requires it.
- Database constraints and conditional writes should guard duplicate/concurrent assignment/release cases. Audit mutations.

## 8. Schedule notes

- GET/POST: `/api/schedules/{id}/notes`; PATCH/DELETE: `/api/schedules/{id}/notes/{noteId}`.
- Service checks that the note belongs to the schedule in the URL.
- Update/delete enforce note authorship as implemented.
- Role permission is controlled at the route boundary. Do not broaden reads or assume write permission implies read permission without a policy decision.
- OT staff responses should not expose notes when the OT response-redaction helper is required.

## 9. Role-specific schedule reads

- `/api/me/schedules`: doctor-specific schedules.
- `/api/me/staff-schedules`: assigned schedules for OT staff.
- `/api/me/appointments`: the signed-in patient's own appointments.
- OT staff individual schedule/staff/equipment reads are assignment-scoped in the current source; response redaction is intended to remove clinical notes, schedule notes and selected patient demographics.
- Check every alternate read path when adding fields or endpoints. UI hiding is not authorization; server routes must enforce access.

## 10. Alerts and audit

Alerts are user-scoped records with read/read-all and ownership-sensitive update/delete operations. Audit events are recorded by selected service mutations and Auth.js sign-in/sign-out events. Audit persistence exists, but sequential audit writes are not automatically atomic with the business write; decide which events require transactional guarantees before claiming a compliance-grade audit trail.


---

# Source document: `PROJECT_CONTEXT.md`

# MedOrch — AI Project Context

> **Purpose:** Fast, source-backed context for a coding assistant. Read this before proposing or changing code. The repository is the source of truth; this document is an index, not a substitute for inspecting the relevant implementation.
>
> **Snapshot reviewed:** `medorch-audit-fixed.zip`, 2026-10-19. This is an uploaded snapshot, not a live connection to the developer's working tree. Runtime checks were not executed as part of this documentation update.

## Product summary

MedOrch is a single-repository operating-theatre (OT) scheduling and resource-management application. It supports role-based access for administrators, doctors, OT staff, and patients; surgical schedules; patients and doctor profiles; departments; operating rooms; equipment; schedule staff/equipment assignments; schedule notes; alerts; audit records; email verification; and password recovery.

## Technology and runtime

- Next.js App Router (`next` 16.3.6), React 19, TypeScript.
- Auth.js / NextAuth v5 credentials provider with JWT sessions.
- PostgreSQL accessed through Prisma 7 and `@prisma/adapter-pg`.
- Zod validation; bcryptjs password hashing; Nodemailer email delivery.
- Tailwind CSS 4; ESLint 9; Prettier; Node's test runner with `tsx` for TypeScript tests.
- Local PostgreSQL is defined in `docker-compose.yml`; runtime database configuration is supplied through `DATABASE_URL`.
- There is no separate backend service in this repository. Pages, API handlers, domain services, and repositories run within the Next.js application.

## Start here

1. `PROJECT_STATUS.md` — current verified/reported state, blockers, and next step.
2. `docs/architecture.md` — layers and request/data flow.
3. `docs/file-index.md` — route, page, component, module, and test inventory.
4. `docs/workflows.md` — end-to-end domain workflows and rules.
5. `docs/api-reference.md` — endpoint inventory; always confirm exact current handler before changing it.
6. `docs/data-model.md` — Prisma entities and relationships.
7. `docs/security-and-limitations.md` — known controls and non-production boundaries.
8. `docs/ai-coding-workflow.md` — how to make changes without repeated audits or unverified claims.
9. `docs/roadmap.md` — ordered work phases and exit criteria.
10. `docs/decisions.md` — confirmed architectural facts and open policy decisions.

## Repository map

| Path | Responsibility |
|---|---|
| `src/app/` | App Router pages and API Route Handlers under `src/app/api/**/route.ts`. |
| `src/components/` | Interactive UI, layout, dashboards, schedule components, management interfaces, alerts and reusable UI primitives. |
| `src/modules/<domain>/` | Domain-specific validation, services and repositories. |
| `src/lib/api/` | API authorization adapter, shared response helpers, request IDs, body parsing and browser API client. |
| `src/lib/auth/` | Page guards, role/permission mapping, password, email-verification and reset-token helpers. |
| `src/lib/db/prisma.ts` | Server-side Prisma client configured with PostgreSQL adapter. |
| `src/auth.ts` | Auth.js credentials provider, JWT/session callbacks and login/logout audit events. |
| `src/generated/prisma/` | Generated Prisma client. Do not hand-edit. Regenerate through Prisma workflow. |
| `prisma/schema.prisma` | Canonical relational schema. |
| `prisma/migrations/` | Database schema history, including schedule overlap constraints and auth token/session changes. |
| `prisma/seed.ts` | Development seed data; inspect before running against any non-disposable database. |
| `prisma/demo-data.ts` | Demo-data helpers. |
| `tests/` | Permission, schedule constraint, input validation, schedule access and foundation validation tests. |
| `docs/` | Project and engineering documentation. |

## Domain modules

- `alerts`: user-scoped alerts, read state and alert validation.
- `audit`: audit event persistence and query behavior.
- `departments`: department records and active/deactivation behavior.
- `doctors`: doctor profiles and status management.
- `equipment`: equipment inventory and status changes.
- `ot-rooms`: operating-room inventory, active flag and status.
- `patients`: patient records and clinical fields.
- `schedules`: scheduling, conflict rules, status transitions, assignments, notes and schedule access/redaction helpers.
- `users`: account listing, approval and user-related operations.

Typical flow: page/client component → `/api/...` route handler → authorization + Zod validation → domain service → repository → Prisma/PostgreSQL. Some routes/services do not follow every layer identically, so inspect the exact path before making a change.

## Auth model

Roles: `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT`. User states: `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`.

`src/auth.ts` authenticates credentials, requires an active account, rejects unverified patient accounts, uses JWT sessions, and checks the persisted `sessionVersion`/account status in the JWT callback to invalidate stale sessions. Page guards are in `src/lib/auth/authorization.ts`; permission mapping is in `src/lib/auth/permission.ts`; API handlers generally call `authorizeApiPermission` from `src/lib/api/auth.ts`.

Do not assume a permission in `ROLE_PERMISSIONS` automatically gates a route: the route's actual authorization call is authoritative. Do not widen access or change clinical-data redaction without checking the route, permission map, product requirements, and tests.

## Scheduling rules to preserve

- Valid interval: `endTime > startTime`.
- Active/valid patient, department, OT room, and surgeon are checked in the service.
- Room must belong to the selected department and be active/usable.
- Surgeon must be an active user with the `DOCTOR` role.
- Room, surgeon, and patient overlapping intervals are guarded by PostgreSQL exclusion constraints in migration `20261010224215_schedule_overlap_constraints`; service-level conflict checks provide readable domain errors. Cancelled and completed schedules are excluded from those database constraints.
- Intervals use half-open `[startTime, endTime)` semantics, so adjacent bookings can meet at an endpoint.
- Allowed transitions are defined in `src/modules/schedules/schedule-access.ts`: `SCHEDULED → CONFIRMED|CANCELLED`; `CONFIRMED → IN_PROGRESS|DELAYED|CANCELLED`; `IN_PROGRESS → COMPLETED|DELAYED`; `DELAYED → CONFIRMED|IN_PROGRESS|CANCELLED`; terminal states have no outgoing transitions.
- The repository's status update receives the previously read status so a stale concurrent transition can be rejected rather than overwriting a newer state. DB-backed runtime verification is still an outstanding item from the latest reported test run.
- OT staff individual schedule access is assignment-scoped in the relevant routes. `redactScheduleDetailsForOT` removes clinical notes, schedule notes, and patient email/date-of-birth/gender from the response shape where applied. Confirm each handler uses the correct helper before extending an endpoint.
- Staff assignment requires active users and checks account-role compatibility: `SURGEON`/`ANESTHETIST` require a doctor with a doctor profile; other staff roles require `OT_STAFF`. This is not a complete clinical-qualification check.
- Schedule note update/delete enforce parent schedule matching and author ownership in the service.

## API response contract

Shared helpers are in `src/lib/api/response.ts`. Success shape: `{ success: true, data }`. Error shape: `{ success: false, message, details?, requestId? }`. Endpoint status mapping can differ; inspect the actual route. `getRequestId` reads `x-request-id` and otherwise generates a UUID.

## Commands

Use scripts from `package.json`; current relevant scripts include:

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run test:permissions`
- `npm run test:schedule-constraints`
- `node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts`
- `npx tsc --noEmit`
- `npx prisma validate`
- `npx prisma migrate status`

The schedule-constraint suite needs a configured `DATABASE_URL` and a test database. Do not point destructive or integration tests at a database containing important data. Do not claim a command passed unless its output was observed.

## Context freshness

This document describes the uploaded snapshot. If local code changes, update `PROJECT_STATUS.md` and relevant docs after verification. For exact code edits, read the current file first; never invent line numbers or assume the developer's local copy matches this archive.


---

# Source document: `PROJECT_STATUS.md`

# MedOrch — Project Status

> **Snapshot basis:** uploaded `medorch-audit-fixed.zip`, reviewed 2026-10-19. This is a source/documentation review, not a fresh runtime test run. Local files may have changed since the archive was created.

## Executive summary

MedOrch is an existing full-stack OT scheduling and resource-management application, not a greenfield project. The source includes authentication and account recovery, role/permission guards, CRUD-style APIs for core hospital resources, schedule lifecycle and assignment workflows, alerting, audit records, management pages, Prisma schema/migrations, and focused tests.

**Current focus:** establish a reliable source-of-truth and complete verification of recent authorization, data-redaction, schedule concurrency, and request-validation changes before beginning another large feature.

## What exists in source

| Area | Source-backed status | Evidence / notes |
|---|---|---|
| App foundation | Implemented | Next.js App Router, React, TypeScript, shared layout/loading/error/not-found components. |
| Authentication | Implemented | Auth.js credentials provider, bcrypt password verification, JWT sessions, account status checks and session-version invalidation. |
| Registration and account recovery | Implemented | Registration, email verification/resend, forgot-password and reset-password endpoints/pages; runtime mail delivery depends on environment configuration. |
| Role-based access | Implemented | `ROLE_PERMISSIONS`, page guards, API permission helper and route-specific permission checks. Must still be verified per endpoint. |
| Schedule core | Implemented in source | List/detail/create/update/status, conflict checks, PostgreSQL overlap constraints, status transition rules. |
| Schedule staffing | Implemented in source | List, assign and remove staff; assignment role compatibility checks. |
| Schedule equipment | Implemented in source | List, assign and release/update assignment. |
| Schedule notes | Implemented in source | List/create/update/delete with parent schedule and author checks in service. |
| Patient management | Backend and UI present | `/patients`, patient detail pages, patient APIs and service/repository. Verify complete workflows and field access. |
| Doctor management | Backend and UI present | `/doctors`, doctor detail pages, APIs and status route. Verify failure-path behavior. |
| Departments | Backend and management component present | API/service/repository and `DepartmentManagement` component; confirm route integration and full UX. |
| OT rooms | Backend and UI present | `/ot-rooms` and `OtRoomManagement`, API and service. |
| Equipment | Backend and UI present | `/equipment` and `EquipmentManagement`, API and service. |
| Users | Partial by design/implementation | User list page and APIs include list/detail/create/approval paths in the uploaded source; confirm allowed lifecycle and UI integration. |
| Alerts | Implemented in source | User-scoped API, alert center, read/read-all and dashboard summary. Confirm trigger behavior and ownership cases. |
| Audit | Implemented in source | Audit repository/service, protected query API, audit page/viewer and auth events. Audit write atomicity/coverage remains a design question. |
| Test coverage | Present but not comprehensive | Five test files: request validation, foundation validation, permissions, schedule access and schedule constraints. Not equivalent to complete integration coverage. |
| Documentation | Present but stale/inconsistent | Older status/context documents contradict the current route/page inventory. This pack establishes a reconciled baseline. |
| Production readiness | Not established | No evidence here of full production deployment validation, backup/recovery drills, compliance assessment or end-to-end browser testing. Use synthetic data only. |

## Latest reported verification (from the coding agent report supplied in chat)

These are **reported results**, not commands rerun during this documentation task:

| Check | Reported result |
|---|---|
| `node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts` | PASS — 14 tests reported |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |
| `npm run test:schedule-constraints` | BLOCKED — suite stopped at `DATABASE_URL` assertion; database checks did not run |

The report specifically states that PostgreSQL runtime verification of conditional concurrent status updates remains outstanding. These reported checks may refer to code newer than the uploaded ZIP; compare current local changes before treating them as the same revision.

## Known open items / not yet proven

1. Configure a **disposable test PostgreSQL database** and run the schedule overlap constraint suite. Do not use a database containing important data.
2. Add or run integration tests for concurrent schedule status updates against PostgreSQL, including the conditional update returning conflict when the row's status changed after the read.
3. Verify OT_STAFF access/redaction across individual schedule, staff, equipment and note-related endpoints; confirm no alternate endpoint returns equivalent protected data.
4. Exercise role/ownership boundaries for user, patient, doctor, alert, staff assignment and schedule mutation endpoints.
5. Verify all public account-recovery routes' malformed JSON, throttling, generic responses, and token one-time-use behavior.
6. Decide and document policy questions around login/registration throttling, audit event coverage/transactionality, and exact data OT staff should see.
7. Run end-to-end UI workflows and a production readiness review after API verification.

## Current phase

**Phase: Source-of-truth and API/security verification.** Do not mark complete until the database-backed constraint/concurrency checks have actually run and remaining authorization/data-exposure questions have explicit outcomes.

## Immediate next task

Set up an isolated PostgreSQL test database using the existing Compose/migration configuration, set `DATABASE_URL` for that database, and run:

```powershell
npm run test:schedule-constraints
```

Then add/run an integration test for conditional schedule-status updates. Record exact command output and update this file. Do not apply migrations or destructive tests to a valuable development database.

## Definition of done for this phase

- Focused unit tests, typecheck, lint and build pass on the same code revision.
- Schedule overlap database tests pass against a disposable PostgreSQL database.
- Concurrent status-update behavior is verified against PostgreSQL.
- Role-specific read access and sensitive-field redaction are tested at route/service boundary where feasible.
- Remaining security-policy questions are decided or explicitly accepted as out of scope.
- This document reflects actual observed results, with the next task stated in one sentence.
