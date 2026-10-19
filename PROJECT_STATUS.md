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
