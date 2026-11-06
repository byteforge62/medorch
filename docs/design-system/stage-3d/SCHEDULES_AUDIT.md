# Stage 3D — Schedules Audit

- **Date:** 6 November 2026
- **Baseline:** `2fac5ac` plus the uncommitted Stage 3C workspace work
- **Scope:** `/schedules`, `/schedules/[id]`, the schedule service/repository, schedule APIs, Prisma models and the seeded theatre data
- **Method:** source, schema, migration, API and live read-only database inspection. No schema, API or seed changes were made during the audit.

## 1. Executive summary

The Schedules module is structurally complete. It has a real Prisma model, PostgreSQL exclusion constraints for theatre/surgeon/patient overlaps, validated create and update services, status-transition rules, audit writes, staff/equipment relationships, notes, and server-side role checks.

It is not yet a usable theatre-day workspace:

- the default view is a month calendar grouped by day, not a resource timeline;
- theatre availability, procedure duration, current time and conflicts are not visualised;
- the module does not load staff or equipment until a single case detail is opened;
- two existing status workflows are wrong: confirmation-gated actions never call the API, and `DELAYED → COMPLETED` is offered by the UI but rejected by the server;
- the page renders two page headers;
- date grouping and time labels mix UTC and local time;
- `/schedules` admits a PATIENT at the page boundary and then fails on the API permission check.

The Stage 3D redesign therefore has a real information-architecture task, not a colour-only task.

## 2. Sources inspected

| Area | Source |
|---|---|
| Page route | `src/app/(workspace)/schedules/page.tsx` |
| Detail route | `src/app/(workspace)/schedules/[id]/page.tsx` |
| Client workspace | `src/components/schedules/SchedulePage.tsx` |
| Calendar | `src/components/schedules/ScheduleCalendar.tsx` |
| List and rows | `ScheduleList.tsx`, `ScheduleCard.tsx` |
| Filters | `ScheduleFilters.tsx` |
| Create/edit | `ScheduleForm.tsx` |
| Status controls | `ScheduleStatusActions.tsx`, `ScheduleStatusBadge.tsx` |
| Detail | `src/app/(workspace)/schedules/[id]/ScheduleDetails.tsx` |
| Domain | `src/modules/schedules/*` |
| APIs | `src/app/api/schedules/**`, `src/app/api/me/**` |
| Schema | `prisma/schema.prisma` |
| Constraints | `prisma/migrations/20261010224215_schedule_overlap_constraints/migration.sql` |
| Permissions | `src/lib/auth/permission.ts`, `src/lib/auth/authorization.ts`, `src/lib/api/auth.ts` |
| Seed | `prisma/demo-data.ts`, `prisma/seed.ts` |
| Dashboard integration | `src/components/dashboard/admin/*` |

## 3. Current information architecture

### `/schedules`

The server route calls `requireAuth()` and renders a server `PageHeader` followed by the client `SchedulePage`, which renders a second `PageHeader`. The client then:

1. fetches `/api/schedules`, `/api/departments`, `/api/ot-rooms`, and, for ADMIN/DOCTOR, `/api/patients` and `/api/doctors`;
2. exposes a **Calendar/List** toggle, defaulting to Calendar;
3. renders a status-distribution bar, a six-field filter strip, a count line and the chosen view;
4. opens the existing create/edit dialog.

The Calendar is a conventional month grid. It groups cases by UTC calendar date, displays procedure chips with local start/end times, and switches to a day-grouped agenda below `md`. It is not a theatre-lane timeline: there is no horizontal time axis, no duration-proportional block, no current-time marker and no resource-lane availability.

The List is a dense ruled board with status rails, date/time, procedure, patient, department, theatre, surgeon and per-row status controls. It is useful and will be retained as an alternate view.

### `/schedules/[id]`

A server page calls `requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF'])` and renders `ScheduleDetail`. The client fetches the schedule and, for ADMIN only, the user and equipment lists for assignment controls. It provides:

- case facts and status/priority badges;
- status transition controls for ADMIN/DOCTOR;
- clinical notes for ADMIN/DOCTOR;
- staff assignment/removal for ADMIN;
- equipment assignment/release for ADMIN;
- operational notes for ADMIN/DOCTOR, with edit/delete restricted to the note author.

OT_STAFF receives a redacted detail: no clinical notes, no notes, and no patient email, phone, date of birth or gender.

## 4. Data model

`Schedule` stores:

