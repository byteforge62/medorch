# Stage 3D — Schedules Architecture

## 1. Design goal

The Schedules section becomes a **theatre-day desk**: one selected date, every accessible theatre as a resource lane, procedures placed on a real time axis, and a case inspector that exposes the operational record without leaving the workspace. The month calendar is no longer the primary view.

The shell, navigation and public URLs are unchanged. The page remains inside the Stage 3C `(workspace)` layout, and section navigation still uses `next/link`.

## 2. Information architecture

```
Schedules
├── Day masthead
│   ├── date navigation (previous day / date input / next day / today)
│   ├── day brief (procedures, theatres booked/free, pending, conflicts)
│   └── actions (Refresh; New schedule for ADMIN)
├── Week strip
│   └── seven real dates with procedure counts; selecting a day moves the desk
├── Coordination band
│   ├── confirmed conflicts (resource overlaps, invalid times)
│   └── warnings (unavailable theatre, department mismatch, missing resources)
├── Theatre day
│   ├── toolbar (search, department, theatre, status, priority)
│   ├── desktop time axis + resource lanes + duration blocks + now line
│   └── mobile lane minimaps + chronological agenda
├── Case inspector
│   ├── case facts, patient reference, surgeon, theatre, duration, status
│   ├── assigned staff and equipment
│   ├── selected-case conflicts
│   └── actions (status; edit; open full record)
```

The timeline and day agenda are the primary views. The previous month calendar and ruled list remain available only on the internal `/preview/schedules` design preview; they are not duplicated inside the production Schedules route. Staff, equipment and notes management continue through the existing `/schedules/[id]` case file.

## 3. Component structure

| Component | Responsibility |
|---|---|
| `src/app/(workspace)/schedules/page.tsx` | Server role gate, data load, render workspace |
| `schedule-workspace.service.ts` | Server-only read projection with role-aware redaction and form options |
| `SchedulesWorkspace.tsx` | Client state: selected date, filters, selection, form, refresh |
| `ScheduleDayHeader.tsx` | Date controls, day brief, primary actions |
| `ScheduleWeekStrip.tsx` | Seven-day real-data navigation strip |
| `ScheduleTimeline.tsx` | Time axis, theatre lanes, blocks, now marker, mobile minimaps |
| `ScheduleConflictPanel.tsx` | Confirmed conflicts and operational warnings |
| `ScheduleInspector.tsx` | Selected case record and permitted actions |
| `schedule-conflicts.ts` | Pure conflict/warning detector, testable without a database |
| `schedule-workspace-format.ts` | One local-time formatting/duration/axis contract |
| `ScheduleToolbar.tsx` | Search, theatre, department, status and priority filters over the loaded day |
| `ScheduleForm.tsx` | Existing create/edit workflow; improved dialog semantics and default date |
| `ScheduleStatusActions.tsx` | Existing status workflow; confirmation executor corrected |
| `ScheduleStatusBadge.tsx` | Existing status/priority labels retained |
| `ScheduleList.tsx` / `ScheduleCard.tsx` | Retained for internal preview; terminal cases hide Edit |
| `ScheduleCalendar.tsx` | Retained for internal preview only; no fabricated month data added |

## 4. Server data boundary

`getScheduleWorkspace(session.user)`:

1. verifies the user is ADMIN, DOCTOR or OT_STAFF;
2. loads accessible schedules in one projection:
   - ADMIN/DOCTOR: all schedules;
   - OT_STAFF: only schedules where the user has a `ScheduleStaff` assignment;
3. includes patient reference (`name`, `patientCode`), department, theatre (`name`, `code`, register status, active flag, department), surgeon name, staff names/roles and equipment assignments;
4. redacts `clinicalNotes` to `null` for OT_STAFF and never selects patient contact/demographic fields;
5. loads active theatre register and department filters;
6. loads patient/doctor options only for ADMIN/DOCTOR because only those roles can edit or create;
7. returns plain ISO strings to the client.

Writes continue through the existing APIs:

- create: `POST /api/schedules` (ADMIN);
- edit: `PATCH /api/schedules/[id]` (ADMIN/DOCTOR);
- status: `PATCH /api/schedules/[id]/status` (ADMIN/DOCTOR);
- staff/equipment: existing detail page endpoints (ADMIN);
- notes: existing detail page endpoints (ADMIN/DOCTOR, author-owned).

No API response shape is changed. The new server read projection is an additive read path for the page.

## 5. Roles and capabilities

| Capability | ADMIN | DOCTOR | OT_STAFF | PATIENT |
|---|:---:|:---:|:---:|:---:|
| Reach `/schedules` | yes | yes | yes | no — `/unauthorized` |
| See all schedules | yes | yes | assigned only | no |
| See patient reference | name/code | name/code | assigned name/code | no |
| See clinical notes | yes | yes | no | no |
| Create | yes | no | no | no |
| Edit | yes | yes | no | no |
| Status transitions | yes | yes | no | no |
| Staff/equipment assignment | yes (detail) | no | no | no |
| Notes | yes | yes | no | no |

