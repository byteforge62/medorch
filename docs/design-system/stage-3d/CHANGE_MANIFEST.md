# Stage 3D — Change Manifest

- **Module:** Schedules
- **Repository:** `C:\Users\patel\Desktop\medorch`
- **Baseline commit:** `5c01eb0 feat: add schedule workspace functionality with conflict detection and management`
- **Working tree:** changes are present but uncommitted; no commit, push, reset, stash or branch switch was performed.
- **Schema / API / dependency impact:** none.

## 1. Scope note

`5c01eb0` bundles the Stage 3C workspace shell/route migration with the initial Stage 3D schedule workspace. This manifest claims only the Schedules module and its Stage 3D documentation, tests, evidence and screenshots. The Stage 3C shell, navigation, global token/route moves and unrelated modules in the same commit are not claimed as Stage 3D changes.

The final working tree contains additional Stage 3D refinements after that commit: corrected singular filter count, header-safe inspector scrolling, week counts using actual day intersection, and confirmation-dialog Escape propagation. All are listed below.

## 2. Application source

### Added

| File | Purpose |
|---|---|
| `src/app/(workspace)/schedules/page.tsx` | Server role gate, validated `?date=`, padded week range, server workspace load |
| `src/app/(workspace)/schedules/loading.tsx` | Route-level loading geometry inside the persistent shell |
| `src/app/(workspace)/schedules/error.tsx` | Route-level error boundary with reset and safe exit |
| `src/components/schedules/SchedulesWorkspace.tsx` | Client state, local day/week reconciliation, filters, selection, refresh, form |
| `src/components/schedules/ScheduleDayHeader.tsx` | Date controls, day brief, Refresh and ADMIN create action |
| `src/components/schedules/ScheduleWeekStrip.tsx` | Seven-day real-data navigation and case counts |
| `src/components/schedules/ScheduleTimeline.tsx` | Time axis, theatre lanes, duration blocks, now line, mobile minimaps/agenda |
| `src/components/schedules/ScheduleToolbar.tsx` | Search, theatre, department, status and priority filters |
| `src/components/schedules/ScheduleConflictPanel.tsx` | Confirmed conflicts separated from operational warnings |
| `src/components/schedules/ScheduleInspector.tsx` | Case facts, authorized patient reference, staff, equipment, notes, actions |
| `src/components/schedules/schedule-workspace-format.ts` | Local date/time, duration, day clipping, week, axis and label helpers |
| `src/modules/schedules/schedule-conflicts.ts` | Pure half-open overlap and warning detector |
| `src/modules/schedules/schedule-workspace.service.ts` | Server-only role-scoped read projection and redaction |
| `src/modules/schedules/schedule-workspace.types.ts` | Workspace projections and capability types |

### Modified

| File | Change |
|---|---|
| `src/components/schedules/ScheduleForm.tsx` | Local date/time values, selected-day default, active doctor list, unavailable-theatre disabling, validation, dialog keyboard semantics |
| `src/components/schedules/ScheduleStatusActions.tsx` | Fixed confirmed-action execution, corrected transitions, focus trap/Escape/body lock, accessible labels, error handling |
| `src/components/schedules/ScheduleCard.tsx` | Local date/time display, nullable relation safety, terminal Edit hidden |
| `src/modules/schedules/schedule.repository.ts` | Scoped/range-limited workspace projection with staff and equipment |

### Refined after `5c01eb0`

| File | Refinement |
|---|---|
| `ScheduleToolbar.tsx` | Singular “1 of 1 procedure” reading |
| `SchedulesWorkspace.tsx` | Inspector offset below fixed header; week count by day intersection; final layout |
| `ScheduleWeekStrip.tsx` | Final selected/today/count presentation |
| `ScheduleDayHeader.tsx` | Final day brief and navigation presentation |
| `ScheduleTimeline.tsx` | Final lane/axis/block and mobile presentation |
| `ScheduleStatusActions.tsx` | Escape in confirmation no longer bubbles to close the case inspector |
| `schedule-workspace-format.ts` | Final local-time/axis helpers |

## 3. Tests

| File | Coverage |
|---|---|
| `tests/schedule-workspace.test.ts` | 8 tests: half-open overlap, resource conflicts, released equipment, terminal exclusion, warnings, axis, invalid time |
| `tests/schedule-workspace-states.test.tsx` | 2 tests: loading boundary, error boundary |

## 4. Documentation

| File | Status |
|---|---|
| `docs/design-system/stage-3d/SCHEDULES_AUDIT.md` | Added before implementation composition |
| `docs/design-system/stage-3d/SCHEDULES_ARCHITECTURE.md` | Added; updated to match final view/API/time behaviour |
| `docs/design-system/stage-3d/DATA_MAPPING.md` | Added; updated for final week/axis behaviour and scale limit |
| `docs/design-system/stage-3d/IMPLEMENTATION_REPORT.md` | Added |
| `docs/design-system/stage-3d/FUNCTIONAL_TEST_REPORT.md` | Added |
| `docs/design-system/stage-3d/CHANGE_MANIFEST.md` | Added |

## 5. Evidence

| File | Contents |
|---|---|
| `evidence/capture-stage3d.mjs` | Browser/CDP capture and 13 rendered checks |
| `evidence/verify-workflows.mjs` | Disposable create/edit/status/cancel workflow and cleanup |
| `evidence/verify-conflicts.mjs` | Disposable staff/equipment conflict fixture and cleanup |
| `evidence/browser-schedules-checks.json` | 13/13 browser checks |
| `evidence/workflow-checks.json` | 7/7 workflow checks and before/after cleanup |
| `evidence/conflict-checks.json` | 3/3 conflict checks and cleanup |
| `evidence/capture.log` | Final capture pass and screenshot paths |
| `evidence/typescript.log` | TypeScript pass |
| `evidence/eslint.log` | Changed-file ESLint pass, zero warnings |
| `evidence/tests-workspace.log` | 8/8 unit tests |
| `evidence/tests-states.log` | 2/2 state render tests |
| `evidence/build.log` | Production build pass |
| `evidence/db-final-state.log` | 10 schedules, status distribution, no fixtures, seeded day |
| `evidence/dev-server.log` | Development server activity during checks; server stopped afterward |

## 6. Screenshots

All images are in `docs/design-system/stage-3d/screenshots/`.

### 1440×900

- `admin-schedules-1440.png`
- `admin-schedule-detail-1440.png`
- `admin-schedule-detail-resources-1440.png`
- `admin-schedule-create-1440.png`
- `admin-schedule-create-filled-1440.png`
- `admin-created-case-1440.png`
- `doctor-confirmed-case-1440.png`
- `admin-cancelled-case-1440.png`
- `admin-schedules-empty-1440.png`
- `admin-schedules-today-1440.png`
- `admin-schedules-conflicts-1440.png`
- `doctor-schedules-1440.png`
- `ot-staff-schedules-1440.png`
- `patient-unauthorized-1440.png`

### 1024×768

- `admin-schedules-1024.png`
- `admin-schedules-1024-board.png`

### 390×844

- `admin-schedules-390-top.png`
- `admin-schedules-390.png`

## 7. Explicitly unchanged

- `prisma/schema.prisma` and migrations.
- Schedule API routes and request/response contracts.
- Authentication, session and role permission modules.
- Global workspace layout, sidebar and header.
- Public landing/auth/unauthorized pages.
- Department, doctor, patient, equipment, theatre and audit modules.
- `package.json`, lockfile and dependencies.
- `/schedules/[id]` staff, equipment and notes write surfaces (linked, not duplicated).
- Production/dev database rows after cleanup: 10 schedules, baseline status distribution.
