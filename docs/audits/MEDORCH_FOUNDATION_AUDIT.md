# MedOrch Foundation Audit

**Audit date:** 2026-10-16  
**Readiness verdict:** NOT READY to start the next large feature module  
**Scope:** Current repository foundation; this is not a production security or healthcare compliance assessment.

## Executive summary

The current source has working foundations for credentials authentication, JWT sessions, role-based API guards, Zod validation, hashed email/reset tokens, rate-limited email recovery, audit logging, and concurrency-safe schedule overlap constraints. The audit found and fixed a session-revocation gap, a broken forgot-password success path, several input-validation defects, inconsistent user-creation password length, and a verification-token race.

Eight findings remain at P2, including missing application-level throttling for sign-in/registration, generic 500 responses for malformed JSON in several handlers, non-atomic audit writes, and an unresolved role-specific patient-data minimization question. Automated lint, typecheck, and tests could not be run because dependencies were absent and both online and offline dependency restoration failed. Consequently the code changes are not build-verified.

**Finding counts:** P0: 0 · P1: 1 (fixed) · P2: 8 (4 fixed, 4 open) · P3: 0.

This repository documents itself as a development/portfolio prototype using synthetic data only. It is **not ready for production or real patient data**.

## Baseline and recovery checkpoint

- **Original HEAD:** `7f0373b93274cbc6c5ffe19324db30cc6a2d2298`
- **Original branch:** `agents/pasted-text-processing`
- **Original commit:** `feat: add alerts service for managing user notifications and audit logs`
- **Checkpoint reference:** `checkpoint/foundation-audit-baseline` at the same original HEAD. The existing `audit/foundation-checkpoint-20261016` reference also points to that commit.
- **Pre-existing worktree changes:** None. The pre-audit worktree had no staged, unstaged, or untracked files.
- **Dependency manifests:** `package.json` and `package-lock.json` were not changed. No migrations were applied and no environment credentials were read or modified.

The checkpoint preserves the original committed tree; this audit remains uncommitted. Inspect the task changes with `git diff checkpoint/foundation-audit-baseline`. To restore a tracked file, restore only that path from `checkpoint/foundation-audit-baseline`; do not use a blanket reset. The added report and `tests/foundation-validation.test.ts` are untracked additions and should be removed separately only if intentionally rolling back the audit.

## Areas audited and evidence inspected

### Direct source reads

- Authentication/session: `src/auth.ts`, `src/lib/auth/authorization.ts`, `src/lib/auth/permission.ts`, `src/lib/auth/password.ts`, `src/lib/auth/password-reset.ts`, `src/lib/auth/email-verification.ts`, `src/types/next-auth.d.ts`.
- API foundations: `src/lib/api/auth.ts`, `src/lib/api/response.ts`, `src/lib/api/request-id.ts`, `src/lib/api/client.ts`, `src/lib/api/error.ts`, `src/lib/api/validation.ts`.
- Configuration/database: `src/lib/env.ts`, `src/lib/db/prisma.ts`, `next.config.ts`, `prisma/schema.prisma`.
- User/email flows: `src/modules/users/user.service.ts`, `src/modules/users/user.repository.ts`, `src/modules/users/user.validation.ts`, the five non-Auth.js `src/app/api/auth/**/route.ts` handlers, and user creation/approval handlers.
- Alerts: `src/modules/alerts/alerts.service.ts`, `src/modules/alerts/alerts.repository.ts`, `src/modules/alerts/alerts.validation.ts`, and the alert Route Handlers.
- Authorization/data domains: patient service/repository and handlers; doctor service/repository/validation and status handlers; audit service/repository and `src/app/api/audit/route.ts`.
- Scheduling: `src/modules/schedules/schedule.service.ts`, `src/modules/schedules/schedule.repository.ts`, `src/modules/schedules/schedule.validation.ts`, schedule and self-service handlers, the schedule detail page/component, and the overlap-constraint migration/test.
- Frontend failure handling: login, forgot/reset password, verification/resend pages, and the shared API client.
- Existing tests and documentation: `tests/permissions.test.ts`, `tests/schedule-constraints.test.ts`, `docs/api-reference.md`, and `docs/security-and-limitations.md`.

