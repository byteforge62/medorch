# Stage 3D — Functional Test Report

- **Test date:** 7 November 2026
- **Application:** local Next.js development server at `http://localhost:3000`
- **Test theatre day:** 6 November 2026 (`?date=2026-11-06`)
- **Database:** seeded development PostgreSQL database, 10 schedules
- **Browser:** packaged Chromium through the desktop preview connection
- **Result:** all executed Stage 3D checks passed. The untested and structurally blocked cases are listed in §10.

## 1. Scope and method

Checks were executed against the real route, real Prisma data, real session authentication and the existing schedule APIs. No route was mocked.

- Interface checks used the browser DOM and role-specific sign-ins.
- Mutation checks used a disposable schedule created through the existing form/API and removed afterward.
- Conflict visibility used two disposable schedules with overlapping staff and equipment allocations, then removed both.
- Final database state was read directly after all tests and after the production build.

Evidence is in `evidence/`; screenshots are in `screenshots/`.

## 2. Static and automated checks

| Check | Command | Result | Evidence |
|---|---|---|:---:|
| TypeScript | `npx tsc --noEmit` | pass, no output | `evidence/typescript.log` |
| Changed-file ESLint | `npx eslint --max-warnings=0 <9 Stage 3D files>` | pass, zero warnings | `evidence/eslint.log` |
| Conflict/axis tests | `node --import tsx --test tests/schedule-workspace.test.ts` | 8 pass, 0 fail | `evidence/tests-workspace.log` |
| State render tests | `node --import tsx --test tests/schedule-workspace-states.test.tsx` | 2 pass, 0 fail | `evidence/tests-states.log` |
| Production build | `npm run build` | pass, 49/49 static pages, `/schedules` dynamic | `evidence/build.log` |

The unit tests cover:

1. half-open ranges touching without overlapping;
2. theatre, surgeon and patient double-bookings;
3. staff and unreleased-equipment double-allocations;
4. released equipment exclusion;
5. cancelled/completed exclusion from active conflicts;
6. unavailable-theatre, inactive-surgeon and unassigned-staff warnings;
7. booked-day axis fitting and empty-day default axis;
8. invalid time ranges.

The render tests cover the accessible loading busy state and the error boundary's retry/exit actions. These are static render tests, not live fault injection.

## 3. Browser interface checks — 13/13 pass

Source: `evidence/browser-schedules-checks.json`, `evidence/capture.log`.

| # | Check | Observed | Result |
|---|---|---|---|
| 1 | ADMIN loads the theatre day | 6 lanes, 2 positioned blocks, coordination panel present | pass |
| 2 | ADMIN sees the create action | New schedule present | pass |
| 3 | Date navigation | 2026-11-06 → 2026-11-07 | pass |
| 4 | Theatre selection | Board narrows to one room and one block; lens state visible | pass |
| 5 | Case detail | Patient, surgeon, theatre, team, equipment, status and Edit present | pass |
| 6 | Create dialog | Title, date, patient and procedure fields present | pass |
| 7 | Tablet board | Timeline and agenda present at 1024 px; body width 1024, no page overflow | pass |
| 8 | Mobile board | Agenda visible, desktop board hidden at 390 px; body width 390, no page overflow | pass |
| 9 | Empty day | Explicit empty message and 6 theatre lanes remain | pass |
| 10 | Current-time marker | “Now” marker present on today with an outlying case | pass |
| 11 | DOCTOR scope | 2 blocks, no New schedule, Edit and status controls present | pass |
| 12 | OT_STAFF scope | 2 assigned blocks, no create/edit, assigned-only note, clinical notes restricted | pass |
| 13 | PATIENT boundary | Redirect to `/unauthorized` | pass |

The canonical capture was rerun after the final layout changes. It produced the 13 screenshots listed in `capture.log`; the workflow and conflict fixtures contribute five additional screenshots.

## 4. Schedule management workflow — 7/7 pass

Source: `evidence/workflow-checks.json`.

A disposable schedule was created with marker **“Stage 3D verification case”**.

| # | Check | Observed | Result |
|---|---|---|---|
| 1 | Validation failure | End time before start time produced “End time must be after start time.”, form stayed open, schedule count remained 10 | pass |
| 2 | ADMIN create | Record created through the form/API with `SCHEDULED`, patient Aarav Mehta, Dr. Ananya Shah, `DEMO-GEN-01` | pass |
| 3 | New case on board | Created case appeared on the timeline with its selected resources | pass |
| 4 | ADMIN edit | Procedure updated to “Stage 3D verification case edited” | pass |
| 5 | DOCTOR status | Status changed to `CONFIRMED` through the inspector | pass |
| 6 | ADMIN cancel | Status became `CANCELLED`; Edit and status controls disappeared | pass |
| 7 | Cleanup | Disposable ID removed; count 10 before and after; status distribution identical | pass |

The workflow screenshots are:

- `admin-schedule-create-filled-1440.png`
- `admin-created-case-1440.png`
- `doctor-confirmed-case-1440.png`
- `admin-cancelled-case-1440.png`

## 5. Conflict fixture — 3/3 pass

Source: `evidence/conflict-checks.json`.

Two disposable cases on 10 November 2026 were placed in different theatres, with different surgeons and patients, but with the same staff member and the same active equipment allocation.

| # | Check | Observed | Result |
|---|---|---|---|
| 1 | Live coordination panel | 2 confirmed conflicts, 0 warnings; both staff and equipment double-allocation rows present | pass |
| 2 | Affected case brief | Clicking a confirmed row opened the affected case with its conflicts | pass |
| 3 | Cleanup | Both fixtures removed; schedule count 10 before and after | pass |

