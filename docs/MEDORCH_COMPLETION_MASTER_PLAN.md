# MedOrch Completion Master Plan

**Status:** `IN_PROGRESS` — Phase 6 (complete UI overhaul) underway: batch 1 (design system, fonts, shared primitives, app shell) complete with all checks green. Phase 5 live API authorization and isolation tests remain complete and intact: 13 route-level runtime tests covering all four roles plus unauthenticated requests passed over live HTTP against a production build and a disposable seeded database; no new runtime defects found. Account-lifecycle (Phase B) verification remains outstanding.
**Last audited:** 2026-10-24 (Phase 5 — live API authorization and isolation tests)
**Last updated:** 2026-10-25 (Phase 6 batch 1 — UI design system + shared shell)
**Repository:** `byteforge62/medorch`
**Branch:** `master`
**Working tree at audit start:** clean (Phase 3 work committed in `00ae18e`)
**Current phase:** Phase 6 batch 1 — UI design system + shared shell (tokens, Fira fonts via `next/font`, restyled primitives, light app shell, on-token header `AlertCenter`); Phase 5's runtime verification remains complete with no regressions.
**Next task:** Phase 6 batch 3 — ADMIN surfaces (users, departments, patients, doctors, OT rooms, equipment, audit + admin dashboard widgets); then batches 4–6 (schedules+DOCTOR, OT_STAFF+PATIENT, responsive/a11y polish + full verification). Security-track follow-ups (Phase B account-lifecycle tests, remaining Phase H abuse probes) stay in the backlog unchanged.

This document is the working source of truth for project completion. A `VERIFIED` status describes only the evidence written beside that item; source inspection does not prove runtime behavior. Use synthetic data only. Never point a database test or migration at a valuable development or production database.

## Status key

- `NOT_STARTED` — not yet performed.
- `IN_PROGRESS` — being worked on.
- `BLOCKED` — cannot proceed; the blocker is stated.
- `VERIFIED` — completed with explicit source, command, test, or observed-workflow evidence.
- `ACCEPTED_GAP` — explicitly accepted as a limitation; record who/when and why before using this status.

## Overall status