All 40 `src/app/api/**/route.ts` files were inventoried. Repository-wide searches checked HTTP methods, authorization helper usage, JSON parsing, validation, and catch/error paths; targeted source reads covered the authentication, users, patients, alerts, audit, schedules, and doctors paths above. Department, OT-room, and equipment handlers were pattern-scanned, not exhaustively read line by line. Browser behavior was not tested.

`PROJECT_STATUS.md` and `PROJECT_CONTEXT.md` were treated as historical leads, not evidence of current behavior. Their dated claims conflict with the current tree (for example, current audit APIs and schedule detail files exist); this report is the current audit record.

## Findings

### P0

None found in the inspected scope.

### P1

1. **JWT session revocation could be bypassed after account reactivation — FIXED.** In `src/auth.ts`, a token without a numeric `sessionVersion` previously skipped the version comparison. Also, changing a doctor's status did not increment that version. A token was rejected while the account was inactive, but could become usable again if the account returned to `ACTIVE` without a version change. The JWT callback now invalidates missing/mismatched versions, and `updateDoctorUserStatus` increments the version transactionally only when the status changes. Password reset already increments the version. Current code has no general role-change endpoint; future role changes must also invalidate existing sessions.

### P2

2. **Forgot-password success path returned no response — FIXED.** `POST /api/auth/forgot-password` returned only for a rate-limited request; a normal request fell through and could produce a framework error instead of the generic anti-enumeration response. It now returns the same generic message for eligible and ineligible addresses with HTTP 202.

3. **Request validation accepted or silently defaulted malformed input — PARTLY FIXED.** `GET /api/alerts` previously transformed every `isRead` value other than `"true"` into `false`. Two mutation routes did not validate UUID path IDs, and `PATCH /api/alerts/read-all` silently treated malformed or invalid JSON as a request to mark the caller's alerts read. The query now accepts only `"true"`/`"false"`, the doctor-status and patient-approval routes validate UUIDs, and read-all distinguishes an empty optional body from malformed JSON and returns 400 for invalid input. Focused tests were added for the boolean query and password minimum; execution was blocked.

4. **Admin-created passwords used a weaker minimum than registration/reset — FIXED.** `createUserSchema` allowed 8-character passwords while registration and reset required 12. The minimum is now 12 for the admin create-user API as well.

5. **Concurrent email-verification requests could consume the same token twice — FIXED.** Verification previously read a token, updated the user, and only then deleted tokens. Concurrent transactions could both observe the token and report success. The token is now atomically claimed with a conditional delete inside the existing transaction before the user is updated. Runtime concurrency testing was not available.

6. **No application-level sign-in or registration throttling — NEEDS REVIEW.** Email verification, password-reset requests, and reset attempts use database-backed email/IP limits. The credentials authorize path and patient-registration handler have no equivalent application-level request throttling. Whether an upstream proxy supplies protection is deployment-specific and was not verified. Decide and implement protection before exposing these endpoints publicly.

7. **Malformed JSON often maps to HTTP 500 — NEEDS REVIEW.** Several handlers parse JSON inside a broad `try` and map an uncaught parse error to a generic 500 rather than 400; examples include schedule creation, patient creation, and alert creation. Responses do not reveal internal details, but the status is misleading. The `read-all` alert handler was fixed because it previously swallowed invalid input; a consistent strategy for the other handlers remains.

8. **Audit persistence is not atomic with business mutations — NEEDS REVIEW.** Services commonly commit a create/update/delete and then await `recordAudit`. If the audit insert fails, the route can return 500 even though the business change already succeeded; a client retry can observe a false failure or duplicate effects. Audit writes are also selective: reset/verification and failed sign-ins are not recorded. Define the required audit policy and transaction/outbox behavior before treating the audit trail as operationally complete.

