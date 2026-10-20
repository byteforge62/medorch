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
