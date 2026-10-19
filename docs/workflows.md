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