9. **OT staff receive more patient demographics than the schedule UI uses — NEEDS REVIEW.** `GET /api/schedules/{id}` permits `OT_STAFF` under `schedules:read` and nulls `clinicalNotes`, but the selected patient object still includes email, phone, date of birth, and gender. The schedule detail UI consumes patient name/code, not those additional fields. Confirm which fields are operationally required for OT staff before changing the response; this audit does not assume that policy.

### P3

None separately classified. Documentation drift was corrected where it affected API authorization and security statements.

## Endpoint audit summary

| Area | Result | Evidence / remaining work |
| --- | --- | --- |
| Authentication and authorization | **PASS by inspection; NOT TESTED at runtime** | 34 non-auth API route files reference `authorizeApiPermission`; public Auth.js, registration, verification, and recovery routes are expected exceptions. Server-rendered protected pages use server-side `requireAuth`, `requireRole`, or `requirePermission`; no authorization depends solely on client guards. |
| Permissions and ownership | **PASS with a data-minimization follow-up** | Permission-array checks use “any required permission”; alert services scope non-admin access to the requesting user. Patient appointment data is queried using the signed-in user ID. Review finding 9 for schedule-detail demographics exposed to OT staff. |
| Request validation | **PARTIAL** | Zod schemas validate most body/query/path inputs. Alert `isRead`, doctor-status ID, patient-approval ID, and read-all body defects were fixed. Malformed JSON still reaches generic 500 handlers in several routes. |
| Status/error mapping | **PARTIAL** | Known validation, not-found, unique, and schedule-conflict errors commonly map to 400/404/409. Generic responses avoid returning raw Prisma/stack details. Several JSON parse failures return 500; more exhaustive endpoint-specific error mapping remains. |
| Responses and request IDs | **PASS with consistency differences** | Shared API helpers provide a stable success/error envelope and request IDs. Some public account flows intentionally use their own message-only response shapes, which their pages handle. `getApiErrorMessage` has no application callsites and does not currently expose raw error text through the API. |

## Session-management findings

- Credentials are normalized and checked against bcrypt hashes. Only active accounts authenticate; patients additionally require verified email.
- JWT/session data contains user ID, email/name, role, and status as required by the UI; no password hash or raw token is placed in the session.
- JWT reads verify the account still exists and remains active. Missing/mismatched session versions now fail closed; doctor status changes and password reset invalidate prior sessions.
- Database failures in the JWT callback are not converted into success-shaped sessions; runtime error behavior was not tested.
- The app has no general role-edit operation. If role changes are added, they must also increment `sessionVersion`.

## Password and email flows

- Password hashes use bcryptjs with 12 rounds. Patient registration, password reset, and admin-created accounts now share the 12–128 character length range.
- Verification and reset tokens are generated from cryptographic random bytes and stored as hashes. Reset tokens are single-use under a row lock; verification tokens are now claimed atomically. Both have expirations.
- Reset requests and verification resends have email/IP throttles; reset attempts have token/IP throttles. Forgot-password and registration responses avoid account-existence disclosure. SMTP failures are caught and logged while generic responses preserve enumeration resistance.
- Login and registration lack app-level throttling (finding 6). Reset/verification race behavior and delivery failures were not integration-tested.

## Database integrity and audit logging

- Prisma uses the PostgreSQL adapter. Schedule overlap constraints are present in migration `20261010224215_schedule_overlap_constraints`; the focused PostgreSQL test exists, but the migration state/database was not queried or changed.
- Schedule service validation is backed by PostgreSQL exclusion constraints for room, surgeon, and patient intervals.
- Password reset and email verification use transactions. Audit writes are generally sequential after business writes rather than atomic (finding 8).
- Audit route/query is administrator-protected and paginated. Audit durability, immutability, retention, and reset/verification coverage are not established.

## Configuration and frontend failure handling

