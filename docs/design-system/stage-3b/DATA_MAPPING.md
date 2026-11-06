# Stage 3B — Data Mapping

**Source of truth:** `prisma/schema.prisma`, the existing API routes, and live PostgreSQL data.  
**No schema, endpoint, or response contract was changed for Stage 3B.**

## 1. Endpoints used

| Endpoint | Permission | Dashboard use |
| --- | --- | --- |
| `GET /api/ot-rooms` | `otRooms:read` | Theatre cards, room status, department, capacity, room-specific lists. |
| `GET /api/schedules` | `schedules:read` | Open-case summary, theatre today list, schedule timeline, workforce case load. |
| `GET /api/schedules/{id}` | `schedules:read` | Staff and equipment assignments for current/14-day open cases. |
| `GET /api/equipment` | `equipment:read` | Readiness register, maintenance state, category and department. |
| `GET /api/alerts` | `alerts:read` | Unread alert queue and critical-alert attention items. |
| `PATCH /api/alerts/{id}/read` | `alerts:update` | Existing “Mark read” action. |
| `GET /api/doctors` | `doctors:read` | Active doctor profiles and department distribution. |
| `GET /api/users` | `users:read` | Active/pending clinical accounts. |
| `GET /api/audit?limit=12` | `audit:read` | Operational activity stream and total event count. |

Responses are wrapped by the existing `apiSuccess` envelope and unwrapped by `apiClient`.

## 2. Prisma fields rendered

### `OTRoom`

| Field | Use |
| --- | --- |
| `id` | Stable key, room selection. |
| `code` | Primary theatre identifier and case association. |
| `name` | Secondary theatre label. |
| `departmentId` / `department.name` | Department in selected room detail and attention item. |
| `capacity` | Capacity in selected room detail. |
| `status` | `AVAILABLE` / `OCCUPIED` / `MAINTENANCE` / `DISABLED` readiness state. |
| `isActive` | Inactive rooms are shown as offline; only active rooms count in readiness totals. |

### `Schedule`

| Field | Use |
| --- | --- |
| `id` | Key, details request, route link. |
| `procedure` | Case title everywhere. |
| `startTime`, `endTime` | Timeline positions, duration, today filtering, overlap detection. |
| `scheduledDate` | Returned by API; the dashboard groups and filters using the ISO start/end timestamps so the visual placement matches the recorded times. |
| `status` | Open-state filtering and status labels. Open = not `COMPLETED` and not `CANCELLED`. |
| `priority` | Elective / Urgent / Emergency label in selected schedule detail. |
| `otRoomId` / `otRoom.code`, `otRoom.name` | Room association, conflict detection, next-case label. |
| `departmentId` / `department.name` | Selected case detail. |
| `surgeonId` / `surgeon.name` | Selected case detail and surgeon case-load count. |
| `patientId` | Returned by the detail endpoint but **not rendered**. |

### `ScheduleStaff`

| Field | Use |
| --- | --- |
| `id` | List key. |
| `userId` / `user.name` | Assigned staff name. |
| `role` | Surgeon / Nurse / Anaesthetist / Technician / Other role count and label. |

### `ScheduleEquipment`

| Field | Use |
| --- | --- |
| `id` | List key. |
| `equipmentId` | Assignment lookup by equipment. |
| `releasedAt` | Only assignments with `releasedAt = null` count as current. |
| `equipment.name` | Assigned equipment name. |
| `equipment.category` | Assigned equipment category. |

### `Equipment`

| Field | Use |
| --- | --- |
| `id`, `name` | Register row. |
| `category` | Row metadata. |
| `status` | `AVAILABLE` / `IN_USE` / `MAINTENANCE` / `RETIRED`. |
| `departmentId` / `department.name` | Row metadata. |
| `maintenanceDueAt` | Overdue and due-within-seven-days calculations. |

### `Alert`

| Field | Use |
| --- | --- |
| `id` | Key and mutation target. |
| `title`, `message` | Alert card content. |
| `severity` | Critical / Warning / Info ordering and attention inclusion. |
| `type` | Alert type label. |
| `isRead`, `readAt` | Unread filter; read action updates both server-side. |
| `createdAt` | Relative timestamp and recency sort. |
| `scheduleId` / `schedule.id`, `schedule.procedure` | Linked schedule navigation. |
| `userId` / `user` | Returned by the API but not rendered in the dashboard. |

### `DoctorProfile`

