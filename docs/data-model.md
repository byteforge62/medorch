# Data model

The Prisma schema at `prisma/schema.prisma` is the authoritative definition. PostgreSQL is the persistence layer; UUID strings identify most records, with database enums used for role, status, priority, and action fields.

## Entities

| Model | Purpose and notable fields |
| --- | --- |
| **User** | Login identity, password hash, role, account status, approval timestamp, and profile basics. Relates to doctor or patient profiles, created schedules, assigned staff, notes, alerts, and audit records. |
| **DoctorProfile** | Doctor-specific specialization, license number, and optional department. A profile belongs to one user; its license number is unique when present. |
| **Patient** | Patient code, demographic/contact fields, optional user account, and optional medical-history text. A patient may have multiple schedules. |
| **Department** | Named service line, active flag, optional head doctor, doctors, rooms, equipment, and schedules. Department name is unique. |
| **OTRoom** | Room name/code, required department, optional capacity, active flag, and operational status. Room code is unique. |
| **Equipment** | Name, category, optional unique serial number, status, optional department, and optional maintenance due date. |
| **Schedule** | Procedure, scheduled date and time range, lifecycle status, priority, optional clinical notes, and required patient, department, room, surgeon, and creator references. |
| **ScheduleStaff** | Join record for a user assigned to a schedule with a staff role and assignment time. |
| **ScheduleEquipment** | Join record for equipment assigned to a schedule, with assignment and optional release timestamps. |
| **ScheduleNote** | Schedule note content, author, and create/update timestamps. |
| **Alert** | User-facing alert type, severity, optional schedule relation, message, read flag, and read timestamp. |
| **AuditLog** | Actor (optional), action, entity identifier, optional description/JSON metadata, and creation time. |

## Relationship outline

```text
Department ──< DoctorProfile
     │       ├──< OTRoom
     │       ├──< Equipment
     │       └──< Schedule >── Patient
     │                  ├──── User (surgeon)
     │                  ├──── User (creator)
     │                  ├──< ScheduleStaff >── User
     │                  ├──< ScheduleEquipment >── Equipment
     │                  ├──< ScheduleNote >── User (author)
     │                  └──< Alert
     └── User (optional department head)

User ── optional DoctorProfile
User ── optional Patient
User ──< Alert
User ──< AuditLog
```

`Schedule.surgeonId` and `Schedule.createdById` are separate relations to `User`. A doctor's profile is a one-to-one extension of the user record, not a separate login identity.

## Enumerated values

| Enum | Values |
| --- | --- |
| `UserRole` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` |
| `UserStatus` | `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED` |
| `OTRoomStatus` | `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `DISABLED` |
| `EquipmentStatus` | `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED` |
| `ScheduleStatus` | `SCHEDULED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DELAYED` |
| `SchedulePriority` | `ELECTIVE`, `URGENT`, `EMERGENCY` |
| `StaffRole` | `SURGEON`, `NURSE`, `ANESTHETIST`, `TECHNICIAN`, `OTHER` |
| `AlertType` | `SCHEDULE`, `RESOURCE`, `SYSTEM`, `MAINTENANCE` |
| `AlertSeverity` | `INFO`, `WARNING`, `CRITICAL` |
| `AuditAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `APPROVE`, `REJECT`, `CANCEL`, `COMPLETE` |

## Constraints and lifecycle behavior

- Email, patient code, room code, department name, and optional license/serial identifiers have uniqueness constraints.
- A user can have at most one doctor profile and one linked patient record.
- A department head is unique across departments.
- A schedule staff assignment is unique for a given schedule, user, and role.
- A schedule-equipment pair is unique.
- Schedule references to patient, department, room, surgeon, and creator use restrictive deletion behavior; related notes and assignments cascade with schedule deletion.
- Room/department, equipment/department, and doctor/department references are optionality-aware. Several optional associations use `SetNull` on deletion.
- Indexes cover role/status, department and resource status, schedule date/time/status/priority and foreign keys, alert owner/read state, and audit entity/action/time.

The schema's unique constraints do not enforce non-overlapping schedule intervals. The current conflict check is in service logic; see [Architecture](./architecture.md#current-trade-offs-and-boundaries).