- [ ] `IN_PROGRESS` — Phase A source inventory and available non-database checks are recorded below. Evidence: current source tree inspection and the command results in [Baseline command log](#baseline-command-log).
- [ ] `IN_PROGRESS` — Complete runtime authorization, ownership, account lifecycle, and data-redaction verification. Phase 5 (2026-10-24) verified route-level authorization, ownership, isolation, and redaction for all four roles over live HTTP on a disposable database; account-lifecycle (tokens, expiry, replay, session invalidation, throttling) remains. Evidence: [Phase 5](#phase-5--live-api-authorization-and-isolation-tests-2026-10-24).
- [x] `VERIFIED` — Complete role-specific browser workflows. All four roles (Admin, Doctor, OT_STAFF, PATIENT) now have executed browser acceptance evidence in Phase J; cross-role direct-access, console/network, and responsive checks are done. Release-readiness review (deployment/CI/production) remains open.
- [ ] `NOT_STARTED` — Resolve the policy decisions and either implement or explicitly accept each confirmed gap.

## Phase checklist

### Phase A — Repository baseline and complete inventory

- [x] `VERIFIED` — Confirmed current branch and clean worktree before implementation. Evidence: `git status --short --branch` returned only `## agents/pasted-text-processing-476ac5f7`; no user changes were present.
- [x] `VERIFIED` — Inventory of rendered page files, API handler files, domain modules, tests, migrations, and shared components recorded below. Evidence: current `src/app`, `src/components`, `src/modules`, `tests`, and `prisma/migrations` tree plus successful Next build route listing.
- [x] `VERIFIED` — Enumerated all 40 API route-handler files and their 61 declared HTTP methods in [API inventory](#api-inventory). Evidence: route export and guard inspection; successful build lists the implemented paths.
- [x] `VERIFIED` — Recorded frontend request consumers found by source search and flagged backend endpoints with no direct UI caller in [API inventory](#api-inventory). Evidence: `apiClient`/endpoint search under `src`.
- [x] `VERIFIED` — Documented current role permission map and the material API-reference mismatch under [Role matrix](#role-by-role-permissions-and-workflows) and [Product decisions](#product-decisions-needed). Evidence: `src/lib/auth/permission.ts`, affected route guards, and `docs/api-reference.md`.
- [x] `VERIFIED` — Ran safe baseline checks after restoring the locked dependencies. Evidence: TypeScript, lint, 15 focused tests, production build, and Prisma schema validation passed; see exact results below.
- [x] `VERIFIED` — Confirmed database-backed tests require `DATABASE_URL`; no `.env` or Compose service is configured. Database tests were subsequently run against a separate disposable PostgreSQL container; the unrelated `medorch-postgres` container was not used or modified.
- [ ] `NOT_STARTED` — Complete source-level audit of every page's guard, navigation reachability, request payload/response types, and loading/error/empty/mutation states.
- [ ] `NOT_STARTED` — Complete method-by-method API contract review for ownership/redaction and test coverage; the inventory below is a route map, not proof of runtime authorization.
- [ ] `NOT_STARTED` — Identify all genuine missing integrations, dead controls, and placeholder flows through targeted UI and browser review.

### Phase B — Authentication and account lifecycle

- [x] `VERIFIED` — Sign-in for all four roles (Admin, Doctor, OT_STAFF, and — after the Phase 3 development-only seed flag — PATIENT), sign-out, protected-page redirect to `/login` while signed out, structured 401 on unauthenticated API reads, and the unverified-patient restriction were exercised in a real browser. The unverified-patient rejection renders an accessible inline message (`role="alert"`, `aria-live="polite"`). JWT/session-version invalidation and pending/suspended/rejected account states remain untested.
- [ ] `NOT_STARTED` — Exercise patient registration, email verification, resend, forgot-password, and reset-password success and failure cases.
- [ ] `NOT_STARTED` — Verify expiry, malformed/reused/revoked tokens, atomic single-use, generic responses, throttling, and SMTP failure behavior.
- [ ] `NOT_STARTED` — Reconcile the available `POST /api/users` provisioning API with the `/users` UI and approve a role/account lifecycle. Do not add provisioning controls until the safe workflow is decided.
- [ ] `NOT_STARTED` — Test duplicate emails, invalid role/account states, unverified pending patients, approval, suspended/rejected accounts, and unauthorized access.

### Phase C — Admin workflows

- [ ] `NOT_STARTED` — Verify dashboard values, data source, links, loading/error/empty states, and refresh behavior.
- [ ] `NOT_STARTED` — Verify user list, supported patient approval, and whether admin provisioning should be added.
- [ ] `NOT_STARTED` — Verify department list/search/filter/create/edit/deactivate/delete behavior and dependency errors.
- [ ] `NOT_STARTED` — Verify patient list/detail/create/edit, field-level privacy, required inputs, lifecycle links, and invalid/not-found IDs.
- [ ] `NOT_STARTED` — Verify doctor list/detail/create/edit/status, profile/department relationships, and failure feedback.
- [ ] `NOT_STARTED` — Verify room create/edit/status/active controls, unique codes, capacity, department, and schedule availability rules.
- [ ] `NOT_STARTED` — Verify equipment create/edit/status and maintenance/department/identifier rules; ensure assigned equipment cannot be placed in contradictory states.
- [ ] `NOT_STARTED` — Verify schedule create/edit/lifecycle, overlap/conflict feedback, stale updates, staffing, equipment, notes, and redaction.
- [ ] `NOT_STARTED` — Verify alert ownership/read state/trigger coverage and audit filtering/order/pagination/sensitive-field behavior.

### Phase D — Doctor workflows

- [ ] `NOT_STARTED` — Verify doctor dashboard and schedule/department/room/equipment visibility.
- [x] `VERIFIED` — User approved the existing policy: Doctors may update and transition any schedule. Evidence: user selection on 2026-10-21; existing `schedules:manage` map, route guards, Doctor UI controls, and passing permission tests; `docs/api-reference.md` and `docs/decisions.md` reconciled.
- [ ] `NOT_STARTED` — Verify direct API behavior for Doctor schedule mutations and conflicts. The current permission unit test does not exercise the Route Handler.
- [ ] `NOT_STARTED` — Verify patient directory/detail permissions, schedule-note author rules, alert ownership, and forbidden admin operations.

### Phase E — OT_STAFF workflows

- [x] `VERIFIED` — `/api/me/staff-schedules` returned 7 assignment-derived schedules while `/api/schedules` returned the same 7 for OT_STAFF (11 for ADMIN/DOCTOR), and the dashboard renders exactly those 7. Evidence: live browser session as `kavya.nurse@demo.medorch.local`.
- [x] `VERIFIED` — Individual schedule read is assignment-scoped: an assigned schedule returned 200, an unassigned schedule returned 404 `Schedule not found.` (non-disclosing). OT_STAFF detail response nulls `clinicalNotes` and omits patient `email`, `dateOfBirth`, and `gender`; the list cards show no clinical-notes block. OPEN: schedule-note (`notes`) redaction was not observed on a schedule that actually had notes, so that path is still unconfirmed.
- [x] `VERIFIED` — UI exposes only `View details` (no Edit, no status actions, no Create Schedule) on the schedule list, and the detail page renders zero action buttons and no note textarea. Direct API attempts as OT_STAFF: `PATCH .../status` 403, `POST .../notes` 403, `POST .../staff` 403; `GET /api/patients`, `/api/users`, `/api/audit` all 403.
- [ ] `NOT_STARTED` — Verify alerts and errors do not reveal protected data.

### Phase F — PATIENT workflows

- [x] `VERIFIED` — Patient dashboard, appointment list/detail, alerts polling, and empty states exercised in a real browser on a disposable database (Phase 3): login redirects to `/dashboard`; the dashboard shows only the patient's own appointment with metrics (Total 1 / Upcoming 0 / Completed 1) and the "No upcoming appointments" empty state; `/patients/appointments` and `/patients/appointments/{id}` render the own appointment with no errors or overflow. `AlertCenter` polled `/api/alerts` with 200 as PATIENT (service-level own-scoping covered by `tests/privacy-boundary.test.ts`); the alert widget panel itself was not opened.
- [x] `VERIFIED` — Cross-patient exposure tested in the browser as `aarav.mehta@demo.medorch.local` against a disposable seeded database: direct URL to another patient's appointment (`819d8339-…`) renders "Appointment not found — This appointment is not associated with your patient record, or it no longer exists." with zero foreign data (no procedure, patient name, or patient code); a malformed non-UUID id renders the same graceful state without crashing; `/api/schedules/{foreign-id}` and `/api/schedules/{own-id}` both return 403 for PATIENT (all schedule records are reachable only through `/api/me/appointments`, which returned the patient's own record); `/api/patients`, `/api/users`, `/api/audit`, `/api/me/schedules`, `/api/me/staff-schedules` all 403.
- [x] `VERIFIED` — PATIENT navigation exposes only Dashboard and My Appointments (no administrative links), and every administrative API probed returned 403. The direct-URL redirect to `/unauthorized` for admin pages was exercised for DOCTOR in Phase 2; the guard is shared, but it was not re-run for PATIENT specifically.
- [x] `VERIFIED` — No booking, cancellation, or rescheduling controls exist anywhere in the patient surfaces (dashboard, appointment list, appointment detail) because no such API contract is established; nothing was added in this phase.

### Phase G — UI quality and API contract integration

- [ ] `NOT_STARTED` — Verify every consumer uses the correct shared API client, method, payload, response shape, and user-facing error convention.
- [ ] `NOT_STARTED` — Verify duplicate-submit prevention, pending states, post-mutation refresh/partial-failure handling, and no success-shaped local state before server success.
- [ ] `NOT_STARTED` — Verify meaningful loading, retry, error, and empty states on all pages and mutation surfaces.
- [x] `VERIFIED` — Labels, responsive layouts, and role-aware navigation verified in the browser across all four roles (duplicate accessible names and toggle state fixed in this phase — see the findings list; 375px and 1440px checked with no document overflow). Keyboard-only traversal beyond drawer/Escape handling and explicit nested-route sweep remain open.
- [ ] `NOT_STARTED` — Remove or correct only confirmed misleading, dead, or unsupported controls.

### Phase H — Security and backend contract verification

- [x] `VERIFIED` — Compare page guards, role map, every handler guard, and service-level ownership checks. Phase 4 source audit (2026-10-24): all 40 route handlers / 61 methods enumerated with their guard calls; every non-public handler calls `authorizeApiPermission` (or `authorizeApiSession` via the injected `/me` handlers) before any service work; permission strings compared against `ROLE_PERMISSIONS` (exact match, no prefix semantics); service ownership checks re-read for alerts, schedule notes, patient portal, and schedule assignment. Evidence: [Phase 4 audit](#phase-4--api-authorization-and-security-audit-2026-10-24).
- [x] `VERIFIED` — Test direct unauthorized API access, manipulated IDs, and ownership boundaries for all roles. Phase 5 (2026-10-24): `tests/runtime-authorization.test.ts` (13 tests, `npm run test:runtime`) authenticated ADMIN, DOCTOR, OT_STAFF, and two PATIENT accounts through the real NextAuth credentials flow and probed a live `next start` server backed by a disposable seeded database. Covered: 401 across 12 protected endpoints when unauthenticated; per-role 403 matrices; PATIENT cross-account isolation for appointments and alerts (foreign alert read/update/delete 403); OT_STAFF assignment scoping (list/detail/staff/equipment) with non-disclosing 404s; patient-field redaction including `phone`; admin-only mutations and audit access; schedule transitions (200 valid / 409 invalid); unknown and malformed resource IDs (404/400). Evidence: [Phase 5](#phase-5--live-api-authorization-and-isolation-tests-2026-10-24).
- [x] `VERIFIED` — Verify OT_STAFF assignment checks/redaction and PATIENT record/appointment ownership on every related read path. Phase 4 source audit: OT_STAFF list, detail, `staff` GET, `equipment` GET are assignment-scoped (detail/sub-resources return a non-disclosing 404 when unassigned); `notes` endpoints deny OT_STAFF (403, no `schedules:notes:manage`); `me/staff-schedules` is role-restricted and assignment-derived; PATIENT reaches schedules only via `me/appointments` (`schedules:read` gate returns 403; `schedules:read:own` is satisfied only by that handler and the appointment pages). One redaction gap found and fixed: `patient.phone` on schedule detail. Evidence: [Phase 4 audit](#phase-4--api-authorization-and-security-audit-2026-10-24) and `tests/schedule-access.test.ts`.
- [ ] `IN_PROGRESS` — Verify ADMIN-only mutations, Doctor-specific permissions, malformed JSON, invalid identifiers, missing/wrong/oversized fields, and invalid enum values. Phase 5 runtime probes confirmed ADMIN-only mutations (department create/soft-delete, user approval gating), DOCTOR permission boundaries, identifier abuse (unknown ids → 404, malformed UUIDs → 400), and invalid status transitions (409) over live HTTP. Malformed-JSON bodies, missing/oversized fields, and invalid enum values were not exercised at runtime and remain open.
- [ ] `NOT_STARTED` — Verify domain/Prisma errors map to correct HTTP codes, rate limits/token expiry/replay protection work, and secrets are not committed.
- [ ] `NOT_STARTED` — Review audit coverage and transactionality against an explicit policy.
- [x] `VERIFIED` — Database-backed schedule/assignment/audit and targeted privacy-scope tests ran on separate ephemeral PostgreSQL containers; the running `medorch-postgres` container was not used. Evidence: latest `npm run test:database` passed 30 tests.

### Phase I — Automated testing

- [x] `VERIFIED` — Safe focused unit tests currently pass: 15 tests across request parsing, validation, permissions, schedule transitions, schedule read access, and redaction. Evidence: exact command and TAP result below.
- [ ] `NOT_STARTED` — Add regression coverage for each confirmed defect and missing integration.
- [ ] `NOT_STARTED` — Add/execute route tests for account lifecycle, direct ownership, alert access, malformed input, and role restrictions.
- [x] `VERIFIED` — Run the database-backed schedule/assignment/audit and privacy-boundary tests on a confirmed disposable database. Evidence: `npm run test:database`, 30 tests passed.
- [x] `VERIFIED` — Verify the conditional schedule-status update through `schedule.repository.updateScheduleStatus`; concurrent test asserts one winner, one conflict, and audit behavior.
- [ ] `NOT_STARTED` — Add component/browser tests only where the existing harness and confirmed gaps justify them; do not introduce tooling without need.

### Phase J — End-to-end role acceptance

- [x] `VERIFIED` — Admin acceptance executed in the browser: dashboard, departments, patients, doctors, OT rooms, equipment, schedules, schedule detail, users, and audit all render without console/network errors or horizontal overflow. Exercised end-to-end: create user (duplicate email surfaces the API 409; success increments the list), schedule create (Phase-G payload fix confirmed live), schedule note create via the UI form, and schedule status transition with its confirmation dialog.
- [x] `VERIFIED` — Doctor acceptance executed in the browser: dashboard is scoped to `/api/me/schedules` (2 records), `+ Create Schedule` is correctly hidden (ADMIN-only), Edit and status controls are present per the approved any-schedule policy, and a live `PATCH /api/schedules/{id}/status` transitioned a schedule SCHEDULED → CONFIRMED. `/users` and `/audit` redirect to `/unauthorized` and their APIs return 403. Reads of all schedules/patients match the documented `schedules:read`/`patients:read` policy.
- [x] `VERIFIED` — OT_STAFF assignment/redaction acceptance executed in the browser; see Phase E for the scoping, redaction, and 403/404 evidence. Only the schedule-note redaction path remains open (no populated schedule observed for this role).
- [x] `VERIFIED` — PATIENT acceptance executed in the browser (Phase 3) using a development-only verified seed account on a disposable isolated database: login and redirect, dashboard, appointment list/detail, empty/not-found states, mobile (375px) and desktop (1440px) layouts with no overflow, cross-patient direct access blocked with no data leak, and unauthenticated page/API handling (redirect to `/login`; structured 401s). Setup and evidence: see [Patient acceptance — development-only setup](#patient-acceptance--development-only-setup).
- [x] `VERIFIED` — Cross-role navigation and direct access: sidebar links are role-filtered for all four roles; direct URLs to admin surfaces redirect to `/unauthorized`; unauthenticated API reads return structured 401 and protected pages redirect to `/login`. Responsive: at 375px the dashboard, patients, audit, users, schedules, and departments pages produce no document-level horizontal overflow (wide tables scroll inside `overflow-x:auto` wrappers) and the mobile drawer opens/closes with a scrim. Console/network: clean after reload; the only errors observed were `ERR_NETWORK_IO_SUSPENDED` artifacts of interrupted sessions, and `/api/alerts` polling measured a correct 30s interval (not a runaway loop).

### Phase K — Documentation and release readiness

- [ ] `NOT_STARTED` — Reconcile `PROJECT_CONTEXT.md`, `PROJECT_STATUS.md`, API reference, roadmap, and file index with current source and observed behavior.
- [ ] `NOT_STARTED` — Document environment variable names and setup without publishing secret values; verify migrations and seed data are safe and synthetic.
- [ ] `NOT_STARTED` — Verify clean setup, required migrations, deterministic demo data, and local-only demo account handling.
- [ ] `NOT_STARTED` — Run final typecheck, lint, all safe tests, DB tests on disposable DB, Prisma validation, production build, and `git diff --check`.
- [ ] `NOT_STARTED` — Review CI, deployment environment, HTTPS/cookies, DB connectivity, logging/monitoring, backups/recovery, privacy boundaries, and limitations.
- [ ] `NOT_STARTED` — Prepare a short role-by-role demo walkthrough; do not describe a successful build as production certification.

### Phase 4 — API authorization and security audit (2026-10-24)

Source-level audit of every API route handler against the role map, service ownership checks, and redaction helpers. No route handler, service, repository, schema, migration, permission rule, or auth policy was changed; the only production-code change is the redaction fix below. Worktree was clean at start (Phase 3 committed in `00ae18e`); nothing was committed or pushed.

**Inventory method:** all 40 `route.ts` files / 61 HTTP methods under `src/app/api` were enumerated mechanically with their exported methods and `authorizeApiPermission`/`authorizeApiSession` guard arguments, then every guard string was resolved through `ROLE_PERMISSIONS`. Public by design: the five `auth/*` endpoints and the Auth.js catch-all. Every other handler guards before any service work. Permission matching is exact-string (`permissions.includes`), so PATIENT's `schedules:read:own` never satisfies `schedules:read`, and a missing `session.user.role` fails closed (403).

**Boundaries verified (evidence: the named handler/service/test files, not route existence):**

| Boundary | Result |
|---|---|
| Unauthenticated access | Every non-public handler returns 401 before touching a service; no handler skips the guard (mechanical enumeration + per-handler reads). |
| PATIENT cross-record access | PATIENT holds only `schedules:read:own`, `alerts:read`, `alerts:update:own`, `alerts:delete:own`. All schedule endpoints require `schedules:read` → 403. `me/appointments` resolves data via session user id only (`handlePatientAppointments` + `getPatientPortalData`; covered by `tests/me-read-handlers.test.ts` and `tests/privacy-boundary.test.ts`). Alerts service forces `userId = requester` for non-admins on the list and checks ownership on get/update/mark-read/read-all/delete. |
| OT_STAFF scoping | List is assignment-derived with `clinicalNotes` nulled; detail, `staff` GET, and `equipment` GET apply `canReadIndividualSchedule` + non-disclosing 404; `notes` GET/POST/PATCH/DELETE deny OT_STAFF (no `schedules:notes:manage`); `me/staff-schedules` is role-restricted (`['OT_STAFF']`) and assignment-derived; `me/schedules` has an explicit DOCTOR role check so OT_STAFF cannot reach the surgeon view. |
| DOCTOR boundaries | Per approved policy, may read and transition any schedule; cannot create schedules, assign staff/equipment, or manage users/rooms/equipment/departments/doctor profiles (no matching permission in the map; `tests/permissions.test.ts` asserts the map). |
| ADMIN-only mutations | `users:manage`, `departments/doctors/ot-rooms/equipment:manage`, `patients:manage`, `schedules:create/staff:manage/equipment:manage`, `audit:read` verified handler-by-handler against the role map. |
| IDOR via client-supplied IDs | Alert recipient/owner ids overridden or checked in the service; note mutations validate parent schedule + author (`SCHEDULE_NOTE_FORBIDDEN` → 403); `createdById` is server-set from the session; approve/user-detail ids are admin-gated; patient portal keyed strictly by session user id. |
| Status/state transitions | `updateScheduleSchema` contains no `status` field; `updateScheduleStatusSchema` is status-only and the service enforces `ALLOWED_STATUS_TRANSITIONS` with compare-and-set (concurrency-tested). |
| Sensitive fields | `passwordHash` appears in no repository `select` (searched); registration schema has no role/status field and the service forces PATIENT/PENDING/unverified (verification not weakened); `medicalHistory` is not selected by any schedule read; audit endpoint is ADMIN-only. |
| Validation gaps | No gap found that permits an invalid or unauthorized state transition. |

**Confirmed defect (fixed):** `GET /api/schedules/{id}` leaked `patient.phone` to OT_STAFF — see [Confirmed defects](#confirmed-defects--documentation-mismatches). Regression test added in `tests/schedule-access.test.ts`.

**Design questions (documented, not changed):** the minimum OT_STAFF patient-field set remains an open product decision — this phase aligned the detail endpoint with the already-tested list minimum (`name` + `patientCode`, asserted by `tests/privacy-boundary.test.ts`) and left `name`/`patientCode` visible; `GET /api/doctors` exposes doctor office-contact details to OT_STAFF (professional directory, not patient data); DOCTOR cannot create schedules under the current map; `POST /api/alerts` has no UI consumer.

**Remaining risks after Phase 4:** no route-level runtime authorization tests (guard wiring proven at source, not over live HTTP); no rate limiting on auth endpoints (Phase B scope); no CSRF-specific tests beyond Auth.js defaults; session/JWT invalidation and account-state rejection untested; `tests/patient-approval-concurrency.test.ts` still unwired to any package script; dependency advisories unreviewed.

### Phase 5 — Live API authorization and isolation tests (2026-10-24)

Runtime verification of the Phase 4 source audit. A new route-level suite (`tests/runtime-authorization.test.ts`, `npm run test:runtime`) sends real HTTP requests against a production server (`next start` on a random loopback port) backed by a disposable, seeded PostgreSQL database. Sessions are obtained through the real NextAuth credentials flow (CSRF fetch + credentials callback) for ADMIN, DOCTOR, OT_STAFF, and two PATIENT accounts — no bypass, no test-only endpoint, no weakened policy. No route handler, service, repository, schema, migration, permission rule, or auth policy was changed, and **no new runtime defect was found**: every observed response matched the policy documented in Phase 4.

**Infrastructure:** disposable Docker container `medorch-phase5-b3f71d29` (tmpfs data, loopback-only `127.0.0.1:6631`), databases `medorch_runtime_test_b3f71d29` (runtime suite, seeded with `SEED_VERIFIED_PATIENTS=1`) and `medorch_alerts_test_b3f71d29` (database suite). The suite itself asserts `DATABASE_URL` names a local `medorch_runtime_test_*` database and that a current production build exists. The primary development container, its database, and all pre-existing containers/volumes were never touched; the container and its two databases are removed during phase cleanup and `docker ps -a` is re-verified.

**Result: 13 tests, 0 failures (final run).** Expected values were derived from `ROLE_PERMISSIONS`, the route handlers, and the service-level ownership checks — none were invented to fit the app.

| # | Test | Boundary exercised (expected → actual) |
|---|---|---|
| 1 | Unauthenticated 401s | 12 endpoints (schedules, users, audit, alerts, patients, departments, `me/appointments`, `me/staff-schedules`, schedule detail, status PATCH, department POST, alert POST): 401 + `success:false` + `Unauthorized` everywhere |
| 2 | ADMIN reads | `/api/schedules`, `/users`, `/patients`, `/departments`, `/alerts` → 200; `/api/audit` → 200 with `items` + `pagination` |
| 3 | ADMIN department lifecycle | POST → 200; created record visible to an OT_STAFF reader → 200; DELETE → 200 soft-delete (`isActive:false`) and the record stays listed |
| 4 | DOCTOR boundaries | 5 permitted reads → 200; `/audit`, `/users`, schedule create, user approve → 403 |
| 5 | DOCTOR transitions | SCHEDULED → COMPLETED → 409 `Invalid schedule status transition.`; SCHEDULED → CONFIRMED → 200 |
| 6 | OT list scoping | only assignment-derived schedules; `clinicalNotes` null on every row |
| 7 | OT detail redaction | assigned → 200 with `clinicalNotes` and patient `email`/`phone`/`dateOfBirth`/`gender` all null (name + patientCode kept); unassigned detail and `staff`/`equipment` sub-resources → non-disclosing 404 |
| 8 | OT 403 matrix | 11 forbidden surfaces (patients, users, audit, patient detail, `me/schedules`, notes read, schedule create, status change, note create, staff assign, user approve) → 403; 6 permitted reads → 200; `/me/schedules` carries the documented doctor-only message |
| 9 | PATIENT portal isolation | each patient's `/me/appointments` returns only their own record; the other patient's name appears nowhere in the response body (and vice versa) |
| 10 | PATIENT 403 matrix | 12 non-owned reads/mutations → 403 |
| 11 | PATIENT alert ownership | own list shows the targeted alert, the foreign list does not; foreign GET/PATCH/DELETE → 403 with the documented messages; owner PATCH → 200 |
| 12 | ID manipulation | unknown schedule id (ADMIN and OT_STAFF) → 404 `Schedule not found.`; malformed UUID → 400; status PATCH on unknown id → 404; unknown alert id → 404; malformed user id → 400 |
| 13 | ADMIN approval gate | ADMIN reaches the approval service (409 `Only patient accounts can be approved.` on a DOCTOR id); DOCTOR/OT_STAFF/PATIENT → 403 |

**Endpoints actually exercised over HTTP:** the `auth/*` login flow (`/api/auth/csrf`, `/api/auth/callback/credentials`), `GET|POST /api/schedules`, `GET|PATCH /api/schedules/{id}`, `PATCH /api/schedules/{id}/status`, `GET /api/schedules/{id}/staff`, `GET /api/schedules/{id}/equipment`, `GET|POST /api/schedules/{id}/notes`, `GET /api/me/schedules`, `GET /api/me/staff-schedules`, `GET /api/me/appointments`, `GET /api/users`, `POST /api/users/{id}/approve`, `GET /api/patients`, `GET /api/patients/{id}`, `GET|POST /api/departments`, `DELETE /api/departments/{id}`, `GET /api/audit`, `GET|POST /api/alerts`, `GET|PATCH|DELETE /api/alerts/{id}`, `GET /api/ot-rooms`, `GET /api/equipment`, `GET /api/doctors`, `GET /login`.

**Not exercised over HTTP (no runtime claim made):** malformed/oversized/missing-field JSON bodies, invalid enum values at the wire, note PATCH/DELETE mutations, staff/equipment assignment mutations, doctors/ot-rooms/equipment management mutations, `PATCH /api/patients/{id}`, user status changes, `GET /api/alerts/read-all`, and the register/verify/reset/throttle flows (Phase B scope).

## Repository inventory

### Application pages and route guards

Page-file inventory: 22 `page.tsx` files. Route groups do not alter the public URL.

| UI route | Page / principal consumer | Guard observed in page source | Source inventory status |
|---|---|---|---|
| `/` | `src/app/page.tsx` landing page | Public | `VERIFIED` — page exists. |
| `/dashboard` | `src/app/dashboard/page.tsx`; role dashboard components | `requireAuth()`; dashboard selects role view | `VERIFIED` — page and guard observed. |
| `/login` | `src/app/login/page.tsx`, `LoginForm` | Public | `VERIFIED` — page exists. |
| `/register` | `src/app/register/page.tsx` | Public | `VERIFIED` — page exists. |
| `/verify-email` | `src/app/verify-email/page.tsx` | Public | `VERIFIED` — page exists. |
| `/resend-verification` | `src/app/resend-verification/page.tsx` | Public | `VERIFIED` — page exists. |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Public | `VERIFIED` — page exists. |
| `/reset-password` | `src/app/reset-password/page.tsx` | Public | `VERIFIED` — page exists. |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | Public denial destination | `VERIFIED` — page exists. |
| `/departments` | `src/app/departments/page.tsx`, `DepartmentManagement` | `departments:read` | `VERIFIED` — exists and is linked; absent from the older `docs/file-index.md` page table. |
| `/schedules` | `src/app/schedules/page.tsx`, `SchedulePage` | Authenticated page; role-specific actions must be tested | `VERIFIED` — page exists and is linked. |
| `/schedules/[id]` | `src/app/schedules/[id]/page.tsx`, `ScheduleDetails` | `requireRole(['ADMIN','DOCTOR','OT_STAFF'])` | `VERIFIED` — page and guard observed. |
| `/patients` | `src/app/patients/page.tsx`, `PatientRegistry` | `patients:read` | `VERIFIED` — page and guard observed. |
| `/patients/[id]` | `src/app/patients/[id]/page.tsx`, `PatientDetail` | `patients:clinical:read` | `VERIFIED` — page and guard observed. |
| `/patients/appointments` | `src/app/patients/appointments/page.tsx`, `MyAppointments` | `schedules:read:own` | `VERIFIED` — page and guard observed. |
| `/patients/appointments/[id]` | appointment detail page/component | `schedules:read:own` | `VERIFIED` — page and guard observed; detail fetches the own-appointments endpoint. |
| `/doctors` | `src/app/doctors/page.tsx`, `DoctorDirectory` | `doctors:read` | `VERIFIED` — page and guard observed. |
| `/doctors/[id]` | `src/app/doctors/[id]/page.tsx`, `DoctorDetail` | `doctors:read` | `VERIFIED` — page and guard observed. |
| `/ot-rooms` | `src/app/ot-rooms/page.tsx`, `OtRoomManagement` | `requireRole(['ADMIN','DOCTOR','OT_STAFF'])` | `VERIFIED` — page and guard observed. |
| `/equipment` | `src/app/equipment/page.tsx`, `EquipmentManagement` | `requireRole(['ADMIN','DOCTOR','OT_STAFF'])` | `VERIFIED` — page and guard observed. |
| `/users` | `src/app/(dashboard)/users/page.tsx`, `UserList` | `requireRole('ADMIN')` | `VERIFIED` — page and guard observed. |
| `/audit` | `src/app/(dashboard)/audit/page.tsx`, `AuditLogViewer` | Admin-only role guard | `VERIFIED` — page and guard observed. |

The public sidebar links to dashboard, schedules, departments, patients, doctors, equipment, OT rooms, patient appointments, users, and audit; visibility is role-filtered in `Sidebar.tsx`. Dynamic detail pages are reached from their parent lists/details rather than top-level navigation. Route reachability and authorization behavior still require browser/direct-URL verification.

Shared route-state files include `src/app/layout.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`, and `src/app/not-found.tsx`; the production build also emits the framework `/_not-found` route. These are not additional `page.tsx` entries.

### API inventory

There are 40 route-handler files and 61 declared HTTP methods. All custom JSON endpoints use the shared `{ success, data }` / `{ success: false, message, details?, requestId? }` contract unless noted; handlers generally return HTTP 200 on success and map validation/domain errors individually. Body/query/identifier schemas are in each domain's `*.validation.ts`; exact per-handler status/error mapping remains to be tested. The table records source-observed permissions resolved through `src/lib/auth/permission.ts`; ownership checks and redaction are identified separately, not inferred from UI visibility.

| Exact path | Method | Server-side auth/permission observed | Operation/schema source | UI consumer or current note | Inventory status |
|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET` | Auth.js handler; no custom permission helper | Auth.js handler from `src/auth.ts` | Session surfaces | `VERIFIED` — exported method observed. |
| `/api/auth/[...nextauth]` | `POST` | Auth.js handler; no custom permission helper | Auth.js credentials handler from `src/auth.ts` | Login/sign-in and sign-out surfaces | `VERIFIED` — exported method observed. |
| `/api/auth/register` | `POST` | Public | `auth/register` route; registration validation/service | `/register` | `VERIFIED` — public route and method observed. |
| `/api/auth/verify-email` | `POST` | Public | `auth/verify-email`; token validation/service | `/verify-email` | `VERIFIED` — public route and method observed. |
| `/api/auth/resend-verification` | `POST` | Public | `auth/resend-verification`; throttling/service | `/resend-verification` | `VERIFIED` — public route and method observed. |
| `/api/auth/forgot-password` | `POST` | Public | `auth/forgot-password`; reset request validation/service | `/forgot-password` | `VERIFIED` — public route and method observed. |
| `/api/auth/reset-password` | `POST` | Public | `auth/reset-password`; reset token/password validation/service | `/reset-password` | `VERIFIED` — public route and method observed. |
| `/api/users` | `GET` | `users:read` — ADMIN | `user.validation.ts`, user service/repository | `UserList`; user/doctor/schedule selection flows | `VERIFIED` — source guard and consumer search. |
| `/api/users` | `POST` | `users:manage` — ADMIN | `createUserSchema`, create user service/repository | No create-user UI call found; provisioning policy and UX are open | `VERIFIED` — API exists; integration gap is a candidate, not an approved feature. |
| `/api/users/{id}` | `GET` | `users:read` — ADMIN | `userIdSchema`, user service/repository | No direct detail consumer found | `VERIFIED` — source guard/method observed; intent of direct UI absence needs review. |
| `/api/users/{id}/approve` | `POST` | `users:manage` — ADMIN | `userIdSchema`, `approvePatient` service; verified-pending patient guard | `UserList` approve action | `VERIFIED` — source guard and consumer observed. |
| `/api/doctors` | `GET` | `doctors:read` — ADMIN, DOCTOR, OT_STAFF | `doctor.validation.ts`, doctor service/repository | `DoctorDirectory`, dashboard/schedule selectors | `VERIFIED` — source guard and consumer search. |
| `/api/doctors` | `POST` | `doctors:manage` — ADMIN | Doctor create schema/service/repository | `DoctorDirectory` create flow | `VERIFIED` — source guard and consumer search. |
| `/api/doctors/{id}` | `GET` | `doctors:read` — ADMIN, DOCTOR, OT_STAFF | Doctor ID schema/service/repository | `DoctorDetail` | `VERIFIED` — source guard and consumer search. |
| `/api/doctors/{id}` | `PATCH` | `doctors:manage` — ADMIN | Doctor update schema/service/repository | `DoctorDirectory` edit flow | `VERIFIED` — source guard and consumer search. |
| `/api/doctors/{id}/status` | `PATCH` | `doctors:manage` — ADMIN | Doctor status schema/service/repository | `DoctorDirectory` status action | `VERIFIED` — source guard and consumer search. |
| `/api/patients` | `GET` | `patients:read` — ADMIN, DOCTOR | `patient.validation.ts`, patient service/repository | `PatientRegistry`, schedule selectors | `VERIFIED` — source guard and consumer search. |
| `/api/patients` | `POST` | `patients:manage` — ADMIN | Patient create schema/service/repository | `PatientRegistry` create flow | `VERIFIED` — source guard and consumer search. |
| `/api/patients/{id}` | `GET` | `patients:clinical:read` — ADMIN, DOCTOR | Patient ID schema/service/repository | `PatientDetail` | `VERIFIED` — source guard and consumer search. |
| `/api/patients/{id}` | `PATCH` | `patients:manage` — ADMIN | Patient update schema/service/repository | `PatientRegistry` edit flow | `VERIFIED` — source guard and consumer search. |
| `/api/departments` | `GET` | `departments:read` — ADMIN, DOCTOR, OT_STAFF | `department.validation.ts`, department service/repository | `DepartmentManagement`, schedule/resource forms | `VERIFIED` — source guard and consumer search. |
| `/api/departments` | `POST` | `departments:manage` — ADMIN | Department create schema/service/repository | `DepartmentManagement` | `VERIFIED` — source guard and consumer search. |
| `/api/departments/{id}` | `GET` | `departments:read` — ADMIN, DOCTOR, OT_STAFF | Department ID schema/service/repository | No separate detail page found | `VERIFIED` — source method/guard observed. |
| `/api/departments/{id}` | `PATCH` | `departments:manage` — ADMIN | Department update schema/service/repository | `DepartmentManagement` edit/active action | `VERIFIED` — source guard and consumer search. |
| `/api/departments/{id}` | `DELETE` | `departments:manage` — ADMIN | Department ID schema/service/repository; dependency rules | `DepartmentManagement` delete action | `VERIFIED` — source guard and consumer search. |
| `/api/ot-rooms` | `GET` | `otRooms:read` — ADMIN, DOCTOR, OT_STAFF | `ot-room.validation.ts`, room service/repository | `OtRoomManagement`, dashboards/schedule selectors | `VERIFIED` — source guard and consumer search. |
| `/api/ot-rooms` | `POST` | `otRooms:manage` — ADMIN | Room create schema/service/repository | `OtRoomManagement` | `VERIFIED` — source guard and consumer search. |
| `/api/ot-rooms/{id}` | `GET` | `otRooms:read` — ADMIN, DOCTOR, OT_STAFF | Room ID schema/service/repository | No separate detail page found | `VERIFIED` — source method/guard observed. |
| `/api/ot-rooms/{id}` | `PATCH` | `otRooms:manage` — ADMIN | Room update schema/service/repository | `OtRoomManagement` edit | `VERIFIED` — source guard and consumer search. |
| `/api/ot-rooms/{id}/status` | `PATCH` | `otRooms:manage` — ADMIN | Room status schema/service/repository | `OtRoomManagement` status action | `VERIFIED` — source guard and consumer search. |
| `/api/ot-rooms/{id}/active` | `PATCH` | `otRooms:manage` — ADMIN | Room active schema/service/repository | `OtRoomManagement` active action | `VERIFIED` — source guard and consumer search. |
| `/api/equipment` | `GET` | `equipment:read` — ADMIN, DOCTOR, OT_STAFF | `equipment.validation.ts`, equipment service/repository | `EquipmentManagement`, dashboards/schedule selectors | `VERIFIED` — source guard and consumer search. |
| `/api/equipment` | `POST` | `equipment:manage` — ADMIN | Equipment create schema/service/repository | `EquipmentManagement` | `VERIFIED` — source guard and consumer search. |
| `/api/equipment/{id}` | `GET` | `equipment:read` — ADMIN, DOCTOR, OT_STAFF | Equipment ID schema/service/repository | No separate detail page found | `VERIFIED` — source method/guard observed. |
| `/api/equipment/{id}` | `PATCH` | `equipment:manage` — ADMIN | Equipment update schema/service/repository | `EquipmentManagement` edit | `VERIFIED` — source guard and consumer search. |
| `/api/equipment/{id}/status` | `PATCH` | `equipment:manage` — ADMIN | Equipment status schema/service/repository | `EquipmentManagement` status action | `VERIFIED` — source guard and consumer search. |
| `/api/schedules` | `GET` | `schedules:read` — ADMIN, DOCTOR, OT_STAFF; OT_STAFF list is assignment-derived and notes are nulled | Schedule service/repository; schedule query handling | `SchedulePage`, dashboards | `VERIFIED` — source guard/consumer observed; OT full redaction needs method-path tests. |
| `/api/schedules` | `POST` | `schedules:create` — ADMIN | `createScheduleSchema`, validated schedule service/repository | `ScheduleForm` create | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}` | `GET` | `schedules:read` — ADMIN, DOCTOR, OT_STAFF; OT_STAFF must be assigned and response is redacted | `scheduleIdSchema`, access helper, schedule service/repository | `ScheduleDetails` | `VERIFIED` — source guard and access/redaction helpers observed. |
| `/api/schedules/{id}` | `PATCH` | `schedules:manage` — ADMIN, DOCTOR in current permission map | `updateScheduleSchema`, validated schedule service/repository | `ScheduleForm` edit | `VERIFIED` — source guard observed; user approved Doctor updates to any schedule; route-level runtime behavior remains untested. |
| `/api/schedules/{id}/status` | `PATCH` | `schedules:manage` — ADMIN, DOCTOR in current permission map | `updateScheduleStatusSchema`, transition service/repository | `ScheduleStatusActions` | `VERIFIED` — source guard observed; user approved Doctor transitions for any schedule; route-level runtime behavior remains untested. |
| `/api/schedules/{id}/staff` | `GET` | `schedules:read` — ADMIN, DOCTOR, OT_STAFF; OT_STAFF access is assignment-scoped | Schedule ID schema, schedule service/repository | No separate request found; `ScheduleDetails` may receive nested relationships | `VERIFIED` — handler checks assignment for OT_STAFF; consumer needs review. |
| `/api/schedules/{id}/staff` | `POST` | `schedules:staff:manage` — ADMIN | Staff assignment schema/service/repository | `ScheduleDetails` assign action | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/staff/{staffId}` | `DELETE` | `schedules:staff:manage` — ADMIN | Schedule/staff ID schemas, remove-assignment service/repository | `ScheduleDetails` remove action | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/equipment` | `GET` | `schedules:read` — ADMIN, DOCTOR, OT_STAFF; OT_STAFF access is assignment-scoped | Schedule ID schema, schedule service/repository | No separate request found; `ScheduleDetails` may receive nested relationships | `VERIFIED` — handler checks assignment for OT_STAFF; consumer needs review. |
| `/api/schedules/{id}/equipment` | `POST` | `schedules:equipment:manage` — ADMIN | Equipment assignment schema/service/repository | `ScheduleDetails` assign action | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/equipment/{equipmentId}` | `PATCH` | `schedules:equipment:manage` — ADMIN | Schedule/equipment ID and release/update validation/service | `ScheduleDetails` release action | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/notes` | `GET` | `schedules:notes:manage` — ADMIN, DOCTOR | Schedule ID schema, schedule service/repository | `ScheduleDetails` note list | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/notes` | `POST` | `schedules:notes:manage` — ADMIN, DOCTOR | Schedule ID and `createScheduleNoteSchema`, schedule service/repository | `ScheduleDetails` note create | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/notes/{noteId}` | `PATCH` | `schedules:notes:manage` — ADMIN, DOCTOR; service enforces parent-schedule and author rules | Schedule/note ID and `updateScheduleNoteSchema`, schedule service/repository | `ScheduleDetails` note edit | `VERIFIED` — source guard and consumer observed. |
| `/api/schedules/{id}/notes/{noteId}` | `DELETE` | `schedules:notes:manage` — ADMIN, DOCTOR; service enforces parent-schedule and author rules | Schedule/note ID schemas, schedule service/repository | `ScheduleDetails` note delete | `VERIFIED` — source guard and consumer observed. |
| `/api/me/schedules` | `GET` | `schedules:read` plus explicit `DOCTOR` role check; service filters by current surgeon ID | Schedule service/repository | `DoctorDashboard` | `VERIFIED` — handler role check and consumer observed; runtime ownership test remains open. |
| `/api/me/staff-schedules` | `GET` | `schedules:read` plus explicit OT_STAFF role check; service filters by current user assignment | Schedule service/repository | `OTStaffDashboard` | `VERIFIED` — handler role check and consumer observed. |
| `/api/me/appointments` | `GET` | `schedules:read:own` — PATIENT; service resolves data for current user | Patient/schedule service and repository | Patient dashboard, appointments list and detail | `VERIFIED` — guard and consumers observed. |
| `/api/alerts` | `GET` | `alerts:read` — all roles; service applies recipient ownership | `alerts.validation.ts`, alert service/repository | Alert center, dashboard widgets | `VERIFIED` — source guard and consumers observed. |
| `/api/alerts` | `POST` | `alerts:create` — ADMIN, DOCTOR, OT_STAFF; PATIENT excluded | Alert create schema/service/repository | No create-alert UI call found | `VERIFIED` — route exists; UI absence is not yet classified as a gap. |
| `/api/alerts/{id}` | `GET` | `alerts:read` — all roles; service enforces ownership for non-admins | Alert ID schema/service/repository | No direct detail view found | `VERIFIED` — source guard observed. |
| `/api/alerts/{id}` | `PATCH` | `alerts:update` or `alerts:update:own`; all roles, with service ownership checks | `updateAlertSchema`, alert service/repository | `AlertCenter` read/delete controls; no generic edit call found | `VERIFIED` — source guard/consumer observed. |
| `/api/alerts/{id}` | `DELETE` | `alerts:delete` or `alerts:delete:own`; all roles, with service ownership checks | Alert ID schema/service/repository | `AlertCenter` delete | `VERIFIED` — source guard and consumer observed. |
| `/api/alerts/{id}/read` | `PATCH` | `alerts:update` or `alerts:update:own`; ownership is service-enforced | Alert ID/read validation/service | `AlertCenter` mark-read | `VERIFIED` — source guard and consumer observed. |
| `/api/alerts/read-all` | `PATCH` | `alerts:update` or `alerts:update:own`; operates on current user's alerts for non-admins | Read-all query/service | `AlertCenter` mark-all-read | `VERIFIED` — source guard and consumer observed. |
| `/api/audit` | `GET` | `audit:read` — ADMIN | Audit query/service/repository | `AuditLogViewer` | `VERIFIED` — source guard and consumer observed. |

The custom handler inventory contains no health or diagnostics endpoint. The auth catch-all returns Auth.js responses rather than the shared application envelope. Method-level response details, validation field limits, and actual loading/error/empty behavior require the remaining Phase A/G review; the table is not a runtime test report.

### Frontend-to-backend integration map

| Workflow surface | Observed UI/API wiring | Current finding |
|---|---|---|
| Login/session | `LoginForm` uses Auth.js; account pages map to public auth routes | Static wiring present; success/failure, redirects, token lifecycle, and SMTP remain untested. |
| User list/approval | `UserList` calls `GET /api/users` and `POST /api/users/{id}/approve` | Listing/approval wired. No `POST /api/users` UI request found; provisioning policy is open. |
| Department management | `DepartmentManagement` calls department list/create/update/delete and doctor options | Main operations wired; verify dependency failures, role behavior, and all form states. |
| Doctor directory/detail | `DoctorDirectory` calls doctor list/create/edit/status and user/department options; `DoctorDetail` calls detail API | Main operations wired; verify account/profile semantics and validation feedback. |
| Patient registry/detail | `PatientRegistry` calls list/create/update; `PatientDetail` calls detail API | Main operations wired; verify fields, privacy, and user-link lifecycle. |
| Rooms/equipment | `OtRoomManagement` and `EquipmentManagement` call supported CRUD/status/active endpoints | Main controls wired; schedule assignment integrity and mutation failures remain untested. |
| Schedule list/form/status | `SchedulePage`, `ScheduleForm`, and `ScheduleStatusActions` call schedule list/create/update/status APIs | Main controls wired; test role visibility, conflicts, stale status, and failed-refresh behavior. |
| Schedule detail | `ScheduleDetails` loads schedule and calls staff/equipment/note mutations | Mutations wired. Child GET endpoints have no separate direct request found; inspect whether the detail response intentionally includes those relations. |
| Role dashboards | Doctor uses `/api/me/schedules`; OT_STAFF uses `/api/me/staff-schedules`; patient dashboard uses `/api/me/appointments`; operational widgets use shared resource APIs | Source wiring present; runtime ownership and loading/error/empty behavior untested. |
| Alerts | `AlertCenter` reads, marks read/read-all, and deletes alerts | No alert-create consumer found; backend-only status/purpose needs product review. |
| Audit | `AuditLogViewer` queries `/api/audit` | Source wiring present; filters, pagination/order, and sensitive-field handling untested. |

### Frontend completion audit (Phase G frontend pass)

Source-level audit of every rendered page and shared client component against the API contracts. Statuses describe what was verified by source inspection plus the checks recorded in the [Baseline command log](#baseline-command-log); no browser E2E run was performed.

| Area | Surfaces reviewed | Result |
|---|---|---|
| Public / auth | Landing page, login, register, verify-email, resend-verification, forgot-password, reset-password, unauthorized | `VERIFIED` — all flows wired to their endpoints with validation, loading, success and error states. Fixed: forgot-password was unreachable; a login link now exposes it. Register/resend/reset handle rate limiting and generic responses per the API contract. |
| App shell | `AppShell`, `Header`, `Sidebar`, `LandingMobileNav` | `VERIFIED` — role-filtered navigation for all four roles, mobile drawer with backdrop and Escape handling, session-aware header with alert centre and sign-out. Fixed: nested `<main>` landmarks. |
| Admin | `/dashboard` widgets, `/users`, `/departments`, `/patients` + detail, `/doctors` + detail, `/ot-rooms`, `/equipment`, `/schedules` + detail, `/audit` | `VERIFIED` — list/search/filter, create/edit/deactivate/status/approve operations wired to the supported endpoints with duplicate-submit guards, post-mutation refresh, and loading/empty/error/retry states. Added: user-provisioning form. |
| Doctor | `/dashboard`, `/schedules`, `/schedules/[id]`, directories, alerts | `VERIFIED` — `/api/me/schedules` dashboard, schedule list/detail, status transitions per the approved any-schedule update policy, notes author-scoped edit/delete. |
| OT staff | `/dashboard`, `/schedules`, `/schedules/[id]`, `/ot-rooms`, `/equipment`, `/departments`, `/doctors`, alerts | `VERIFIED` — `/api/me/staff-schedules` dashboard, read-only resource directories, assignment-scoped schedule detail with no unsupported mutation controls exposed. |
| Patient | `/dashboard`, `/patients/appointments`, `/patients/appointments/[id]`, alerts | `VERIFIED` — `/api/me/appointments` scoped views with own-record empty state; detail resolves only from the patient's own appointment set, so foreign IDs render "not found" rather than another patient's data. No booking/cancellation controls exist because no such API contract is established. |
| Cross-cutting | `apiClient`, `AlertCenter`, dashboard widgets, schedule form/list/filters/calendar/status actions | `VERIFIED` — every consumer uses the shared `apiClient` and the `{ success, data }` envelope; errors surface `ApiClientError.message`; mutations disable while pending and refresh afterwards. Fixed: schedule `scheduledDate` payload contract. |

Not verified by this pass: actual browser rendering, responsive breakpoints at real device sizes, keyboard-only traversal, and live server responses (the dev server was not run). These remain Phase J items.

### Repository structure

- [x] `VERIFIED` — Next.js App Router application; layouts, loading/error/not-found routes, public/auth pages, and dashboard route group exist. Evidence: current `src/app` tree and successful build.
- [x] `VERIFIED` — Nine domain module families: alerts, audit, departments, doctors, equipment, OT rooms, patients, schedules, users. Evidence: `src/modules/<domain>`.
- [x] `VERIFIED` — Shared API/auth/db infrastructure exists under `src/lib/api`, `src/lib/auth`, and `src/lib/db`; generated Prisma client is under `src/generated/prisma`.
- [x] `VERIFIED` — Prisma schema and nine committed migrations exist. Evidence: current `prisma/schema.prisma` and `prisma/migrations`.
- [x] `VERIFIED` — Fourteen top-level test files exist: eight database-backed (`schedule-constraints`, `schedule-status-concurrency`, `schedule-audit-atomicity`, `schedule-repository-audit`, `schedule-related-repository-audit`, `alerts-repository-audit`, `privacy-boundary`, and `patient-approval-concurrency`, the last of which is not wired into `test:database`) and six runnable without a database (`api-request-validation`, `foundation-validation`, `permissions`, `schedule-access`, `me-read-handlers`, `accessibility`). `tests/e2e`, `tests/integration`, and `tests/unit` exist but contain no files. Evidence: `ls tests/` and each test's own `DATABASE_URL` assertion.
- [x] `VERIFIED` — Package scripts include `dev`, `predev` (database seed), `db:seed:demo`, `build`, `start`, `lint`, `format`, `format:check`, `test:permissions`, `test:schedule-constraints`, `test:me-read-handlers`, `test:accessibility`, and `test:database`; there is no aggregate `test` or `typecheck` script. Evidence: `package.json`.
- [ ] `NOT_STARTED` — Complete inventory of hooks/utilities, duplicate implementations, dead code, all role-aware navigation states, and placeholder UI.

### Existing test-file inventory

| Test file | Focus/source-observed dependency | Current Phase A result |
|---|---|---|
| `tests/api-request-validation.test.ts` | Shared JSON-body parsing | `VERIFIED` — included in 15 passing focused tests. |
| `tests/foundation-validation.test.ts` | Query and user-input validation | `VERIFIED` — included in 15 passing focused tests. |
| `tests/permissions.test.ts` | Role permission map | `VERIFIED` — included in 15 passing focused tests. |
| `tests/schedule-access.test.ts` | Status transitions, OT access and redaction helpers | `VERIFIED` — in the focused suite; Phase 4 added the OT `patient.phone` redaction regression test (file now has 6 tests; aggregate focused run 16/16). |
| `tests/schedule-constraints.test.ts` | PostgreSQL overlap exclusion constraints | `VERIFIED` — 8 tests passed on the isolated disposable database. |
| `tests/schedule-status-concurrency.test.ts` | Concurrent compare-and-set through `schedule.repository.updateScheduleStatus`, including exactly one success, stale conflict, and atomic audit | `VERIFIED` — passed through `npm run test:database`. |
| `tests/schedule-audit-atomicity.test.ts` | Database-backed schedule/audit atomicity | `VERIFIED` — passed through `npm run test:database`. |
| `tests/schedule-repository-audit.test.ts` | Database-backed schedule repository audit behavior | `VERIFIED` — passed through `npm run test:database`. |
| `tests/schedule-related-repository-audit.test.ts` | Database-backed related schedule repository audit behavior | `VERIFIED` — passed through `npm run test:database`. |
| `tests/privacy-boundary.test.ts` | Synthetic-fixture service tests for OT_STAFF assignment filtering, schedule field selection, PATIENT user-link filtering, and an unlinked patient account | `VERIFIED` — passed on isolated PostgreSQL through `npm run test:database`. |
| `tests/alerts-repository-audit.test.ts` | Alerts repository mutations with audit commit/rollback, via `pg` | Runs inside `test:database`. Requires `DATABASE_URL` to be a **local** database literally named `medorch_alerts_test_*`; it fails its own precondition assertion otherwise (observed). Not recorded in this table until 2026-10-23. |
| `tests/me-read-handlers.test.ts` | `handlePatientAppointments` / `handleStaffSchedules` scoping from a synthetic session | Runs via `test:me-read-handlers`; no database. Not recorded in this table until 2026-10-23. |
| `tests/patient-approval-concurrency.test.ts` | Concurrent patient approval through `user.service.approvePatient` on `pg` | Requires `DATABASE_URL` but is **not** included in the `test:database` script, so it is not exercised by any package script today. Not recorded in this table until 2026-10-23. |
| `tests/accessibility.test.tsx` | SSR-renders `Header`/`Sidebar`/`ScheduleCard`/`ScheduleStatusActions` with `react-dom/server` and asserts accessible-name uniqueness/contextuality and nav-toggle disclosure state | `VERIFIED` — added in Phase 3; runs via `test:accessibility`, no database. |
| `tests/runtime-authorization.test.ts` | Live HTTP authorization/isolation suite: spawns `next start`, logs every role in through the real NextAuth credentials flow, probes role/ownership/redaction/transition boundaries over HTTP, then tears the server down | `VERIFIED` — added in Phase 5; runs via `test:runtime`; requires a disposable local `medorch_runtime_test_*` database and a current production build. |

## Role-by-role permissions and workflows

This matrix reflects the current permission constants and the inspected routes. Doctor schedule update/status scope is approved; other policy and all browser/runtime outcomes remain subject to the checklist below.

| Role | Source permission map | Observed workflow surfaces | Important boundary / unverified item |
|---|---|---|---|
| `ADMIN` | User read/manage; departments/doctors/rooms/equipment read/manage; schedule read/create/manage/staff/equipment/notes manage; patients read/manage/clinical-read; audit read; alerts read/manage/create/update/delete | Admin dashboard; operational data management; schedules/details; users; audit; alerts | Verify lifecycle and all write failures directly at API/service boundary. |
| `DOCTOR` | Departments/rooms/equipment read; schedule read/manage/notes manage; doctors read; patients read/clinical-read; alerts read/create/update-own/delete-own | Doctor dashboard and schedules; directory/detail pages; schedule notes; alerts | `VERIFIED` in browser: approved any-schedule update/status confirmed with a live `PATCH .../status`; create is correctly hidden; `/users` and `/audit` blocked at page and API level. |
| `OT_STAFF` | Departments/rooms/equipment/doctors/schedules read; alerts read/create/update-own/delete-own | Assigned schedule dashboard, schedule details, operational directories, alerts | `VERIFIED` in browser: assignment filtering, 403 on `patients`/`users`/`audit` and on `status`/`notes`/`staff` mutations, 404 on unassigned schedules, `clinicalNotes` null and patient email/DOB/gender omitted. Schedule-note redaction not yet observed on a populated schedule. |
| `PATIENT` | Own schedule read; alerts read/update-own/delete-own | Patient dashboard, own appointments/list/detail, alerts | Service test verifies the user-linked patient record and schedules are scoped; direct endpoint authorization, detail paths, and non-schedule ownership remain unverified. No booking/cancel/reschedule contract is established. |

## Database and domain constraint verification

- [x] `VERIFIED` — Prisma schema validates. Evidence: `npx prisma validate` passed with a synthetic, non-connectable `DATABASE_URL`; this command validates schema/configuration and did not connect to a database.
- [x] `VERIFIED` — Migration `20261010224215_schedule_overlap_constraints` declares three PostgreSQL GiST exclusion constraints using `btree_gist`, excluding `CANCELLED` and `COMPLETED` schedules. Evidence: migration SQL source inspection.
- [x] `VERIFIED` — Source documents and schema enumerate primary unique identifiers/relations for users, patients, departments, rooms, equipment, schedules, assignments, alerts, and audit records. Evidence: `prisma/schema.prisma` and `docs/data-model.md`.
- [x] `VERIFIED` — Applied all nine migrations to a newly created PostgreSQL 17 container using a tmpfs data directory and no persistent mounts; Prisma reports the schema up to date. The separate `medorch-postgres` container was not used.
- [x] `VERIFIED` — Ran overlap constraints, conditional status concurrency, schedule audit atomicity, schedule repository audit, related repository audit, and privacy-boundary tests. Evidence: latest `npm run test:database` passed 30 tests.
- [ ] `NOT_STARTED` — Verify equipment assignment/release races and lifecycle invariants against PostgreSQL.
- [ ] `NOT_STARTED` — Verify all foreign-key, uniqueness, deletion, active/inactive resource, and room/department domain rules at service and database boundaries.

## Security and privacy checklist

- [x] `VERIFIED` — Authentication and page/API guard helpers, role map, account/session fields, and redaction helper exist in source. Evidence: source inspection only; no security behavior implied by existence.
- [x] `VERIFIED` — OT schedule detail handler checks assigned-user access and applies `redactScheduleDetailsForOT`; schedule list handler nulls `clinicalNotes` for OT_STAFF. Evidence: handler source.
- [x] `VERIFIED` — Patient appointment endpoint authorizes `schedules:read:own` and passes current session user ID to patient-portal service. Evidence: handler/service call source.
- [x] `VERIFIED` — Synthetic-fixture service test confirms OT_STAFF receives only schedules assigned to that user and selected patient fields; patient portal data is filtered by linked user ID and returns no record for an unlinked account. Evidence: `tests/privacy-boundary.test.ts`, passed on isolated PostgreSQL.
- [ ] `IN_PROGRESS` — Test every alternate read path for equivalent sensitive-field exposure and every direct unauthorized mutation. Phase 4 (2026-10-24) compared collection, detail, sub-resource, and mutation paths for schedules, alerts, patients, users, doctors, departments, OT rooms, and equipment: the schedule-detail `patient.phone` discrepancy was the only field-level mismatch found and is fixed. Phase 5 executed live unauthorized-mutation probes for all four roles (schedule create/status/notes/staff, department create/delete, user approve, alert create/update/delete) plus detail/sub-resource reads and ID manipulation, and re-verified redaction over HTTP including `phone`. Remaining unprobed runtime mutations: doctors/ot-rooms/equipment management endpoints, note PATCH/DELETE, `PATCH /api/patients/{id}`, and user status changes — source-verified only.
- [ ] `NOT_STARTED` — Test user/alert/patient/schedule ownership, invalid IDs, malformed/oversized bodies, and error response leakage.
- [ ] `NOT_STARTED` — Verify token expiry, replay prevention, account-status restrictions, rate-limit boundaries, session invalidation, and SMTP failures.
- [ ] `NOT_STARTED` — Audit all dependency advisories and deployment configuration; `npm ci` reported 15 high-severity advisories, but no advisory-level audit was run during Phase A.
- [ ] `NOT_STARTED` — Review environment/secrets handling and ensure only synthetic records are used for tests/demos.
- [ ] `NOT_STARTED` — No production or healthcare-compliance readiness is established. This project is documented as a portfolio/development prototype; whether production adaptation is in scope requires an explicit decision and separate threat/privacy/operations review.

## Automated and manual QA checklist

- [x] `VERIFIED` — Focused non-database suite passes 15/15 tests: shared request parsing, validation, role permission definitions, schedule access/transitions, and OT redaction helper behavior.
- [x] `VERIFIED` — Route-level authorization and ownership tests for all four roles. Phase 5: `npm run test:runtime` → 13/13 pass over live HTTP on a disposable database (ADMIN, DOCTOR, OT_STAFF, two PATIENT accounts, plus unauthenticated probes).
- [ ] `NOT_STARTED` — Auth/account lifecycle tests for verification and password-reset tokens, session invalidation, rate limiting, and generic responses.
- [x] `VERIFIED` — Database-backed constraint, transactionality, repository-audit, status concurrency, and privacy-boundary tests ran on a confirmed disposable database. Evidence: `npm run test:database` now runs 31 tests: 30 pass, 1 fails only on its own environment precondition (see the alerts-suite finding below); the previously recorded figure of 30 predates `alerts-repository-audit.test.ts`.
- [ ] `NOT_STARTED` — Critical-form component or browser E2E tests, using existing tooling if present and only adding tooling if required.
- [x] `VERIFIED` — Manual role acceptance tests for all four roles (Admin, Doctor, OT_STAFF, PATIENT), cross-role direct URLs, browser console/network failures, and responsive layouts are complete (evidence in Phase J).
- [ ] `IN_PROGRESS` — Regression tests for each confirmed defect fixed. Phase 4 added a dedicated regression test for the OT_STAFF `patient.phone` leak plus extended redaction-shape assertions in `tests/schedule-access.test.ts`; Phase 3 accessibility defects are covered by `tests/accessibility.test.tsx`. The Phase G `scheduledDate` payload fix and the P2 frontend fixes still have no automated regression test.

## Deployment and demo readiness checklist

- [ ] `NOT_STARTED` — Verify clean-install/setup steps, DB migration/seeding, deterministic synthetic data, and local-only demo account handling.
- [ ] `NOT_STARTED` — Verify environment variable names/configuration without exposing secret values. Current source reads `DATABASE_URL`, `SMTP_USER`, `SMTP_APP_PASSWORD`, `EMAIL_FROM`, and `NEXTAUTH_URL`; actual availability and mail delivery are not verified.
- [ ] `NOT_STARTED` — Review deployment secrets, HTTPS/cookies, DB connectivity, monitoring/logging, backups/restore, migrations, and rollback practices.
- [ ] `NOT_STARTED` — Confirm CI jobs and results for lint, typecheck, tests, Prisma validation, and build.
- [ ] `NOT_STARTED` — Complete demo walkthrough for all four roles and record accepted limitations.
- [ ] `NOT_STARTED` — Decide whether real patient data, clinical use, regulatory compliance, production availability, backup/restore, or incident response are in scope; none is part of verified readiness today.

## Findings and prioritized backlog

### Confirmed defects / documentation mismatches

- [x] `VERIFIED` — **P1, authorization policy/documentation mismatch resolved:** User approved Doctor access to update/status any schedule. `docs/api-reference.md` now documents that policy and `docs/decisions.md` records the decision. Route-level runtime behavior remains untested. Relevant sources: `src/lib/auth/permission.ts`, the schedule PATCH/status handlers, `tests/permissions.test.ts`, `docs/api-reference.md`, and `docs/decisions.md`.
- [x] `VERIFIED` — **P1, schedule create/edit payload contract defect (frontend) FIXED:** `ScheduleForm` sent `scheduledDate` as a full ISO datetime, but `createScheduleSchema`/`updateScheduleSchema` validate it with `z.iso.date()` (`YYYY-MM-DD` only), so every schedule create and edit from the UI failed validation with HTTP 400. Confirmed by running the real schema against both payload shapes before the fix. `src/components/schedules/ScheduleForm.tsx` now sends the raw `YYYY-MM-DD` string, which also removes a timezone conversion that could shift the stored date. Backend unchanged.
- [x] `VERIFIED` — **P2, patient registry table columns misaligned (frontend) FIXED:** the `PatientRegistry` table header rendered the `Actions` column before `Gender`, while the body cells rendered `Gender` before `Actions`, so row data was displayed under the wrong headings. `src/app/patients/PatientRegistry.tsx` header order now matches the body.
- [x] `VERIFIED` — **P2, forgot-password flow unreachable (frontend) FIXED:** `/forgot-password` existed but no page linked to it, leaving the flow a dead end. `LoginForm` now includes a "Forgot your password?" link between sign-in and the resend-verification link.
- [x] `VERIFIED` — **P2, nested `<main>` landmarks (frontend) FIXED:** `AppShell` rendered `<main>` and nearly every page component rendered another `<main>`, producing invalid nested landmarks on every authenticated page. `AppShell` now renders a plain container `div`; the admin dashboard branch and `SchedulePage`/`PatientDashboard` gained their own `<main>` so each page still exposes exactly one main landmark.
- [ ] `NOT_STARTED` — **P2, stale route inventory:** `/departments` exists, is sidebar-linked, and has a guarded page, but is missing from the older `docs/file-index.md` page inventory. Update the index when the source-of-truth docs are reconciled.
- [ ] `NOT_STARTED` — **P2, stale test inventory:** current source has ten test files; `PROJECT_CONTEXT.md` and `PROJECT_STATUS.md` still describe five. `docs/development.md` and `docs/ai-coding-workflow.md` now document the database suite and its React server condition. Reconcile the remaining status/context docs.
- [ ] `NOT_STARTED` — **P3, redundant branch:** `GET /api/me/appointments` contains a duplicate `if (!patient)` check after the same null check already returned. This appears behaviorally redundant, not a demonstrated exposure or availability defect; clean up with a focused regression check if accepted in the implementation backlog.
- [x] `VERIFIED` — **P1, stale dev-server route registration (environment, not application code):** every nested API handler under a dynamic segment returned a framework-level HTML 404 while `GET /api/schedules` and `GET /api/schedules/{id}` on the same resource returned 200 JSON. Affected all of `/schedules/{id}/notes|status|staff|equipment`, `/doctors/{id}/status`, `/users/{id}/approve`, `/alerts/{id}/read`, `/ot-rooms/{id}/status`, `/equipment/{id}/status`. The route files exist and are correct; touching one nested `route.ts` forced a full route re-scan, after which every nested route answered correctly (`200`, or `405` for method-limited handlers). Impact: schedule note creation, every status transition, staff/equipment assignment, and user approval silently 404 until re-registration, which can be mistaken for an application bug. Remediation: restart the dev server (or touch a route file) after adding route files, and treat an HTML 404 on an existing handler as a registration problem first.
- [ ] `NOT_STARTED` — **P1, `NEXTAUTH_URL` origin mismatch breaks sign-out and would break verification links:** `Header.tsx` calls `signOut({ callbackUrl: '/login' })` with a relative URL, yet the browser issued `GET http://localhost:3000/login → net::ERR_CONNECTION_REFUSED` because the dev server runs on 3210 while `NEXTAUTH_URL` is the documented `http://localhost:3000` (`docs/development.md`). The user lands on `/login` only after the failed request, so sign-out works but logs a console/network error every time. `src/lib/email/send-verification-email.ts` also builds `verificationUrl` from `NEXTAUTH_URL`, so verification and reset links would point at the wrong origin. Remediation: run the dev server on the `NEXTAUTH_URL` port, or set `NEXTAUTH_URL` to the actual origin; do not commit its value. Phase 3 reproduction: signing out of the second (acceptance) instance on port 3211 left the browser on a hard `chrome-error://chromewebdata/` page (null origin) rather than recovering to `/login`, so the failure is worse than a console error — it strands the tab. Configuration fix intentionally left as a follow-up (it lives in gitignored `.env` and requires the operator's decision).
- [x] `VERIFIED` — **P1, seeded PATIENT accounts could never authenticate — RESOLVED with a development-only seed flag (Phase 3):** the auth policy itself is unchanged (`src/auth.ts` still requires `emailVerifiedAt` for `PATIENT`). `prisma/seed.ts` now accepts an explicit opt-in environment flag `SEED_VERIFIED_PATIENTS=1` that marks seeded PATIENT accounts verified **at seed time only**; without the flag behavior is byte-for-byte the old behavior. Verified against a disposable isolated database: seeded patients read `PATIENT|ACTIVE|verified=t` and signed in successfully in a real browser. The existing development database was not modified. See `docs/development.md`.
- [x] `VERIFIED` — **P2, accessibility: duplicate accessible names on schedule card actions — FIXED (Phase 3):** `ScheduleStatusActions` accepts an optional `scheduleLabel` and renders `aria-label="{action} schedule for {procedure}"`; `ScheduleCard` passes it and adds `aria-label` to its `Edit` and `View details` controls; `ScheduleDetails` also passes the label. Visible button text is unchanged. Evidence: `npm run test:accessibility` (5/5, asserts uniqueness and contextual names across multiple cards) and a browser recount on `/schedules` — 39 controls, **0 duplicate accessible names** (previously 11× `Edit`, 5× `Cancel schedule`).
- [x] `VERIFIED` — **P2, accessibility: mobile navigation toggle lacks disclosure state — FIXED (Phase 3):** `AppShell` now passes `sidebarOpen` to `Header`, which renders `aria-expanded` with the state and swaps `aria-label` between Open/Close (matching the pattern already used by `LandingMobileNav`); `Sidebar` exports `PRIMARY_NAVIGATION_ID` and applies it as the `<aside>` id so `aria-controls` resolves. Evidence: `npm run test:accessibility` (toggle state + sidebar id linkage) and browser checks at 375px — closed: `aria-expanded="false"`, label "Open navigation menu"; open: `aria-expanded="true"`, label "Close navigation menu", `aria-controls` resolves to the rendered aside (x=0), drawer opens/closes with scrim intact.
- [ ] `NOT_STARTED` — **P3, accessibility: minor heading-level skips:** the admin dashboard runs `h1 → h3 → h5` ("Quick Operational Actions" then "Schedule Surgery") and `/schedules` runs `h1 → h4` ("FILTER SCHEDULES"). Cosmetic for structure-only tooling but flagged for a consistent outline.
- [x] `VERIFIED` — **Not a defect — `/api/alerts` polling frequency:** measured 57 requests over 570s via the Resource Timing API, i.e. exactly the intended 30s interval. An earlier apparent burst was accumulation in the captured log buffer, not a runaway poll loop.
- [x] `VERIFIED` — **P2, `npm run test:database` failed 1 of 31 in a normal dev environment — PREREQUISITE NOW DOCUMENTED, suite green (Phase 3):** `tests/alerts-repository-audit.test.ts` asserts that `DATABASE_URL` points at a **localhost** database whose name matches `medorch_alerts_test_*` before it will run (the safety assertion was not weakened). Run against a disposable PostgreSQL container with a database named `medorch_alerts_test_<suffix>` on a loopback port, `npm run test:database` passes **34/34** (31 previously counted + the alerts test's 4 subtests that previously never ran). The prerequisite is now recorded in `docs/development.md`. Related: `tests/patient-approval-concurrency.test.ts` needs `DATABASE_URL` but is still not referenced by any package script.
- [x] `VERIFIED` — **P3, stale test inventory in the tracker — CORRECTED:** the repository held thirteen top-level test files while this document recorded ten; `alerts-repository-audit.test.ts`, `me-read-handlers.test.ts`, and `patient-approval-concurrency.test.ts` were undocumented and the script list omitted `test:me-read-handlers`. Corrected in Phase 2 and updated again in Phase 3 for `accessibility.test.tsx` (fourteen files) and `test:accessibility`. Re-check whenever a test file is added.
- [x] `VERIFIED` — **P2, patient phone number leaked to OT_STAFF on schedule detail — FIXED (Phase 4):** `findScheduleById` selects `patient.phone`, and `GET /api/schedules/{id}` passes the result through `redactScheduleDetailsForOT`, which nulled `email`, `dateOfBirth`, and `gender` but not `phone`. Any assigned OT_STAFF account therefore received the patient's phone number on the detail endpoint — contradicting the same role's collection path (`findSchedulesForStaff` selects only `name` + `patientCode`, asserted by `tests/privacy-boundary.test.ts`), the helper's own redaction policy, the Phase E evidence that the schedule UI consumes none of these demographics, and foundation-audit finding #9 (phone flagged as beyond UI need). Source search confirms no schedule UI reads `patient.phone`. Fix: `src/modules/schedules/schedule-access.ts` now nulls `phone` alongside the other demographics (type + output). Evidence: `node --import tsx --test tests/schedule-access.test.ts` → **6/6 pass** including the new regression test "OT detail redaction nulls every patient demographic the detail query selects"; `npx tsc --noEmit` → 0; `npm run lint` → 0; `npm run test:database` → 34/34 on a disposable database (privacy-boundary field-shape assertions unchanged and still passing).

### Potential missing integrations (not yet approved feature work)

- [x] `VERIFIED` — **RESOLVED (frontend):** `POST /api/users` had no UI caller. The admin `/users` page now has a create-user form (name, email, temporary password, optional phone, role, optional initial status) that posts to the existing endpoint with the documented validation constraints (name 2–100, password 12–128, phone 7–20). Server-side rules are unchanged; duplicate-email conflicts surface the API's own 409 message.
- [ ] `NOT_STARTED` — `POST /api/alerts` has no create-alert UI caller found. Determine whether it is intentionally backend-only or whether a supported user workflow requires a UI.
- [ ] `NOT_STARTED` — `GET /api/users/{id}` and resource detail endpoints for departments/rooms/equipment have no direct UI request found. Determine whether they are intentionally API-only; do not add duplicate UI detail routes just to consume them.
- [ ] `NOT_STARTED` — Nested schedule staff/equipment read routes have no separate UI request found; the schedule detail endpoint may already supply nested relations. Verify response shape and intent before classifying this as a gap.

### Untested behavior

- [x] `VERIFIED` — Database-backed tests and migration state: all nine migrations applied; PostgreSQL overlap constraints and status concurrency passed on the isolated disposable database.
- [x] `VERIFIED` — Direct API role/ownership behavior and patient/OT_STAFF redaction over HTTP: Phase 5's live suite proved route authorization, ownership scoping, cross-account isolation, and redaction (including `phone`) for all four roles on a disposable database. Remaining runtime gaps are account-lifecycle endpoints and malformed/oversized/invalid-enum body abuse cases.
- [ ] `NOT_STARTED` — Authentication/account lifecycle, SMTP behavior, operational UI error/loading/empty states, and all four role browser journeys.
- [ ] `NOT_STARTED` — Dependency advisory impact; install output alone does not identify exploitable runtime exposure or a remediation.

### Optional enhancements (not blockers unless product requirements confirm)

- [ ] `NOT_STARTED` — Server-side pagination/filtering and dedicated dashboard aggregate endpoint, subject to scale/performance evidence.
- [ ] `NOT_STARTED` — Real-time dashboard updates, subject to an explicit product need.
- [ ] `NOT_STARTED` — Broader alert triggers and audit coverage, subject to documented event policy.
- [ ] `NOT_STARTED` — Additional browser/component testing, subject to project harness and proven acceptance value.

### Product decisions needed

- [ ] `NOT_STARTED` — Admin provisioning roles and patient credential/verification/approval sequence.
- [ ] `NOT_STARTED` — Minimum schedule and patient fields OT_STAFF may view.
- [ ] `NOT_STARTED` — Whether patient appointment booking/cancellation/rescheduling belongs in scope.
- [ ] `NOT_STARTED` — Alert generation policy and whether alert creation needs a UI.
- [ ] `NOT_STARTED` — Audit event coverage and whether each critical business write must be atomic with its audit row.
- [ ] `NOT_STARTED` — Production hosting, secret management, retention, backup, monitoring, privacy, and compliance scope.

## Patient acceptance — development-only setup

The production authentication policy is unchanged: `src/auth.ts` still rejects PATIENT sign-in when `emailVerifiedAt` is null, and no test-only endpoint, backdoor, or bypass exists. To make patient-role acceptance testable without SMTP, `prisma/seed.ts` accepts an explicit opt-in environment flag:

- `SEED_VERIFIED_PATIENTS=1` — marks seeded PATIENT accounts as email-verified **at seed time only**. Unset (the default) preserves the exact previous behavior byte-for-byte. Development-only convenience; never set it for production seeding. Documented in `docs/development.md`.

Procedure used in Phase 3 (everything disposable; nothing persisted):

1. `docker run` a `postgres:17` container with `--tmpfs /var/lib/postgresql/data`, a **loopback-only random host port**, a throwaway password, and `POSTGRES_HOST_AUTH_METHOD=trust` bound to that loopback port. Two databases: `medorch_alerts_test_<suffix>` (for the database suite) and `medorch_phase3_acceptance`. Git Bash MSYS path conversion must be disabled (`MSYS_NO_PATHCONV=1`) for `--tmpfs`.
2. `npx prisma migrate deploy` applied all nine migrations to both databases.
3. `DATABASE_URL=<acceptance-db> SEED_VERIFIED_PATIENTS=1 npx prisma db seed` — seeded; both patients verified (`PATIENT|ACTIVE|verified=t` checked via `psql`, no secrets printed).
4. A second, isolated `next dev -p 3211` instance ran from a temporary copy of the worktree (symlinked `node_modules`, separate `.next`) with the acceptance `DATABASE_URL`, so the primary development server and its database were never touched.
5. PATIENT acceptance executed in an isolated browser profile: login/redirect, dashboard, appointment list/detail, empty and not-found states, 375px/1440px responsive checks, cross-patient direct access, and unauthenticated page/API access. Evidence in Phase J and Phase F.
6. Teardown: server stopped (ports verified dead), temporary copy removed (the `node_modules` link removed before deleting the copy, then the real `node_modules` re-verified), container removed. Primary dev server and its container verified still running afterwards.

Without this flag (or working SMTP credentials), seeded patients cannot sign in — that is the intended production policy, not a defect.

## Baseline command log

Commands were executed on the audited source revision. “Not run” means no result is claimed.

| Command | Result |
|---|---|
| `git status --short --branch` | PASS at audit start: `## agents/pasted-text-processing-476ac5f7`; clean worktree. |
| `npm ci` | PASS; installed 524 packages from the existing lockfile. npm reported 15 high-severity advisories and a deprecated ESLint version; neither was audited/remediated during Phase A. |
| `npx tsc --noEmit` | PASS; exit code 0. |
| `npm run lint` | PASS; exit code 0. |
| `node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts` | PASS; 15 tests, 0 failures. |
| `npm run build` | PASS; Next.js 16.3.6 production build completed and enumerated the current app/API route set. |
| `npx prisma validate` | PASS; schema valid. Used a one-command synthetic `DATABASE_URL` pointing to loopback port 1 solely to satisfy Prisma config; validation did not connect. |
| `docker compose ps` | PASS as an inspection command; no service matched this worktree's Compose project. A separate `medorch-postgres` container is running; its purpose/safety is unknown and it was not used. |
| `docker run ... postgres:17` | PASS; created `medorch-completion-test-f414ce3f`, loopback-only random host port, tmpfs `/var/lib/postgresql/data`, no persistent mounts. Removed after database verification; the unrelated `medorch-postgres` container was not used. |
| `docker run ... postgres:17` | PASS; created `medorch-privacy-test-f414ce3f`, loopback-only random host port, tmpfs `/var/lib/postgresql/data`, no persistent mounts. Applied all migrations, ran the updated suite, then removed this named container. |
| `npx prisma migrate deploy` | PASS against the named ephemeral container; all nine migrations applied. No other database was targeted. |
| `npx prisma migrate status` | PASS against the named ephemeral container; database schema up to date. |
| `npm run test:schedule-constraints` | PASS against the isolated container; 8 tests passed, 0 failures. |
| `npm run test:database` | PASS against the isolated container; 29 tests passed, 0 failures, including repository compare-and-set concurrency coverage. Uses `--conditions=react-server`. |
| `npm run test:database` | PASS against `medorch-privacy-test-f414ce3f`; 30 tests passed, 0 failures, including synthetic-fixture OT_STAFF assignment scope and PATIENT own-record service tests. Uses `--conditions=react-server`. |
| `npx tsc --noEmit` | PASS after the concurrency-test change; exit code 0. |
| `npm run lint` | PASS after concurrency-test and package-script changes; exit code 0. |
| `npm pkg get scripts.test:database` | PASS; returned the expected `--conditions=react-server` test command. |
| `npx tsc --noEmit` | PASS after adding the privacy-boundary test; exit code 0. |
| `npm run lint` | PASS after adding the privacy-boundary test; exit code 0. |
| `npx prettier --check tests/privacy-boundary.test.ts package.json` | PASS after formatting the test and package script. |
| `git diff --check` | PASS after the current changes. |
| Initial pre-install attempts of `npx tsc --noEmit`, `npm run lint`, and the focused test command | BLOCKED because `node_modules` was absent (`tsc`, `eslint`, and `tsx` were unavailable). `npm ci` restored the lockfile dependencies; all three checks were rerun and passed as recorded above. |
| Initial default-condition run of database repository tests | FAILED because Node selected the default `server-only` export. Rerunning with `--conditions=react-server` passed; `package.json` records this condition in `test:database`. |
| `npm audit` | NOT RUN — npm install reported a summary count only; no advisory details were reviewed. |
| Browser/manual E2E workflows | NOT RUN in Phase A; browser acceptance was executed later in Phases 2 and 3 — see Phase J evidence and the Phase 3 rows below. |
| `npx tsc --noEmit` (frontend completion pass) | PASS; exit code 0 after the frontend completion edits. |
| `npm run lint` (frontend completion pass) | PASS; exit code 0 after the frontend completion edits. |
| `node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts` | PASS; 15 tests, 0 failures after the frontend completion edits. |
| `npm run test:me-read-handlers` | PASS after the frontend completion edits. |
| `npm run build` (frontend completion pass) | PASS; Next.js production build completed and enumerated the current route set. |
| `node --import tsx` script against `createScheduleSchema` | VERIFIED the contract defect: the schema accepts only `YYYY-MM-DD` for `scheduledDate`; the previous UI payload sent a full ISO datetime and failed validation. Confirmed both inputs before applying the frontend fix. |
| `npx tsc --noEmit` (Phase 3) | PASS; exit code 0 after the accessibility, seed-flag, and test additions. |
| `npm run lint` (Phase 3) | PASS; exit code 0. |
| `npm run test:permissions` (Phase 3) | PASS; 5 tests, 0 failures. |
| `npm run test:schedule-constraints` (Phase 3) | PASS; 8 tests, 0 failures. |
| `npm run test:accessibility` (Phase 3, new script) | PASS; 5 tests, 0 failures — nav-toggle disclosure state, sidebar id linkage, unique contextual schedule control names, unchanged visible text, generic-label fallback. |
| `docker run ... postgres:17` (Phase 3) | PASS; created `medorch-phase3-12610`, loopback-only random host port (`127.0.0.1:6616`), tmpfs `/var/lib/postgresql/data`, no persistent mounts; `POSTGRES_HOST_AUTH_METHOD=trust` scoped to that loopback port. Databases: `medorch_alerts_test_311218488` and `medorch_phase3_acceptance`. Removed after acceptance; the primary development container (`medorch-phase2-ephemeral`, port 5432) was never touched. Note: Git Bash MSYS path conversion mangled `--tmpfs` on the first attempt (`invalid mount path: 'C'`); rerun with `MSYS_NO_PATHCONV=1`. |
| `npx prisma migrate deploy` (Phase 3, ×2) | PASS against both disposable databases; all nine migrations applied to each. |
| `DATABASE_URL=<acceptance-db> SEED_VERIFIED_PATIENTS=1 npx prisma db seed` | PASS; seeded the disposable acceptance database with both PATIENT accounts verified (`PATIENT\|ACTIVE\|verified=t` verified via `psql`). |
| `npm run test:database` with `DATABASE_URL` pointing at `medorch_alerts_test_311218488` on loopback | PASS; **34 tests, 0 failures** (previously 31 total with 1 failing its precondition). Safety assertion in `tests/alerts-repository-audit.test.ts` unchanged. |
| Isolated second `next dev -p 3211` instance (temporary worktree copy, acceptance `DATABASE_URL`) | PASS; served the PATIENT browser acceptance, then stopped (port verified dead). Primary dev server on 3210 verified answering 200 before and after. |
| `git diff --check` (Phase 3) | PASS after the current changes. |
| `npm run build` (Phase 3) | NOT RUN — a production build writes the same `.next` directory the running dev server uses, which would risk the live session; `tsc`, lint, and all suites cover the changes instead. |
| `npx tsc --noEmit` (Phase 4) | PASS; exit code 0 after the redaction fix and regression tests (first run flagged property access on the helper's intersection return type in the new test; restructured to the suite's whole-object `deepEqual` pattern and rerun clean). |
| `npm run lint` (Phase 4) | PASS; exit code 0, rerun after the final test edit. |
| `npm run test:permissions` (Phase 4) | PASS; 5 tests, 0 failures. |
| `npm run test:me-read-handlers` (Phase 4) | PASS; 9 tests, 0 failures. |
| `node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts` (Phase 4) | PASS; 16 tests, 0 failures (the focused suite grew from 15 by one — the new OT `patient.phone` regression test). |
| `docker run ... postgres:17` (Phase 4) | PASS; created `medorch-phase4-a71f3c9d`, loopback-only port `127.0.0.1:6627`, tmpfs `/var/lib/postgresql/data`, no persistent mounts (`MSYS_NO_PATHCONV=1`), `POSTGRES_HOST_AUTH_METHOD=trust` scoped to that loopback port. Docker Desktop's engine had to be started first (it was down). The existing `medorch-phase2-ephemeral` container (exited) was never started, touched, or connected to; the disposable container was removed afterwards and `docker ps -a` re-verified showing only `medorch-phase2-ephemeral` (exited, unchanged). |
| `npx prisma migrate deploy` (Phase 4) | PASS; all migrations applied to the disposable `medorch_alerts_test_74192836` database only. |
| `DATABASE_URL=<disposable> npm run test:database` (Phase 4) | PASS; **34 tests, 0 failures**; the safety assertion in `tests/alerts-repository-audit.test.ts` was not weakened. |
| `npm run build` (Phase 4) | PASS; Next.js production build completed and enumerated the full route set (no dev server was running). The previously recorded `.next/cache` permission issue did not reproduce — no files were deleted, moved, or re-permissioned. |
| `git diff --check` (Phase 4) | PASS after the current changes. |
| `npx tsc --noEmit` (Phase 5) | PASS; exit code 0, rerun after every test-file edit. |
| `npm run lint` (Phase 5) | PASS; exit code 0 (one `prefer-const` error in the new suite was found and fixed, then rerun clean). |
| `npm run test:permissions` (Phase 5) | PASS; 5 tests, 0 failures. |
| `npm run test:me-read-handlers` (Phase 5) | PASS; 9 tests, 0 failures. |
| `node --import tsx --test tests/schedule-access.test.ts` (Phase 5) | PASS; 6 tests, 0 failures (Phase 4 redaction regression coverage intact). |
| `npm run test:accessibility` (Phase 5) | PASS; 5 tests, 0 failures. |
| `docker run ... postgres:17` (Phase 5) | PASS; created `medorch-phase5-b3f71d29`, loopback-only port `127.0.0.1:6631`, tmpfs `/var/lib/postgresql/data`, no persistent mounts (`MSYS_NO_PATHCONV=1`). Databases: `medorch_runtime_test_b3f71d29` and `medorch_alerts_test_b3f71d29`. The primary development container and its database were never touched. |
| `npx prisma migrate deploy` (Phase 5) | PASS; all migrations applied to both disposable databases only. |
| `DATABASE_URL=<runtime-db> SEED_VERIFIED_PATIENTS=1 npx prisma db seed` | PASS; seeded only `medorch_runtime_test_b3f71d29` (verified PATIENT accounts required for sign-in; development-only flag, auth policy untouched). |
| `DATABASE_URL=<runtime-db> npm run test:runtime` (Phase 5, final run) | PASS; **13 tests, 0 failures** — the suite spawns and stops its own `next start` server and establishes all five sessions per run. |
| `DATABASE_URL=<alerts-db> npm run test:database` (Phase 5) | PASS; **34 tests, 0 failures** on the disposable database; the alerts-suite safety assertion was not weakened. |
| `npm run build` (Phase 5) | NOT RUN — no `src/` or `prisma/` file is newer than the existing Phase 4 production build (`.next/BUILD_ID`, checked with `find src prisma -newer`), and the runtime suite's live `patient.phone` redaction assertion proves that build contains the Phase 4 fix. |
| `git diff --check` (Phase 5) | PASS after the current changes. |
| `npx tsc --noEmit` (Phase 6 batch 1) | PASS; exit code 0 after each edit round. |
| `npm run lint` (Phase 6 batch 1) | PASS; exit code 0. The first run reported 15 errors, all inside vendored `.agents/skills/*/scripts/*.cjs` CommonJS skill tooling; `eslint.config.mjs` now ignores `.agents/**`. No project source file produced a lint error. |
| `npm run test:accessibility` (Phase 6 batch 1) | PASS; 5 tests, 0 failures, rerun after the final edit round. |
| `npx prettier --write` (Phase 6 batch 1 files) | PASS; batch-1 files formatted with the repository prettier config (including `prettier-plugin-tailwindcss`). |
| `git diff --check` (Phase 6 batch 1) | PASS after normalizing `src/components/layout/Sidebar.tsx` from CRLF to LF (it was the only CRLF file in the tree; every added line was flagged as trailing whitespace). |
| Browser DOM verification (Phase 6 batch 1) | PASS; live dev server at `localhost:3000` — Fira Sans/Fira Code loaded, `--primary`/`--radius-control`/`--radius-card` resolving (the radius pair was referenced but undefined before this batch), body `#f8fafc`, landing/login/dashboard rendering, ADMIN badge `#dbeafe`/`#1e40af` = 7.8:1, nav links 14px with pointer cursors, header alert control on-token; no console errors. Sign-in verified with the documented local development account (credentials intentionally not recorded here). |
| `docker compose up -d` (Phase 6 batch 1) | PASS; the Docker engine was down at session start, so Docker Desktop was started and the existing `medorch-postgres` container was started with its existing volume. No reset, no migrate, no seed; the unrelated exited `medorch-phase2-ephemeral` container was left untouched. |
| `npx tsc --noEmit` (Phase 6 batch 2) | PASS; exit code 0. |
| `npm run lint` (Phase 6 batch 2) | PASS; exit code 0. |
| `npm run test:accessibility` (Phase 6 batch 2) | PASS; 5 tests, 0 failures. |
| `git diff --check` (Phase 6 batch 2) | PASS after the current changes. |
| Browser DOM verification (Phase 6 batch 2) | PASS; `/forgot-password` card on `#ffffff` over `#f8fafc` canvas, inputs with `#74829a` 3.9:1 boundaries at 8px radius, submit `#1e40af`+white (8.7:1); `/register` submit now white-on-blue (the undefined `text-primary-foreground` previously inherited near-black text on blue at ~1.7:1), placeholder `#64748b` = 4.8:1; `/verify-email` button fixed the same way; no console errors. |
| `npx tsc --noEmit` (Phase 6 batch 3) | PASS; exit code 0 after each edit round. |
| `npm run lint` (Phase 6 batch 3) | PASS; exit code 0. |
| `npx prettier --write` (Phase 6 batch 3 files) | PASS; all batch-3 files formatted with the repository config. |
| `npm run test:accessibility` (Phase 6 batch 3) | PASS; 5 tests, 0 failures. |
| `npm run test:permissions` (Phase 6 batch 3) | PASS; 5 tests, 0 failures (auth policy untouched). |
| `npm run test:me-read-handlers` (Phase 6 batch 3) | PASS; 9 tests, 0 failures. |
| `git diff --check` (Phase 6 batch 3) | PASS after the current changes. |
| Browser DOM verification (Phase 6 batch 3) | PASS; live dev server at `localhost:3000`, signed in as ADMIN. `/users` renders its 14-row table with zero raw palette classes; `/patients` search input computed `border-top: rgb(116,130,154)` = `#74829a` 3.9:1 and `::placeholder` `rgb(100,116,139)` = `#64748b` 4.8:1; `/ot-rooms` renders 7 selects all at the 3.9:1 boundary; no console errors (Fast Refresh logs only). |

## Phase 6 — UI overhaul (in progress)

### Step 1 — design system (complete)

The installed ui-ux-pro-max skill was read in full and its workflow executed:

- `search.py --design-system` (query: hospital/clinical-operations) first returned **Neumorphism** — rejected per the skill's own retry rule because its profile flags `Accessibility: risk:high` and targets meditation/fitness UIs, not a dense clinical console.
- The retry with explicit design dials (`--variance 3 --motion 2 --density 8`) returned **Minimalism & Swiss Style** (best fit: enterprise apps/dashboards; `risk:low`), the Enterprise Gateway landing pattern, and a blue/amber palette — persisted via `--persist` to `docs/design-system/medorch/MASTER.md` (master + `pages/` override structure).
- Supplementary searches: `--domain ux` (dense-table overflow/card fallback, line-height 1.5–1.75, focusable error summary, blur-time inline validation) and `--domain color` (healthcare/patient-portal palettes); `--stack nextjs` for App Router guidance.
- Every generated color pair was then measured against the skill's own 4.5:1 / 3:1 checklist. The generated file contradicts itself (white-on-amber `#D97706` = 3.19:1, soft borders 1.2:1, raw status inks below AA), so the calibrated token layer in `src/app/globals.css` supersedes those specs; measured ratios are recorded inline next to each token.

Approved direction: Minimalism & Swiss, calibrated blue/amber palette, Fira Sans (UI) + Fira Code (tabular numerics) via `next/font`, **light sidebar** (user's explicit choice over the proposed navy rail), `@phosphor-icons/react` for icons, CSS-only motion (the skill's GSAP snippet deliberately not adopted — motion dial 2/10, no new animation dependency), light mode only (dark mode out of scope).

### Batch 1 — tokens, fonts, primitives, shell (complete)

- `src/app/globals.css`: full token rewrite with measured AA palette; added `--accent`/`--accent-ink`, `--danger-hover`, `--danger-border`, and the previously **referenced-but-undefined** `--radius-control`, `--radius-card`, `--color-danger-border`, `--color-text-muted` aliases (the first two silently rendered square corners before); Fira font variables; global `button:not(:disabled) { cursor:pointer }` from the skill checklist.
- `src/app/layout.tsx`: `next/font/google` Fira Sans (400/500/600/700) + Fira Code, self-hosted, exposed as `--font-fira-sans`/`--font-fira-code` on `<html>` (verified against `node_modules/next/dist/docs/01-app/.../font.md` first, per AGENTS.md).
- Primitives on-token: `Button` (5 variants, no layout-shifting hover, global visible focus), `Badge` (soft/ink pairs, all ≥ 4.5:1, label text always present), `Card`, `EmptyState` (Phosphor `Tray`), `ErrorState` (`role="alert"`, danger tokens), `LoadingState` (`role="status"`). Dark-mode variants dropped (light-only design).
- Shell: `AppShell`, `Header`, `Sidebar` (light surface per user choice) — Phosphor icons replace 11 hand-drawn SVGs; test-locked behavior untouched (`PRIMARY_NAVIGATION_ID`, aria-expanded + label swap verified by `test:accessibility` 5/5).
- `AlertCenter` (header dropdown): moved off raw slate/rose/blue classes — including `text-slate-400` at 2.8:1 — onto tokens; all fetch/mutation behavior untouched.
- `eslint.config.mjs`: ignore `.agents/**` (vendored CommonJS skill tooling, not app source). This was the only lint failure in the batch.

Checks: tsc 0, lint 0, `test:accessibility` 5/5, prettier clean, `git diff --check` PASS, plus live-browser DOM verification (computed styles, loaded fonts, no console errors). See the command log rows above for exact outcomes.

### Remaining batches

2. Public landing + auth pages (login/register/forgot/reset/verify/resend, unauthorized/not-found) — **complete.** The three password-flow pages were restyled from a hardcoded dark theme (`bg-slate-950`/sky/emerald) onto the light token card matching login; inputs moved to `border-border-strong` (3.9:1); register and verify-email were converted from the undefined shadcn-style vocabulary (`bg-card`, `text-primary-foreground`, `border-destructive`, `bg-muted`) to real tokens — this fixed a genuine contrast defect where primary buttons rendered near-black text on blue (~1.7:1). Landing and login were already token-clean and picked up Fira fonts/radius fixes automatically.
3. ADMIN — dashboard admin widgets, users, departments, patients, doctors, OT rooms, equipment, audit tables/filters/detail views. — **complete.** A reviewed codemod converted ~132 raw palette class lines and every dead `dark:` variant across the twelve batch-3 files; the audit action/status map and `QuickActions` accents moved from `indigo`/raw pairs onto semantic tokens; every input, select, textarea and outline button moved to `border-border-strong` (3.9:1 control boundary) with `placeholder:text-foreground-subtle` (4.8:1) and a `focus:ring-primary/20` focus ring; icon-only shell controls (header nav toggle, alerts bell, sign out) got the same 3.9:1 boundary since their border is their only affordance. Two stray raw `text-white` occurrences on the landing mobile nav were normalized as batch-2 cleanup.
4. Schedules family + DOCTOR — list/detail/form/filters/calendar/status actions, doctor dashboard.
5. OT_STAFF + PATIENT — role dashboards, patient portal/appointments, alert views, mobile navigation.
6. Responsive/a11y polish sweep (375/768/1024/1440, reduced motion, focus order) + full verification (tsc, lint, all suites incl. `test:runtime`, production build) + final master-plan update.

After each batch: `npx tsc --noEmit`, `npm run lint`, `npm run test:accessibility`, `git diff --check`, and a live-browser check of the touched surfaces. No API, schema, auth, or permission changes in any batch.

## Files changed by phase

| Phase | Files changed |
|---|---|
| A — baseline/inventory | `docs/MEDORCH_COMPLETION_MASTER_PLAN.md` (this tracker). Application code and configuration are unchanged. |
| D — policy/documentation reconciliation | `docs/api-reference.md`, `docs/decisions.md`, and this tracker. No application code or schema changed; existing behavior was retained. |
| I — database and privacy-boundary test coverage | `tests/schedule-status-concurrency.test.ts`, `tests/privacy-boundary.test.ts`, `package.json`, `docs/development.md`, `docs/ai-coding-workflow.md`, and this tracker. |
| G — frontend completion pass | `src/components/schedules/ScheduleForm.tsx` (scheduledDate payload contract fix), `src/app/patients/PatientRegistry.tsx` (table column order fix), `src/components/users/UserList.tsx` (admin user-provisioning form), `src/components/auth/LoginForm.tsx` (forgot-password link), `src/components/layout/AppShell.tsx`, `src/app/dashboard/page.tsx`, `src/components/schedules/SchedulePage.tsx`, `src/components/dashboard/PatientDashboard.tsx` (single `<main>` landmark), and this tracker. Frontend-only; no API handler, service, repository, schema, or auth logic was modified. |
| Phase 2 — browser acceptance & doc reconciliation (no code) | `docs/MEDORCH_COMPLETION_MASTER_PLAN.md`, `docs/development.md` only. Evidence recorded for Admin/Doctor/OT_STAFF role acceptance, cross-role guards, responsive/a11y sweeps, and new findings. |
| Phase 3 — accessibility, patient acceptance setup, test reliability | `src/components/schedules/ScheduleCard.tsx` and `src/components/schedules/ScheduleStatusActions.tsx` (contextual accessible names), `src/components/layout/Header.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/AppShell.tsx` (nav toggle disclosure state), `src/app/schedules/[id]/ScheduleDetails.tsx` (passes schedule label), `prisma/seed.ts` (dev-only `SEED_VERIFIED_PATIENTS` flag — auth policy untouched), `tests/accessibility.test.tsx` (new), `package.json` (`test:accessibility` script), `docs/MEDORCH_COMPLETION_MASTER_PLAN.md`, `docs/development.md`. No API handler, service, repository, schema, migration, or authorization rule was modified. |
| Phase 4 — API authorization audit | `src/modules/schedules/schedule-access.ts` (OT detail redaction now also nulls `patient.phone`), `tests/schedule-access.test.ts` (regression test + extended redaction-shape assertions), and this tracker. No route handler, service, repository, schema, migration, permission rule, or auth policy was modified; nothing was committed or pushed. |
| Phase 5 — live API authorization tests | `tests/runtime-authorization.test.ts` (new suite), `package.json` (`test:runtime` script), and this tracker. No application code, schema, migration, permission rule, or auth policy was modified; nothing was committed or pushed. |
| Phase 6 batch 1 — design system + shared shell | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`, `src/components/layout/AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `src/components/alerts/AlertCenter.tsx`, `eslint.config.mjs`, `package.json` + `package-lock.json` (added `@phosphor-icons/react`), `docs/design-system/medorch/MASTER.md` (new), and this tracker. Frontend-only; no API handler, service, repository, schema, migration, permission rule, or auth policy was modified; nothing was committed or pushed. |
| Phase 6 batch 2 — public landing + auth pages | `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/resend-verification/page.tsx`, `src/app/verify-email/page.tsx`, `src/app/register/page.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/landing/LandingMobileNav.tsx`, and this tracker. Frontend-only; no API handler, service, repository, schema, migration, permission rule, or auth policy was modified; nothing was committed or pushed. |
| Phase 6 batch 3 — ADMIN surfaces | `src/app/(dashboard)/users/page.tsx`, `src/app/dashboard/page.tsx`, `src/components/dashboard/OperationalOverview.tsx`, `QuickActions.tsx`, `RecentSchedulesList.tsx`, `OTRoomsGrid.tsx`, `AlertsSummaryWidget.tsx`, `src/components/users/UserList.tsx`, `UserFilters.tsx`, `src/components/departments/DepartmentManagement.tsx`, `src/app/patients/PatientRegistry.tsx`, `src/app/patients/[id]/PatientDetail.tsx`, `src/app/doctors/DoctorDirectory.tsx`, `src/app/doctors/[id]/DoctorDetail.tsx`, `src/app/ot-rooms/OtRoomManagement.tsx`, `src/app/equipment/EquipmentManagement.tsx`, `src/components/audit/AuditLogViewer.tsx`, `src/components/layout/Header.tsx`, `src/components/alerts/AlertCenter.tsx`, and this tracker. Frontend-only; no API handler, service, repository, schema, migration, permission rule, or auth policy was modified; nothing was committed or pushed. |
| B–C, E–H (remaining), J–K (remaining) | None yet. Record exact files after each phase; do not commit unless explicitly requested. |

## Current phase, next task, and exact resume instructions

**Current phase:** Phase 6 (complete UI overhaul); **batches 1–3 complete** — design system + shared shell (batch 1), public landing + authentication pages (batch 2), and ADMIN surfaces (batch 3: dashboard widgets, users, departments, patients, doctors, OT rooms, equipment, audit). All checks green after each batch: tsc, lint, prettier, `test:accessibility` 5/5, `git diff --check`, plus live-browser DOM verification (batch 1: landing/login/dashboard; batch 2: forgot-password/register/verify-email computed styles; batch 3: `/users`, `/patients`, `/ot-rooms` computed control boundaries and console). Batch 3 fixed control-boundary contrast (inputs/selects/outline buttons/icon-only header controls at 1.2:1 → 3.9:1) and finished the raw-palette/`dark:` sweep for every ADMIN surface. Phase 3/4/5 work remains intact; nothing committed or pushed.

**Next task:** Phase 6 batch 4 — schedules family + DOCTOR: `ScheduleForm`/`ScheduleFilters`/`ScheduleCalendar`/`ScheduleCard`/`SchedulePage`/`ScheduleDetails` and the doctor dashboard (the last files with raw slate/blue classes and dead `dark:` variants), then batch 5 (OT_STAFF + PATIENT) and batch 6 (responsive/a11y sweep + full verification incl. `test:runtime` and the production build). Security-track follow-ups (Phase B account-lifecycle token tests, remaining Phase H abuse cases, the `NEXTAUTH_URL`/dev-port mismatch, P3 heading-level skips, wiring `patient-approval-concurrency.test.ts` into a package script) remain in the backlog above and are unchanged by this phase.

**Resume instructions:**

1. Read this tracker, especially [Security and privacy checklist](#security-and-privacy-checklist), [Findings](#findings-and-prioritized-backlog), and [Role-by-role permissions and workflows](#role-by-role-permissions-and-workflows).
2. Doctor schedule-write policy and backlog approval are recorded: Doctors may update/status any schedule; the user approved proceeding phase-by-phase.
3. Database tests require an **isolated disposable** database: `test:database` needs a localhost database named `medorch_alerts_test_*` (see [Patient acceptance — development-only setup](#patient-acceptance--development-only-setup) and `docs/development.md`). Never connect to or alter the primary development database (the running `medorch-phase2-ephemeral` container on port 5432 that backs the dev server).
4. Implement only approved, confirmed gaps in small phases. Update this tracker with exact files, commands, outcomes, and remaining blockers after each phase. Do not commit or push without a separate request.