| Field | Use |
| --- | --- |
| `id` | Key. |
| `userId` | Match schedule surgeon IDs to doctor profiles for case load. |
| `departmentId` / `department.name` | Department distribution. |
| `user.name`, `user.status` | Display name and active filter. |
| `specialization` | Returned by the API but not displayed by this dashboard. |

### `User`

| Field | Use |
| --- | --- |
| `id`, `name` | Staff/account identity. |
| `role` | `DOCTOR`, `OT_STAFF`, `ADMIN` filters. |
| `status` | Active workforce and pending-account counts. |
| `email` | Returned by the API; not rendered in dashboard cards. |
| `doctorProfile` | Returned but not used for the dashboard counts. |

### `AuditLog`

| Field | Use |
| --- | --- |
| `id` | List key. |
| `description` | Activity sentence. |
| `action` | Activity dot tone. |
| `entity` | Entity label. |
| `createdAt` | Relative time. |
| `user.name` | Actor name, or “System” when no user is associated. |

### `Department`

| Field | Use |
| --- | --- |
| `name` | Room, equipment, doctor and schedule department labels. |

## 3. Derived values and exact rules

| Display | Rule |
| --- | --- |
| Open cases | `status !== 'COMPLETED' && status !== 'CANCELLED'`. |
| Cases today | Open cases whose `startTime` local date equals today. |
| Theatres ready | Active rooms with `status === 'AVAILABLE'`, over active rooms. |
| Unread alerts | `isRead === false`. |
| Equipment available | `status === 'AVAILABLE'`, over all loaded equipment. |
| Delayed case attention | Any schedule with `status === 'DELAYED'` (open or otherwise). |
| Theatre availability attention | Active room with `status === 'MAINTENANCE'` or `'DISABLED'`. |
| Equipment attention | `status === 'MAINTENANCE'` or `maintenanceDueAt < now`; due within 7 days adds a warning item. |
| Pending decision | User `status === 'PENDING'` and role `DOCTOR`, `OT_STAFF` or `ADMIN`. |
| Booked today | Sum of recorded `endTime - startTime` for today’s non-cancelled room cases. |
| Conflict | Two non-cancelled cases in the same room whose start/end intervals overlap. |
| Near-term staffing | Open cases with `startTime` today or later. A case is staffed when its detail `staff.length > 0`. |
| Surgeon case load | Open near-term schedules grouped by `surgeonId`, matched to active doctor profiles by `userId`. |
| Maintenance overdue | `maintenanceDueAt < now`. |
| Maintenance due soon | `maintenanceDueAt >= now && <= now + 7 days`. |

## 4. Values deliberately not shown

| Not shown | Reason |
| --- | --- |
| Turnover time | Not recorded by the schema or APIs. |
| Theatre utilisation percentage | Capacity is a room capacity field; no recorded usable theatre minutes baseline exists for an honest percentage. |
| Staff availability / rota | Not tracked. The workforce panel states this explicitly. |
| Alert escalation score | Not a stored field. Only recorded severity is used. |
| Predicted case duration | Not predicted. Widths use recorded start/end times only. |
| Patient name, contact, DOB or clinical notes | Not necessary for the administrator command view; not rendered. |
| “Real-time” presence indicator | The dashboard refreshes on request; no live socket exists. |
| Alert dismiss | No existing capability was added. Only the existing Mark read mutation is used. |
| Staff/equipment detail beyond 14 days | Staff and equipment assignments are fetched only for `IN_PROGRESS` cases and open cases within 14 days. An equipment item assigned to a case beyond that horizon is not resolved to a case in this workspace; the near-term staffing denominator likewise includes only cases whose details were loaded. All seeded cases are inside the horizon. |

## 5. Live-data interpretation notes

- Six active theatres; one room is inactive/offline (`DEMO-RES-01`), one active room is in maintenance (`DEMO-GEN-03`).
- `DEMO-ORT-01` is recorded as occupied and has an `IN_PROGRESS` case, so the dashboard does not show a mismatch warning.
- `DEMO-GEN-01` is ready but shows “No active or upcoming case” at the tested clock time: its Appendectomy is still recorded as `CONFIRMED` at 14:30, which is in the past, and no case is `IN_PROGRESS`. The dashboard keeps the recorded status and timeline entry; it does not relabel the case as active, completed or overdue.
- The seeded alert set has no `CRITICAL` alert. The critical styling and attention path exist in code but were not visually exercised by live seed data.
- The seeded schedule set has no overlapping cases in the same room. Conflict logic is implemented but no live conflict was available to display.