The page gate is `requireRole(['ADMIN','DOCTOR','OT_STAFF'])`, the same set already used by `/schedules/[id]`. This closes the PATIENT 403 dead-end without weakening any permission.

## 6. Time contract

- The database stores absolute timestamps. There is no timezone column.
- The workspace uses the browser's local timezone consistently for:
  - day keys and week strip;
  - date grouping;
  - axis placement;
  - displayed start/end times;
  - current-time marker;
  - form date/time values.
- The UI labels the timeline **Local theatre time** so the reading is explicit.
- `scheduledDate` is retained as stored, but day grouping is derived from `startTime` in local time. This removes the previous UTC/local split.
- Overnight cases are included in both days they overlap and their visual block is clamped to the selected day's bounds.
- Duration is always `endTime - startTime`; no arbitrary block lengths.
- Axis default is 07:00–20:00. On a booked day it fits the recorded cases with one hour of padding (minimum four hours). On today it also expands to include the current time, clamped to 00:00–24:00.
- The current-time marker appears only when the selected local date is today and the current minute falls within the axis.

## 7. Conflict model

Conflict detection is **read-only** for Stage 3D. It does not add a blocking rule.

### Confirmed

- Theatre range overlap between two non-terminal schedules.
- Surgeon range overlap.
- Patient range overlap.
- Staff user allocated to overlapping non-terminal schedules.
- Equipment assignment active on overlapping non-terminal schedules.
- Invalid time range (`end <= start`).

### Warning

- Theatre inactive, disabled or in maintenance while a non-terminal case is booked.
- Theatre belongs to a different department than the schedule.
- Missing theatre or surgeon.
- No staff assigned to an open case.

Confirmed and warning conditions are shown separately and never combined into a false "conflict count". The module explicitly states that the server/database enforce theatre, surgeon and patient overlaps, while staff/equipment findings are advisory because that logic does not exist server-side.

Overlaps are half-open `[start, end)`, matching the PostgreSQL `tsrange(...,'[)')` constraints.

## 8. Status workflow

The client offers only transitions the server accepts:

| Current | Offered |
|---|---|
| SCHEDULED | Confirm, Cancel |
| CONFIRMED | Start procedure, Mark delayed, Cancel |
| IN_PROGRESS | Mark complete, Mark delayed |
| DELAYED | Reconfirm, Resume, Cancel |
| COMPLETED | none |
| CANCELLED | none |

`DELAYED → COMPLETED` is removed because the server rejects it.

The confirmation dialog is corrected so that "Confirm" executes the API call exactly once. It closes on success, reports failure inline, traps initial focus, supports Escape, and restores focus to the invoking control where practical.

Terminal cases hide Edit; the server remains the authority and returns `409` if a stale client attempts a mutation.

## 9. Responsive behavior

- **1440 × 900:** full time axis with all theatre lanes, inspector in a right column.
- **1024 × 768:** full timeline with internal horizontal scrolling if required; inspector stacks below.
- **390 × 844:** compact day header, hidden week strip (date controls remain), two-column filters, full-width lane minimaps with exact block positions, chronological agenda, inspector stacked below. No page-level horizontal overflow.
- Timeline itself may scroll horizontally at narrow widths; that scroll is contained and labelled.

## 10. Accessibility and motion

- Native buttons, inputs and selects for all controls.
- `aria-pressed` on timeline blocks and agenda rows.
- `aria-current="date"` on the selected week-strip day.
- Accessible names include procedure, time range, theatre and status.
- Status is conveyed by text plus colour; conflicts are labelled "Confirmed" or "Warning", not by red alone.
- Visible focus rings on all interactive surfaces.
- Form dialog has `role="dialog"`, `aria-modal`, `aria-labelledby`, labelled fields, initial focus, a Tab trap and Escape close.
- Confirmation dialog has `role="dialog"`, an accessible name, initial focus on the safe action, a Tab trap, Escape support, body scroll lock and visible text.
- All transitions are state-driven; the existing global `prefers-reduced-motion` rules disable them.

## 11. Loading, empty and error states

| State | Surface |
|---|---|
| Route loading | `schedules/loading.tsx` mirrors the masthead and timeline geometry, within the persistent shell |
| Empty day | Timeline and agenda remain usable; explicit "No procedures on this date" message; date controls stay available |
| No filter matches | Explicit filtered-empty message and clear-filters action |
| Loader failure | `schedules/error.tsx` with a safe generic message, optional digest reference and a reset action inside the workspace shell |
| Form validation | Form-level time-range message with `role="alert"`; native required fields stay in place |
| API conflict | Existing 409 message displayed without discarding entered form values |

## 12. Non-goals

- No Prisma schema change.
- No new dependency.
- No change to global shell/sidebar/header.
- No change to public landing/auth pages.
- No change to API request/response contracts.
- No automatic room/equipment status mutation.
- No invented calendar data, patient records or conflict rules.
- No new route URLs; existing `/schedules` and `/schedules/[id]` remain.