| Field | Meaning |
|---|---|
| `patientId` | Required patient relation |
| `departmentId` | Required department relation |
| `otRoomId` | Required theatre relation |
| `surgeonId` | Required `User` relation (role validated as DOCTOR) |
| `createdById` | Required creator relation |
| `procedure` | Free text, 1–200 characters |
| `scheduledDate` | UTC midnight calendar date from the API validator |
| `startTime`, `endTime` | Absolute `timestamp` values |
| `status` | `SCHEDULED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DELAYED` |
| `priority` | `ELECTIVE`, `URGENT`, `EMERGENCY` |
| `clinicalNotes` | Optional, max 5,000 characters |

Related models:

- `ScheduleStaff`: `scheduleId`, `userId`, `role` (`SURGEON`, `NURSE`, `ANESTHETIST`, `TECHNICIAN`, `OTHER`), `assignedAt`; unique per schedule/user/role.
- `ScheduleEquipment`: `scheduleId`, `equipmentId`, `assignedAt`, `releasedAt`; unique per schedule/equipment.
- `OTRoom`: name, unique code, department, capacity, status (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `DISABLED`), active flag.
- `Equipment`: name, category, serial number, status, department, maintenance date.
- `ScheduleNote`: author-owned operational notes.

There is no timezone field and no duration field. Duration must be derived from `endTime - startTime`. All visual placement must use the stored timestamps.

## 5. Database constraints and domain validation

PostgreSQL exclusion constraints reject overlapping non-terminal (`status NOT IN ('CANCELLED','COMPLETED')`) ranges for:

- the same theatre (`Schedule_no_room_overlap`);
- the same surgeon (`Schedule_no_surgeon_overlap`);
- the same patient (`Schedule_no_patient_overlap`).

The service repeats these checks before writes and reports them as `409` conflicts. It also validates active department, active theatre, theatre/department match, theatre not in maintenance/disabled, active DOCTOR surgeon, and `endTime > startTime`.

There is **no database or service constraint for staff allocation overlaps or equipment allocations**. Equipment assignment is a global status claim (`AVAILABLE → IN_USE`), not a time-bounded reservation.

### Status transitions

Server rules:

| Current | Allowed next |
|---|---|
| SCHEDULED | CONFIRMED, CANCELLED |
| CONFIRMED | IN_PROGRESS, DELAYED, CANCELLED |
| IN_PROGRESS | COMPLETED, DELAYED |
| DELAYED | CONFIRMED, IN_PROGRESS, CANCELLED |
| COMPLETED | — |
| CANCELLED | — |

A concurrent status update is guarded with `updateMany` on the expected status and returns `SCHEDULE_STATUS_CONFLICT` if another actor won.

## 6. API inventory and permissions

| Endpoint | Methods | Server permission | Behaviour |
|---|---|---|---|
| `/api/schedules` | GET | `schedules:read` | All schedules for ADMIN/DOCTOR; assigned schedules only for OT_STAFF, with clinical notes nulled |
| `/api/schedules` | POST | `schedules:create` | ADMIN only; full service validation; `200` response |
| `/api/schedules/[id]` | GET | `schedules:read` | OT_STAFF must be assigned; OT_STAFF detail is redacted |
| `/api/schedules/[id]` | PATCH | `schedules:manage` | ADMIN/DOCTOR; terminal schedules immutable |
| `/api/schedules/[id]/status` | PATCH | `schedules:manage` | ADMIN/DOCTOR; transition validation |
| `/api/schedules/[id]/staff` | GET | `schedules:read` | OT_STAFF must be assigned |
| `/api/schedules/[id]/staff` | POST | `schedules:staff:manage` | ADMIN only |
| `/api/schedules/[id]/staff/[staffId]` | DELETE | `schedules:staff:manage` | ADMIN only |
| `/api/schedules/[id]/equipment` | GET | `schedules:read` | OT_STAFF must be assigned |
| `/api/schedules/[id]/equipment` | POST | `schedules:equipment:manage` | ADMIN only |
| `/api/schedules/[id]/equipment/[equipmentId]` | PATCH | `schedules:equipment:manage` | ADMIN only; assignment-level ID |
| `/api/schedules/[id]/notes` | GET/POST | `schedules:notes:manage` | ADMIN/DOCTOR |
| `/api/schedules/[id]/notes/[noteId]` | PATCH/DELETE | `schedules:notes:manage` | ADMIN/DOCTOR; author-only mutation |
| `/api/me/schedules` | GET | `schedules:read:own` | PATIENT's own appointments |
| `/api/me/staff-schedules` | GET | role restricted | OT_STAFF only |

Capabilities used by the redesign:

- ADMIN: read, create, edit, status, staff, equipment, notes.
- DOCTOR: read, edit, status, notes; no create, staff or equipment management.
- OT_STAFF: read assigned schedules and detail with redaction; no writes.
- PATIENT: no Schedules module; own appointments through `/patients/appointments`.

