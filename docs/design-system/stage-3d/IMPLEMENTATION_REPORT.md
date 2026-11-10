# Stage 3D — Implementation Report

- **Module:** Schedules
- **Route:** `/schedules`
- **Baseline:** `5c01eb0`, which includes the initial Stage 3D workspace and the Stage 3C shell
- **Completed:** 7 November 2026
- **Status:** Implemented and locally verified. No schema, API contract, dependency or shell change.

## 1. Outcome

`/schedules` is now a theatre-day operations workspace rather than a month calendar with a list below it.

The page is server-loaded from real Prisma data and presents:

- one selected local theatre day, with previous/next/today and date-input navigation;
- a seven-day strip with real case counts;
- an overview of procedures, booked/free theatres, live theatre use, pending confirmation and flags;
- a duration-proportional theatre timeline with a real time axis, resource lanes, availability, status tones, a current-time marker and conflict markers;
- a day coordination panel that keeps confirmed conflicts separate from operational warnings;
- a case inspector with procedure, authorized patient reference, surgeon, theatre, times, duration, status, priority, staff, equipment and permitted actions;
- a mobile lane minimap plus chronological agenda, rather than a compressed desktop board;
- ADMIN create, ADMIN/DOCTOR edit and status changes, ADMIN/DOCTOR case-file access, and OT_STAFF read-only assigned cases.

The old list and calendar remain reachable through the internal `/preview/schedules` design preview. They are not duplicated in the production workspace.

## 2. Information architecture

```text
Schedules
├── Day masthead
│   ├── date controls and "Today"
│   ├── day brief: procedures, theatres, in-use, pending, flags
│   └── Refresh; New schedule (ADMIN only)
├── Week at a glance
│   └── seven real dates and case counts
├── Lens
│   └── search, theatre, department, status, priority
├── Theatre day
│   ├── time axis and current-time marker
│   ├── one lane per accessible theatre
│   ├── duration-positioned case blocks
│   └── mobile minimaps + agenda
├── Coordination notes
│   ├── confirmed data conflicts
│   └── operational warnings
└── Case brief
    ├── case facts and privacy-scoped patient reference
    ├── case-specific conflicts
    ├── theatre team and equipment
    ├── clinical notes (ADMIN/DOCTOR; restricted message for OT_STAFF)
    └── status actions, open case file, edit (permitted non-terminal cases)
```

The shell, navigation and public URLs are unchanged.

## 3. Server data boundary

`getScheduleWorkspace(user, range)` is the new server read path.

- It rejects roles outside `ADMIN`, `DOCTOR` and `OT_STAFF`.
- ADMIN/DOCTOR load all schedules in the selected padded week; OT_STAFF load only schedules where they have a `ScheduleStaff` assignment.
- It selects the patient reference (`name`, `patientCode`) only. Contact details, date of birth, gender and medical history are not loaded.
- It includes department, theatre code/name/register status/active flag, surgeon name/status, staff names and roles, and equipment assignment details.
- It redacts `clinicalNotes` for OT_STAFF.
- It loads editable form options only for roles that can create or edit.
- It returns serialized ISO timestamps and explicit capabilities to the client.

The page also uses `requireRole(['ADMIN','DOCTOR','OT_STAFF'])`, matching the existing detail route and closing the former PATIENT dead-end.

Writes stay on the existing contracts:

| Action | Endpoint | Role |
|---|---|---|
| Create | `POST /api/schedules` | ADMIN |
| Edit | `PATCH /api/schedules/[id]` | ADMIN/DOCTOR |
| Status | `PATCH /api/schedules/[id]/status` | ADMIN/DOCTOR |
| Staff | `/api/schedules/[id]/staff…` | ADMIN, through the case file |
| Equipment | `/api/schedules/[id]/equipment…` | ADMIN, through the case file |
| Notes | `/api/schedules/[id]/notes…` | ADMIN/DOCTOR, through the case file |

No request or response shape changed. The workspace projection is additive and server-only.

## 4. Time and placement contract

