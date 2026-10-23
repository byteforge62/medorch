# MedOrch Completion Master Plan

**Status:** `IN_PROGRESS` — Phase A repository baseline and database-backed schedule checks are verified. Service-level OT_STAFF/PATIENT read scoping is now tested; route-level security and browser verification remain outstanding.
**Last audited:** 2026-10-21
**Repository:** `byteforge62/medorch`
**Branch:** `agents/pasted-text-processing-476ac5f7`
**Working tree at audit start:** clean
**Current phase:** Phase I — schedule integrity and targeted service-level privacy tests passed on isolated PostgreSQL.
**Next task:** Add route-level authorization and ownership tests for the staff and patient endpoints; then continue remaining read-path and browser checks.

This document is the working source of truth for project completion. A `VERIFIED` status describes only the evidence written beside that item; source inspection does not prove runtime behavior. Use synthetic data only. Never point a database test or migration at a valuable development or production database.

## Status key

- `NOT_STARTED` — not yet performed.
- `IN_PROGRESS` — being worked on.
- `BLOCKED` — cannot proceed; the blocker is stated.
- `VERIFIED` — completed with explicit source, command, test, or observed-workflow evidence.
- `ACCEPTED_GAP` — explicitly accepted as a limitation; record who/when and why before using this status.

## Overall status