## 7. Current seeded state

The live development database contains **10 schedules** and **7 theatres**:

| Status | Count |
|---|---:|
| COMPLETED | 4 |
| CONFIRMED | 1 |
| IN_PROGRESS | 1 |
| DELAYED | 1 |
| SCHEDULED | 2 |
| CANCELLED | 1 |

Theatres: seven rows across four departments, including one `MAINTENANCE` room and one inactive `DISABLED` room. The today fixtures are an Appendectomy (General OT 01) and a Fracture Fixation (Orthopedic OT 01); the working data is non-overlapping by design.

The seed writes `scheduledDate` and `startTime` as UTC values. The browser and shell clock are local. On the development machine (IST), the seeded `09:00Z` case therefore displays at `14:30` local while the UTC-based calendar groups it under the original UTC date. This is a real inconsistency, not fabricated data.

## 8. Findings

| # | Severity | Finding | Stage 3D disposition |
|---|---|---|---|
| 1 | High | The month calendar cannot express theatre lanes, actual duration or current time. | Replace as the primary view with a day timeline; retain the list as an alternate. |
| 2 | Critical | `ScheduleStatusActions` confirmation actions never submit: `onConfirm` calls `activateAction`, which re-opens the confirmation branch, then clears it. Cancel/Complete actions are effectively no-ops. | Fix the action executor and test all transition paths. |
| 3 | High | The UI offers `DELAYED → COMPLETED`, but the server's allowed transitions reject it. | Remove the invalid action from the UI; keep server rules. |
| 4 | High | `/schedules` uses `requireAuth` only. A PATIENT reaches the page but `/api/schedules` returns 403, exposing an error workspace instead of the unauthorized boundary. | Gate the page to ADMIN, DOCTOR, OT_STAFF, matching the API permission. |
| 5 | Medium | The server page renders a `PageHeader` and `SchedulePage` renders a second one. | Render one module masthead. |
| 6 | High | No conflict visibility in the module. The API/database prevents room, surgeon and patient overlaps, but staff/equipment overlaps are unguarded and no UI reports warnings. | Add read-only conflict detection for accessible data, clearly separating confirmed and warning conditions. |
| 7 | Medium | The list API omits staff and equipment, so a workspace cannot evaluate all resources without N detail requests. | Add a server-side workspace read projection; keep the public API response contract unchanged. |
| 8 | Medium | The current list lets ADMIN/DOCTOR open Edit on COMPLETED/CANCELLED cases, but PATCH rejects them. | Hide edit for terminal cases and explain the immutable state. |
| 9 | Medium | Date grouping uses UTC (`toISOString`) while times use local formatting. There is no timezone field. | Use one documented local-time convention for the workspace and label it; record the limitation. |
| 10 | Medium | OTRoom.status is not automatically updated when a schedule changes status, and seeded fixtures do not always reflect live cases. | Treat the room register and the schedule day as separate facts; flag disagreement as a warning, never silently rewrite it. |
| 11 | Low | The detail page's retry uses `window.location.reload`, losing client context. | Leave detail route intact; use router refresh for the workspace. |
| 12 | Low | The current calendar's mobile agenda is a day list without lanes. | Provide a dedicated mobile theatre board, not a shrunken desktop grid. |
| 13 | Limitation | Staff and equipment allocations are not checked for time overlap by the server or database. | Detect and label them in the workspace; do not invent a blocking rule. |
| 14 | Limitation | Equipment assignment claims equipment immediately, independent of the scheduled date. | Surface allocations as recorded; do not change the allocation contract. |
| 15 | Limitation | No pagination or date-range API. The module loads all accessible schedules. | Accept for the current 10-record development dataset; record scale risk. |

## 9. Preserved behaviour

- Existing `/schedules` and `/schedules/[id]` public URLs.
- Stage 3C persistent workspace shell and approved clinical tokens.
- ADMIN create; ADMIN/DOCTOR edit and status; ADMIN staff/equipment; ADMIN/DOCTOR notes.
- OT_STAFF assigned-only list and redacted detail.
- PATIENT boundary through appointments, not the Schedules workspace.
- Existing API contracts and request/response shapes.
- PostgreSQL overlap constraints and audit writes.
- Prisma schema, seed data, role permissions and public/marketing pages.

## 10. Audit conclusion

The module needs a dedicated theatre-day information architecture, a correct interactive status workflow, a conflict layer that does not overclaim server enforcement, and one consistent local-time presentation. The existing data and APIs support all of that without a schema change or new dependency.