- Stored `startTime` and `endTime` are the only source of position and duration.
- The browser's local timezone is the display timezone. The interface labels the axis **Local theatre time**.
- Day membership uses local-day intersection, not UTC date slicing.
- The week strip count includes every loaded case intersecting each visible local day, including overnight intersections.
- The axis defaults to 07:00–20:00. A booked day fits its recorded cases with one hour of padding and a four-hour minimum. Today also expands to include the current time. It is clamped to 00:00–24:00.
- Case blocks are clipped to the selected day and sized by actual elapsed minutes.
- The current-time line appears only on today and only when the current minute is within the axis.
- A request without `?date=` is reconciled to the browser's local today. A same-week correction updates the URL without a refetch; a cross-week correction requests the correct server range.
- `scheduledDate` is preserved for form/API compatibility but is not used to position a block.

## 5. Conflict model

`detectScheduleConflicts` is a pure, tested read-only detector over loaded schedules. It uses half-open `[start, end)` overlap, matching the PostgreSQL exclusion constraints.

### Shown as confirmed

- theatre overlap;
- surgeon overlap;
- patient overlap;
- staff member allocated to two overlapping active cases;
- active equipment allocation on two overlapping active cases;
- invalid recorded range (`end <= start`).

### Shown as warnings

- theatre inactive, maintenance or disabled;
- theatre/department mismatch;
- missing or inactive surgeon;
- no staff assigned to an open case.

Cancelled and completed cases are excluded from active allocation conflicts. Released equipment is excluded.

The panel states explicitly that theatre, surgeon and patient ranges are database-constrained, while staff/equipment checks are advisory because the existing server and schema do not enforce those reservations. The UI does not claim a server rule that does not exist.

## 6. Workflow corrections

### Create and edit

`ScheduleForm` now keeps date and time in the browser's local values, defaults a new case to the selected theatre day, lists active surgeon users, disables unavailable theatres with a reason, and rejects an end time at or before the start time before sending a request. Entered values remain after an API conflict.

### Status

`ScheduleStatusActions` now:

- actually executes confirmed actions once, instead of reopening the confirmation branch;
- offers only transitions accepted by the server:
  - SCHEDULED → CONFIRMED, CANCELLED;
  - CONFIRMED → IN_PROGRESS, DELAYED, CANCELLED;
  - IN_PROGRESS → COMPLETED, DELAYED;
  - DELAYED → CONFIRMED, IN_PROGRESS, CANCELLED;
  - COMPLETED/CANCELLED → no actions;
- removes the former invalid DELAYED → COMPLETED action;
- traps focus in the confirmation dialog, focuses the safe action, supports Escape without also closing the case inspector, locks body scroll and restores focus on cancel;
- exposes descriptive accessible names and inline API errors.

Terminal cases hide Edit and status controls. The server remains authoritative and still rejects stale mutations.

### Case file

The inspector links to the existing `/schedules/[id]` for staff, equipment and notes management. Those write surfaces were not duplicated or changed. This keeps one implementation of the existing permissions.

## 7. Role behaviour

| Capability | ADMIN | DOCTOR | OT_STAFF | PATIENT |
|---|:---:|:---:|:---:|:---:|
| Open `/schedules` | yes | yes | yes | no; `/unauthorized` |
| Cases in scope | all | all | assigned only | none |
| Patient reference | name/code | name/code | name/code for assigned cases | none |
| Clinical notes | yes | yes | redacted | none |
| New schedule | yes | no | no | no |
| Edit non-terminal case | yes | yes | no | no |
| Status change | yes | yes | no | no |
| Staff/equipment write | case file | no | no | no |

## 8. Visual and interaction treatment

- Uses the approved Stage 3C clinical tokens and the persistent workspace shell.
- The page background, surface, rule, primary, teal, success, warning and critical tones come from the existing token system.
- The day desk uses a compact masthead, one ruled metrics line, a seven-day strip, a filter band, the timeline and the inspector; it does not repeat generic statistic cards.
- The timeline has readable lane labels, a local-time axis, duration blocks, status rails and text labels. Colour is never the only status signal.
- Maintenance/disabled lanes use a restrained hatched treatment and remain visible so availability is readable.
- Mobile replaces the wide board with lane minimaps and a readable agenda; the week strip is hidden and filters use a two-column layout.
- All interactive surfaces have visible focus rings. Timeline blocks and agenda rows expose `aria-pressed`; date controls and the week strip expose their selected/today state.
- The global `prefers-reduced-motion` rule disables transitions and animations.
- The inspector sticks below the fixed application header at wide widths and scrolls into view above it at narrow widths.

