# Stage 3D — Data Mapping

## 1. Ground rules

- All schedule data comes from the existing Prisma `Schedule` model and its relations.
- The workspace does not synthesize procedures, patients, staff, equipment, rooms or history.
- `startTime`/`endTime` are the only source of temporal position and duration.
- `scheduledDate` is preserved but is not used as a substitute for the actual start time when placing a block.
- No database field, enum, relation or API response shape is changed by Stage 3D.

## 2. Schedule projection

### Prisma source

| UI field | Prisma source | Notes |
|---|---|---|
| `id` | `Schedule.id` | UUID; route and mutation key |
| `patientId` | `Schedule.patientId` | Never used to fabricate a patient |
| `departmentId` | `Schedule.departmentId` | Used for filter and mismatch warning |
| `otRoomId` | `Schedule.otRoomId` | Lane key |
| `surgeonId` | `Schedule.surgeonId` | Doctor resource key |
| `procedure` | `Schedule.procedure` | Block title and inspector heading |
| `scheduledDate` | `Schedule.scheduledDate` | ISO string; retained for form/API compatibility |
| `startTime` | `Schedule.startTime` | ISO string; axis position |
| `endTime` | `Schedule.endTime` | ISO string; axis end/duration |
| `status` | `Schedule.status` | Status label, block tone, transition set |
| `priority` | `Schedule.priority` | Priority tag; emergency signal |
| `clinicalNotes` | `Schedule.clinicalNotes` | ADMIN/DOCTOR only; `null` for OT_STAFF |
| `patient.name` | `Patient.name` | Authorized reference only |
| `patient.patientCode` | `Patient.patientCode` | Authorized stable reference |
| `department.name` | `Department.name` | Lane grouping/filter |
| `otRoom.name` | `OTRoom.name` | Lane label |
| `otRoom.code` | `OTRoom.code` | Primary lane identifier |
| `otRoom.departmentId` | `OTRoom.departmentId` | Department mismatch warning |
| `otRoom.status` | `OTRoom.status` | Register availability |
| `otRoom.isActive` | `OTRoom.isActive` | Offline state |
| `surgeon.name` | `User.name` | Displayed as assigned surgeon |
| `staff[]` | `ScheduleStaff` + `User.name` | Role, name; no email exposed in workspace |
| `equipment[]` | `ScheduleEquipment` + `Equipment` | Name, category, serial, status, releasedAt; active assignments drive conflicts |

Contact fields, date of birth, gender and medical history are **not selected** by the workspace projection.

## 3. API to UI mapping

| UI action | Existing API | Permission | UI availability |
|---|---|---|---|
| Load workspace | Server read projection (`getScheduleWorkspace`) | ADMIN/DOCTOR/OT_STAFF | Role-gated route |
| Refresh | `router.refresh()` re-runs projection | same | All three roles |
| Create schedule | `POST /api/schedules` | `schedules:create` (ADMIN) | New schedule button |
| Edit schedule | `PATCH /api/schedules/[id]` | `schedules:manage` (ADMIN/DOCTOR) | Inspector Edit for non-terminal |
| Update status | `PATCH /api/schedules/[id]/status` | `schedules:manage` (ADMIN/DOCTOR) | Inspector transition controls |
| Assign/remove staff | `/api/schedules/[id]/staff…` | `schedules:staff:manage` (ADMIN) | Existing full case record |
| Assign/release equipment | `/api/schedules/[id]/equipment…` | `schedules:equipment:manage` (ADMIN) | Existing full case record |
| Notes | `/api/schedules/[id]/notes…` | `schedules:notes:manage` (ADMIN/DOCTOR) | Existing full case record |
| Alternate list | Same server projection | same | Internal `/preview/schedules` only; production route has no list toggle |

The workspace intentionally links to `/schedules/[id]` for staff/equipment/notes management rather than duplicating those write surfaces. This keeps one implementation of the existing contracts and prevents privilege drift.

## 4. Form option mapping

| Option | Source | Loaded for |
|---|---|---|
| Patients | `Patient.id`, `name`, `patientCode` | ADMIN/DOCTOR (create/edit) |
| Departments | `Department.id`, `name` | ADMIN/DOCTOR |
| Theatres | `OTRoom.id`, `name`, `code`, `departmentId`, `status`, `isActive` | ADMIN/DOCTOR |
| Surgeons | `DoctorProfile.id`, `userId`, `user.name` | ADMIN/DOCTOR |

The form sends exactly the existing fields:

```json
{
  "patientId": "uuid",
  "departmentId": "uuid",
  "otRoomId": "uuid",
  "surgeonId": "uuid",
  "procedure": "text",
  "scheduledDate": "YYYY-MM-DD",
  "startTime": "ISO timestamp",
  "endTime": "ISO timestamp",
  "priority": "ELECTIVE | URGENT | EMERGENCY",
  "clinicalNotes": "text or omitted"
}
```

## 5. Derived fields