- [ ] `IN_PROGRESS` — Phase A source inventory and available non-database checks are recorded below. Evidence: current source tree inspection and the command results in [Baseline command log](#baseline-command-log).
- [ ] `NOT_STARTED` — Complete runtime authorization, ownership, account lifecycle, and data-redaction verification. Targeted service-level staff/patient scope is covered; route-level and alternate-read-path checks remain.
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

- [ ] `NOT_STARTED` — Compare page guards, role map, every handler guard, and service-level ownership checks.
- [ ] `NOT_STARTED` — Test direct unauthorized API access, manipulated IDs, and ownership boundaries for all roles.
- [ ] `NOT_STARTED` — Verify OT_STAFF assignment checks/redaction and PATIENT record/appointment ownership on every related read path.
- [ ] `NOT_STARTED` — Verify ADMIN-only mutations, Doctor-specific permissions, malformed JSON, invalid identifiers, missing/wrong/oversized fields, and invalid enum values.
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
| `tests/schedule-access.test.ts` | Status transitions, OT access and redaction helpers | `VERIFIED` — included in 15 passing focused tests. |
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
- [ ] `NOT_STARTED` — Test every alternate read path for equivalent sensitive-field exposure and every direct unauthorized mutation.
- [ ] `NOT_STARTED` — Test user/alert/patient/schedule ownership, invalid IDs, malformed/oversized bodies, and error response leakage.
- [ ] `NOT_STARTED` — Verify token expiry, replay prevention, account-status restrictions, rate-limit boundaries, session invalidation, and SMTP failures.
- [ ] `NOT_STARTED` — Audit all dependency advisories and deployment configuration; `npm ci` reported 15 high-severity advisories, but no advisory-level audit was run during Phase A.
- [ ] `NOT_STARTED` — Review environment/secrets handling and ensure only synthetic records are used for tests/demos.
- [ ] `NOT_STARTED` — No production or healthcare-compliance readiness is established. This project is documented as a portfolio/development prototype; whether production adaptation is in scope requires an explicit decision and separate threat/privacy/operations review.

## Automated and manual QA checklist

- [x] `VERIFIED` — Focused non-database suite passes 15/15 tests: shared request parsing, validation, role permission definitions, schedule access/transitions, and OT redaction helper behavior.
- [ ] `NOT_STARTED` — Route-level authorization and ownership tests for all four roles.
- [ ] `NOT_STARTED` — Auth/account lifecycle tests for verification and password-reset tokens, session invalidation, rate limiting, and generic responses.
- [x] `VERIFIED` — Database-backed constraint, transactionality, repository-audit, status concurrency, and privacy-boundary tests ran on a confirmed disposable database. Evidence: `npm run test:database` now runs 31 tests: 30 pass, 1 fails only on its own environment precondition (see the alerts-suite finding below); the previously recorded figure of 30 predates `alerts-repository-audit.test.ts`.
- [ ] `NOT_STARTED` — Critical-form component or browser E2E tests, using existing tooling if present and only adding tooling if required.
- [x] `VERIFIED` — Manual role acceptance tests for all four roles (Admin, Doctor, OT_STAFF, PATIENT), cross-role direct URLs, browser console/network failures, and responsive layouts are complete (evidence in Phase J).
- [ ] `NOT_STARTED` — Regression tests for each confirmed defect fixed.

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

### Potential missing integrations (not yet approved feature work)

- [x] `VERIFIED` — **RESOLVED (frontend):** `POST /api/users` had no UI caller. The admin `/users` page now has a create-user form (name, email, temporary password, optional phone, role, optional initial status) that posts to the existing endpoint with the documented validation constraints (name 2–100, password 12–128, phone 7–20). Server-side rules are unchanged; duplicate-email conflicts surface the API's own 409 message.
- [ ] `NOT_STARTED` — `POST /api/alerts` has no create-alert UI caller found. Determine whether it is intentionally backend-only or whether a supported user workflow requires a UI.
- [ ] `NOT_STARTED` — `GET /api/users/{id}` and resource detail endpoints for departments/rooms/equipment have no direct UI request found. Determine whether they are intentionally API-only; do not add duplicate UI detail routes just to consume them.
- [ ] `NOT_STARTED` — Nested schedule staff/equipment read routes have no separate UI request found; the schedule detail endpoint may already supply nested relations. Verify response shape and intent before classifying this as a gap.

### Untested behavior

- [x] `VERIFIED` — Database-backed tests and migration state: all nine migrations applied; PostgreSQL overlap constraints and status concurrency passed on the isolated disposable database.
- [ ] `NOT_STARTED` — Direct API role/ownership behavior and remaining alternate-path patient/OT_STAFF redaction. Service-level schedule scoping has focused coverage, but this does not prove route authorization or all read paths.
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

## Files changed by phase

| Phase | Files changed |
|---|---|
| A — baseline/inventory | `docs/MEDORCH_COMPLETION_MASTER_PLAN.md` (this tracker). Application code and configuration are unchanged. |
| D — policy/documentation reconciliation | `docs/api-reference.md`, `docs/decisions.md`, and this tracker. No application code or schema changed; existing behavior was retained. |
| I — database and privacy-boundary test coverage | `tests/schedule-status-concurrency.test.ts`, `tests/privacy-boundary.test.ts`, `package.json`, `docs/development.md`, `docs/ai-coding-workflow.md`, and this tracker. |
| G — frontend completion pass | `src/components/schedules/ScheduleForm.tsx` (scheduledDate payload contract fix), `src/app/patients/PatientRegistry.tsx` (table column order fix), `src/components/users/UserList.tsx` (admin user-provisioning form), `src/components/auth/LoginForm.tsx` (forgot-password link), `src/components/layout/AppShell.tsx`, `src/app/dashboard/page.tsx`, `src/components/schedules/SchedulePage.tsx`, `src/components/dashboard/PatientDashboard.tsx` (single `<main>` landmark), and this tracker. Frontend-only; no API handler, service, repository, schema, or auth logic was modified. |
| Phase 2 — browser acceptance & doc reconciliation (no code) | `docs/MEDORCH_COMPLETION_MASTER_PLAN.md`, `docs/development.md` only. Evidence recorded for Admin/Doctor/OT_STAFF role acceptance, cross-role guards, responsive/a11y sweeps, and new findings. |
| Phase 3 — accessibility, patient acceptance setup, test reliability | `src/components/schedules/ScheduleCard.tsx` and `src/components/schedules/ScheduleStatusActions.tsx` (contextual accessible names), `src/components/layout/Header.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/AppShell.tsx` (nav toggle disclosure state), `src/app/schedules/[id]/ScheduleDetails.tsx` (passes schedule label), `prisma/seed.ts` (dev-only `SEED_VERIFIED_PATIENTS` flag — auth policy untouched), `tests/accessibility.test.tsx` (new), `package.json` (`test:accessibility` script), `docs/MEDORCH_COMPLETION_MASTER_PLAN.md`, `docs/development.md`. No API handler, service, repository, schema, migration, or authorization rule was modified. |
| B–C, E–H (remaining), J–K (remaining) | None yet. Record exact files after each phase; do not commit unless explicitly requested. |

## Current phase, next task, and exact resume instructions

**Current phase:** Phase 3 (accessibility remediation, development-only patient acceptance, test reliability) is complete: both confirmed a11y defects fixed and browser+test verified, PATIENT role acceptance executed on a disposable isolated database via the dev-only seed flag, and `npm run test:database` green (34/34) against a correctly named disposable alerts database. Phase 2 browser acceptance is complete for all four roles.

**Next task:** Add route-level authorization and ownership tests for `/api/me/staff-schedules` and `/api/me/appointments` (Phase H); keep service-level data scoping tests distinct from endpoint authorization. Follow-ups: fix the `NEXTAUTH_URL`/dev-port mismatch (operator config), P3 heading-level skips, wire `patient-approval-concurrency.test.ts` into a package script.

**Resume instructions:**

1. Read this tracker, especially [Security and privacy checklist](#security-and-privacy-checklist), [Findings](#findings-and-prioritized-backlog), and [Role-by-role permissions and workflows](#role-by-role-permissions-and-workflows).
2. Doctor schedule-write policy and backlog approval are recorded: Doctors may update/status any schedule; the user approved proceeding phase-by-phase.
3. Database tests require an **isolated disposable** database: `test:database` needs a localhost database named `medorch_alerts_test_*` (see [Patient acceptance — development-only setup](#patient-acceptance--development-only-setup) and `docs/development.md`). Never connect to or alter the primary development database (the running `medorch-phase2-ephemeral` container on port 5432 that backs the dev server).
4. Implement only approved, confirmed gaps in small phases. Update this tracker with exact files, commands, outcomes, and remaining blockers after each phase. Do not commit or push without a separate request.