- `docs/security-and-limitations.md` correctly limits the repository to synthetic data and documents the lack of production operations/compliance controls. No credentials or environment values were printed or changed.
- `src/lib/env.ts` validates `DATABASE_URL`, but the Prisma adapter reads `process.env.DATABASE_URL` directly. SMTP configuration is checked at send time. `next.config.ts` does not define security headers; production deployment configuration was not assessed.
- Reviewed authentication forms handle non-2xx responses, rate-limit responses, loading state, and generic network failures. The shared API client throws on non-2xx/error envelopes and parses server messages. No browser or visual test was run.

## Changes made

- Hardened JWT session-version validation and made doctor status changes revoke sessions.
- Added explicit session-version and invalidation fields to the Auth.js JWT type augmentation.
- Restored a generic HTTP 202 success response for ordinary forgot-password requests.
- Made email verification token consumption atomic.
- Aligned admin-created password minimum length with registration and reset.
- Tightened alert query/body validation and UUID validation for doctor-status/patient-approval paths.
- Added `tests/foundation-validation.test.ts`.
- Updated `docs/api-reference.md` route inventory/authorization matrix and `docs/security-and-limitations.md` to reflect current session and schedule-constraint behavior.

## Findings inspected but not changed

- Application-level sign-in/registration rate limiting requires a deployment/product decision; no new storage or throttling architecture was introduced.
- Generic malformed-JSON handling affects multiple routes and needs a consistent shared approach; no mass rewrite was made.
- Audit transactionality and required event coverage need a policy decision before changing domain write semantics.
- The exact demographics OT staff require was not specified; the response was left unchanged pending that decision.
- `PROJECT_STATUS.md` is a broad, dated implementation snapshot with claims contradicted by current source. It was not rewritten wholesale; this report is the current foundation checkpoint.

## Verification

| Command/check | Result |
| --- | --- |
| Git status, branch, HEAD, recent commits, staged/unstaged/untracked baseline | **PASS** — clean before edits; original HEAD and existing checkpoint references recorded above. |
| `git diff --check` | **PASS** — no whitespace errors in the final tracked diff. |
| `npm run lint` (baseline and after edits) | **BLOCKED** — local `eslint` executable unavailable because dependencies were not installed. |
| `npm run test:permissions` and `npm run test:schedule-constraints` | **BLOCKED** — `tsx` dependency unavailable. |
| `npm exec -- tsc --noEmit` | **BLOCKED** — local TypeScript compiler unavailable. |
| `npm ci` | **FAILED** — npm registry idle timeout (`EIDLETIMEOUT`); cleanup also reported Windows `EPERM`. |
| `npm install --offline --no-audit --no-fund` | **FAILED** — locked `@prisma/studio-core@0.33.0` tarball was not present in the local cache (`ENOTCACHED`). |
| `tests/foundation-validation.test.ts` | **NOT RUN** — blocked by unavailable `tsx`. |
| Production build, Prisma validation, PostgreSQL integration, browser test | **NOT RUN** — dependencies/database unavailable; no migrations were applied. |

The installed Next.js 16.3.6 Route Handler and authentication guides under `node_modules/next/dist/docs/` were consulted before code changes. The dependency install failure prevented use of the project's configured lint/type/test/build tooling.

## Remaining blockers and recommendation

1. Restore dependencies with registry access and run lint, TypeScript, the focused tests (including `tests/foundation-validation.test.ts`), Prisma validation, and a production build.
2. Decide on sign-in/registration throttling, audit atomicity/event coverage, and OT staff demographic access.
3. Normalize malformed-JSON responses across the remaining handlers.
4. Add automated session invalidation, ownership, token-reuse/concurrency, and API error-status tests.

No specific unimplemented product module can be reliably selected from the repository status notes because they conflict with current source. The next engineering task should be the auth/API boundary test foundation and resolution of the four open P2 findings; select the next feature module from the current product roadmap only after those prerequisites are addressed.