| Derived field | Formula | Never |
|---|---|---|
| Duration | `max(0, endTime - startTime)` | Uses `scheduledDate` or a guessed duration |
| Axis start/end | Default 07:00–20:00; booked days fit case minutes with one-hour padding; today includes current time | Fixed arbitrary positions |
| Block left/width | `(clampedStart - axisStart) / axisSpan` and `(clampedEnd - clampedStart) / axisSpan` | Uses array order or priority |
| Day membership | Local start/end intersects the local selected day | UTC `toISOString().slice(0,10)` grouping |
| Week count | All schedules intersecting each local date | Counts of hidden/filtered items |
| Now line | Current local minute when selected date is today | Shows on other dates |
| Free theatres | Active theatres with no non-terminal case on selected date | Invents availability |
| In use | Theatres with `IN_PROGRESS` case intersecting current time (today) | Trusts a stale `OTRoom.status` alone |
| Pending | `SCHEDULED` cases on selected date | Confuses with delayed/in-progress |
| Confirmed conflicts | Overlap/invalid-time detector | Treats warnings as confirmed |

## 6. Status and priority mapping

### Schedule status

| Value | Label | Role |
|---|---|---|
| SCHEDULED | Scheduled | Pending, not confirmed |
| CONFIRMED | Confirmed | Ready |
| IN_PROGRESS | In progress | Occupying theatre now |
| COMPLETED | Completed | Terminal; immutable |
| CANCELLED | Cancelled | Terminal; excluded from active conflict checks |
| DELAYED | Delayed | Needs coordination; cannot jump directly to completed |

### Priority

| Value | Label | Visual |
|---|---|---|
| ELECTIVE | Elective | Neutral/quiet |
| URGENT | Urgent | Warning |
| EMERGENCY | Emergency | Critical |

### Staff roles

`SURGEON`, `NURSE`, `ANESTHETIST`, `TECHNICIAN`, `OTHER` map to human-readable labels. Staff conflicts compare the assigned `userId`, independent of staff-role label.

### Theatre status

| Value | Workspace reading |
|---|---|
| AVAILABLE | Available (unless a live/overlapping case says otherwise) |
| OCCUPIED | Register: occupied / in use; if no live case, shown as a warning |
| MAINTENANCE | Unavailable — maintenance |
| DISABLED | Offline / disabled |

## 7. Privacy boundary

| Data | ADMIN | DOCTOR | OT_STAFF |
|---|---|---|---|
| Patient name/code | yes | yes | yes, assigned only |
| Patient contact/demographics | not loaded in workspace | not loaded | not loaded / null |
| Clinical notes | yes | yes | null |
| Operational notes | detail route | detail route | excluded |
| Staff names/roles | yes | yes | yes |
| Equipment assignments | yes | yes | yes |
| All schedules | yes | yes | assigned only |

The server projection returns only what the page needs. The existing API layer still enforces the same boundaries independently.

## 8. Conflict data sources

| Conflict | Source | Enforcement | Stage 3D label |
|---|---|---|---|
| Theatre overlap | `Schedule` range + `otRoomId` | DB exclusion + service check | Confirmed |
| Surgeon overlap | `Schedule` range + `surgeonId` | DB exclusion + service check | Confirmed |
| Patient overlap | `Schedule` range + `patientId` | DB exclusion + service check | Confirmed |
| Staff overlap | `ScheduleStaff.userId` + ranges | None server-side | Confirmed (advisory, computed) |
| Equipment overlap | Active `ScheduleEquipment` + ranges | None server-side | Confirmed (advisory, computed) |
| Invalid time | `endTime <= startTime` | Service rejects new writes | Confirmed |
| Theatre unavailable | `OTRoom.status` / `isActive` | Service blocks some creates | Warning |
| Department mismatch | `OTRoom.departmentId !== Schedule.departmentId` | Service blocks writes but historical rows may exist | Warning |
| Missing resources | Null theatre/surgeon / empty staff | Schema prevents null; staff may be empty | Warning |

The detection function is pure and unit-tested. The UI does not claim that staff/equipment conflicts are blocked by the backend.

## 9. Dashboard relationship

The ADMIN dashboard already builds a `SurgicalScheduleTimeline` and `TheatreOperationsBoard` from `/api/schedules` and per-case detail requests. Stage 3D does not modify those components. It reuses the same domain semantics:

- local day keys;
- half-open overlap checks;
- status labels/tones;
- actual start/end times.

The Schedules workspace becomes the deeper operational surface; the dashboard remains a summary.

## 10. Scale and limitation notes

- `/api/schedules` still returns all accessible schedules; there is no API pagination or date-range parameter. The workspace itself reads the selected day plus one padded week for the week strip, so the page does not request unrelated months. The development dataset has 10 rows; the API-wide scale risk is recorded as a limitation.
- Staff and equipment conflicts are calculated from the loaded week on the server and narrowed to the selected day for display. A future date-range API would be needed for large hospitals.
- No timezone field exists. The workspace labels local theatre time and does not change stored values.
- Theatre register status is not automatically synchronized with schedule lifecycle. The workspace surfaces actual case times and labels register disagreement as a warning.
- `ScheduleEquipment` claims inventory globally at assignment time, not for the scheduled range. The timeline shows the recorded allocation without redefining it.
