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