Screenshot: `admin-schedules-conflicts-1440.png`.

The panel showed the advisory footnote: staff/equipment overlaps are not blocked by the current API.

## 6. Role verification

| Role | Account | Result |
|---|---|---|
| ADMIN | `admin@medorch.local` | Full workspace; create, edit, status, cancel, resources, notes; live workflow passed |
| DOCTOR | `ananya.shah@demo.medorch.local` | Read all cases; Edit/status; no create; live confirm passed |
| OT_STAFF | `kavya.nurse@demo.medorch.local` | Assigned cases only; no management actions; clinical notes restricted |
| PATIENT | `aarav.mehta@demo.medorch.local` | `/schedules` redirected to `/unauthorized` |

The OT_STAFF list was checked for assigned-only scope and the clinical-notes restriction. The API-level role checks were not weakened.

## 7. Visual verification

Exact image dimensions were read from each PNG header:

| View | Files | Size |
|---|---|---|
| Desktop | `admin-schedules-1440.png`, detail, create, today, empty, conflicts, doctor, OT, patient | 1440×900 |
| Tablet | `admin-schedules-1024.png`, `admin-schedules-1024-board.png` | 1024×768 |
| Mobile | `admin-schedules-390-top.png`, `admin-schedules-390.png` | 390×844 |

Observed:

- desktop timeline lane labels and duration blocks are readable;
- the today view displays the red “Now” line inside the axis;
- the mobile view uses lane minimaps and an agenda with no page-level horizontal overflow;
- the conflict view shows two red confirmed rows and the affected case brief;
- the persistent shell remains visible across roles and date navigation;
- terminal cases show no Edit action;
- the empty day keeps theatre availability visible.

The screenshots were reviewed after the final capture. No visual defect requiring redesign was observed. The screenshot set is a visual record, not an exhaustive interaction test.

## 8. Database restoration

Source: `evidence/db-final-state.log`.

Final direct Prisma read after all tests and the production build:

```text
count: 10
CANCELLED: 1
COMPLETED: 4
CONFIRMED: 1
IN_PROGRESS: 1
DELAYED: 1
SCHEDULED: 2
fixtures: []
```

The seeded 6 November cases remained:

| Procedure | Status | Start | End |
|---|---|---|---|
| Appendectomy | CONFIRMED | 2026-11-06T09:00:00Z (14:30 local) | 2026-11-06T10:30:00Z (16:00 local) |
| Fracture Fixation | IN_PROGRESS | 2026-11-06T13:00:00Z (18:30 local) | 2026-11-06T15:00:00Z (20:30 local) |

The counts and status distribution match the pre-test baseline. No Stage 3D fixture procedure remains.

## 9. Requirement coverage

| Requirement | Status | Basis |
|---|---|---|
| Schedules page audit before implementation | done | `SCHEDULES_AUDIT.md` |
| Date and week navigation | verified | browser check 3; screenshots |
| Theatre lanes and actual time axis | verified | browser checks 1, 4; timeline source; screenshots |
| Duration represented from real times | verified | unit test 7; timeline source; screenshots |
| Availability visible | verified | browser checks 1, 9; lane states |
| Current-time indicator | verified | browser check 10 |
| Schedule selection and detail | verified | browser check 5 |
| Authorized patient reference only | verified | server projection; inspector source; role check 12 |
| Staff and equipment shown | verified | browser check 5; detail screenshots |
| Confirmed conflicts vs warnings | verified | unit tests 1–6, 8; conflict fixture 1–2 |
| Create, edit, cancel, status | verified | workflow checks 1–6 |
| Terminal actions hidden | verified | workflow check 6 |
| Non-authorized actions hidden | verified | browser checks 11–13 |
| Loading state | implemented; render-tested only | state test 1 |
| Error state | implemented; render-tested only | state test 2 |
| Empty state | verified live | browser check 9 |
| Validation failure | verified live | workflow check 1 |
| Responsive 1440/1024/390 | verified | browser checks 1, 7, 8; screenshots |
| Persistent shell | observed | role/date screenshots; no separate automated assertion |
| Unauthorized access | verified | browser check 13 |
| Disposable records and DB restoration | verified | workflow cleanup; conflict cleanup; final DB log |
| TypeScript / changed-file ESLint / build | verified | logs listed in §2 |
| No schema/API/dependency/shell change | verified by diff and source review | change manifest |
| Screenshots and evidence | delivered | `screenshots/`, `evidence/` |

## 10. Limitations and checks not run

1. **Loading and error were not fault-injected live.** Only the static render tests executed.
2. **Theatre, surgeon and patient overlaps could not be created live.** PostgreSQL exclusion constraints reject them. Their detector paths are covered by unit tests and the audit of the constraints, not a live conflicting record.
3. **No automated accessibility audit.** Focus traps, Escape handling, labels and reduced-motion support are implemented, but no axe run or keyboard E2E suite was executed.
4. **Escape-from-confirmation was not exercised live.** The stop-propagation fix is present in source; this interaction was not part of the final browser script.
5. **No live overnight-case fixture.** Clipping logic is implemented and covered indirectly by the day-bound helpers, but no case crossing midnight was created.
6. **No pagination or date-range API test.** The workspace bounds its server read to a padded week; `/api/schedules` remains unpaginated.
7. **Staff/equipment/notes writes were not retested.** Those existing case-file surfaces were left unchanged and are linked from the inspector.
8. **Repo-wide ESLint is not clean.** Pre-existing unused-symbol warnings remain in `DepartmentManagement.tsx` and `EquipmentManagement.tsx`; Stage 3D targeted lint passes with zero warnings.
9. **The preview list/calendar is not part of the production workspace.** It remains available at `/preview/schedules`.