## 9. States

| State | Implementation |
|---|---|
| Loading | `schedules/loading.tsx` mirrors the masthead, filter and timeline geometry inside the shell |
| Empty day | Timeline lanes stay visible with an explicit no-procedures message; date controls remain available |
| Filtered empty | Explains that no cases match the lens and keeps the filter controls |
| Error | `schedules/error.tsx` shows a safe message, optional digest and a reset action inside the shell |
| Form validation | Native required fields plus a form-level `role="alert"` time-range message |
| API conflict | Server message shown inline without clearing the form |
| Read-only role | OT_STAFF sees a scope note, restricted clinical notes and no management controls |

The loading and error boundaries are covered by static render tests, not by live fault injection.

## 10. Engineering constraints honoured

- No Prisma schema or migration change.
- No API contract change.
- No dependency added.
- No authentication or authorization weakening.
- No global shell, navigation, public page or unrelated module redesign.
- No fake production records; mutation checks used disposable records and removed them.
- No commit, push, reset, stash or branch switch.
- No destructive Docker or database command.

## 11. Verification summary

| Check | Result | Evidence |
|---|---|---|
| TypeScript | pass | `evidence/typescript.log` |
| Changed-file ESLint | pass, zero warnings | `evidence/eslint.log` |
| Conflict/axis unit tests | 8/8 pass | `evidence/tests-workspace.log` |
| Loading/error render tests | 2/2 pass | `evidence/tests-states.log` |
| Production build | pass | `evidence/build.log` |
| Rendered browser checks | 13/13 pass | `evidence/browser-schedules-checks.json`, `evidence/capture.log` |
| Create/edit/status workflow | 7/7 pass | `evidence/workflow-checks.json` |
| Live conflict fixture | 3/3 pass | `evidence/conflict-checks.json` |
| Final database state | 10 schedules; no fixtures | `evidence/db-final-state.log` |

Screenshots are in `screenshots/` at 1440×900, 1024×768 and 390×844.

## 12. Remaining limitations

1. **No live loading/error fault injection.** The boundaries are implemented and render-tested, but the development server was not made to fail on demand.
2. **Database-enforced overlaps cannot be created live.** Room, surgeon and patient overlaps are blocked by PostgreSQL exclusion constraints, so those detector paths are covered by unit tests and the schema audit rather than a live conflicting record. The live fixture covers staff and equipment allocations, which have no server rule.
3. **No general date-range API.** `/api/schedules` still has no pagination. The workspace bounds its server read to the selected padded week, but the API-wide scale risk remains for large datasets.
4. **No timezone column.** The workspace consistently uses browser local time and labels it; it cannot persist a per-theatre timezone.
5. **Staff/equipment conflicts are advisory.** The UI labels them as confirmed allocation overlaps in the loaded record, but the API/database does not block them.
6. **Equipment allocation is not time-bounded server-side.** Assignment claims inventory at assignment time; the workspace displays the recorded allocation without redefining that contract.
7. **Theatre register status is not automatically synchronised with schedule status.** The workspace shows the actual case range and treats disagreement as a warning.
8. **Overnight cases are supported by the clipping logic but were not exercised with a live fixture.**
9. **Keyboard behaviours were implemented but not covered by an automated accessibility suite.** The dialogs have focus traps and Escape handling, but no axe or keyboard E2E run is included.
10. **Repo-wide ESLint is not clean.** Seventeen pre-existing unused-symbol warnings were observed in `DepartmentManagement.tsx` and `EquipmentManagement.tsx`; the Stage 3D changed-file lint is clean.
11. **The alternate list/calendar is preview-only.** It remains at `/preview/schedules`; `/schedules` no longer exposes a view toggle.
