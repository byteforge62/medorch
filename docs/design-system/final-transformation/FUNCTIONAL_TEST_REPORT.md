# Functional Test Report

## Verification summary

| Check | Result |
| --- | --- |
| TypeScript (`npx tsc --noEmit`) | Pass, exit 0 |
| Changed-file ESLint | Pass, exit 0, 22 files |
| Accessibility suite | 5/5 pass |
| Schedule workspace suites | 10/10 pass |
| Permission suite | 5/5 pass |
| Patient / staff read-handler suite | 9/9 pass |
| Production build | Pass, 49/49 pages generated |
| Browser role and interaction suite | 47/47 checks pass |
| Browser screenshots | 40 PNGs |
| Existing runtime authorization harness | 2/11 pass; 9 pre-existing contract failures documented below |

Logs are in `evidence/`.

- `typescript.log`
- `eslint.log`
- `test-accessibility.log`
- `test-schedule-workspace.log`
- `test-permissions.log`
- `test-me-read-handlers.log`
- `build.log`
- `verification-report.json`
- `verify-final.log`
- `runtime-harness-attempt.log`

---

## Browser environment

- Production server: `next start` on a loopback port.
- Browser: local Chrome via the DevTools protocol.
- Accounts: seeded ADMIN, DOCTOR, OT_STAFF and PATIENT identities.
- Viewports: 1440×900, 1024×768 and 390×844.
- Test runner: `evidence/verify-final.mjs`.
- Machine-readable results: `evidence/verification-report.json`.

The production server, not only the development server, was used for the final screenshots and role checks.

---

## Checks actually executed

### Public and access boundary

- Landing renders at all three viewports.
- Landing has no page-level horizontal overflow at 390px.
- Login renders at 1440 and 390.
- Login has no mobile overflow.
- Registration and forgot-password render.
- Unauthorized / access-boundary page renders.
- All four roles sign in through the real credentials form and reach `/dashboard`.

### ADMIN

- Dashboard renders, including all three viewports.
- Dashboard has no mobile overflow.
- Schedules board renders.
- Schedule detail renders for a real seeded schedule.
- Equipment, theatres and alerts render.
- Doctor directory renders.
- Doctor detail renders for a real clinician with an operating list.
- Patient registry renders.
- Patient detail renders for a real patient with a schedule.
- Departments workspace renders with live counts.
- Department search filters to the empty state.
- Department create form opens and closes without submitting.
- Departments has no tablet or mobile overflow.
- Accounts workspace renders.
- Account search filters to the empty state.
- Account create form opens and closes without submitting.
- Accounts has no tablet or mobile overflow.
- Audit ledger renders.
- Audit server filter is applied.
- Audit event inspection opens with actor, IDs and metadata.
- Audit has no tablet or mobile overflow.
- ADMIN reaches `/users`, `/audit`, `/departments` and `/patients`.

### DOCTOR

- Dashboard renders.
- Schedules are reachable.
- Departments are reachable.
- `/users` redirects to `/unauthorized`.
- `/audit` redirects to `/unauthorized`.

### OT_STAFF

- Dashboard renders.
- Theatres are reachable.
- Schedules are reachable.
- Patient registry redirects to `/unauthorized`.
- `/users` redirects to `/unauthorized`.

### PATIENT

- Dashboard renders.
- Appointment book renders and splits visits into upcoming/past groups.
- A real appointment detail renders.
- Appointment book has no mobile overflow.
- `/schedules` redirects to `/unauthorized`.
- `/patients` redirects to `/unauthorized`.

### Interaction and accessibility

- Mobile navigation drawer opens and reports `aria-expanded="true"`.
- `prefers-reduced-motion: reduce` produces `animation-name: none` for the page transition.
- Search control accepts keyboard focus and exposes its focus-within state.
- No page-level horizontal overflow was reported for the tested 390px surfaces.

---

## Runtime authorization harness

Command:

```bash
node scripts/run-runtime-tests.mjs
```

Result: **2/11 passed, 9 failed**. This is not reported as a pass.

The failures are in the pre-existing suite’s expectations, not in the redesigned frontend:

1. Several collection endpoints return the project’s `{ success, data }` envelope, while the test expects a bare array (`toBeInstanceOf(Array)`, `schedules.find`).
2. The test constructs GET requests with a body, which Undici rejects (`Request with GET/HEAD method cannot have body`).
3. Its malformed-ID assertions expect 404 while the current API returns 400.
4. Its OT/patient assertions expect response properties that the current envelope does not expose at the top level.

The redesigned UI reads these existing contracts correctly. Changing the API to satisfy the stale assertions would violate the brief’s requirement to preserve API contracts. Full output is retained in `evidence/runtime-harness-attempt.log`.

Live authorization was therefore verified independently through the real browser under all four roles (see `ROLE_VERIFICATION.md`).

---

## Database state

Current read-only count after verification:

| Entity | Count |
| --- | --- |
| Users | 14 |
| Departments | 4 |
| Doctor profiles | 5 |
| Patients | 12 |
| Operating rooms | 7 |
| Equipment | 10 |
| Schedules | 10 |
| Alerts | 4 |
| Audit logs | 285 |

The latest user and patient records are dated **15 October 2026**, before this verification run. No user or patient was created.

Department, doctor, theatre, equipment and schedule counts remain at the seeded values. The only new rows are **37 append-only `LOGIN` audit events** generated by signing in repeatedly during role verification. These are legitimate audit history and were not deleted; deleting them would falsify the audit trail. Evidence is in `evidence/database-state.log` and `evidence/audit-test-events.log`.

---

## Mutation testing limitation

Create/edit forms were opened and their rendering was verified, but no create/update submission was committed to the development database. Those writes generate permanent audit entries and could not be removed without damaging the audit trail. The existing Stage 3D schedule workflow evidence remains the project’s mutation record.

No database reset, destructive cleanup or seed rerun was performed.

---

## Screenshots

40 screenshots are in `screenshots/`.

Required viewport coverage is represented:

- 1440×900: every module and every detail surface.
- 1024×768: landing, dashboard, departments, users, audit, doctor departments, OT theatres.
- 390×844: landing, login, dashboard, departments, users, audit, patient appointments.

The browser report records the actual width used for each screenshot.

---

## Not executed

- No manual screen-reader session was performed.
- No automated visual-diff baseline exists in the repository.
- No load or performance benchmark was run.
- The pre-existing runtime harness was executed but failed for the contract reasons above and is not counted as a pass.
