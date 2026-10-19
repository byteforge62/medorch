# File and Route Index

This index is an orientation map for the current uploaded snapshot. Use `Get-ChildItem -Recurse` or IDE search for the current local tree before making changes.

## Pages and route families

| UI path | Source path | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Public landing page. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Role-aware operational dashboard. |
| `/login` | `src/app/login/page.tsx`, `src/components/auth/LoginForm.tsx` | Credentials login. |
| `/register` | `src/app/register/page.tsx` | Patient registration. |
| `/verify-email` | `src/app/verify-email/page.tsx` | Email verification. |
| `/resend-verification` | `src/app/resend-verification/page.tsx` | Request verification email again. |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Request reset instructions. |
| `/reset-password` | `src/app/reset-password/page.tsx` | Reset with token. |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | Permission-denied destination. |
| `/schedules` | `src/app/schedules/page.tsx`, `src/components/schedules/SchedulePage.tsx` | Schedule listing, filters and create/edit interactions. |
| `/schedules/[id]` | `src/app/schedules/[id]/page.tsx`, `ScheduleDetails.tsx` | Schedule detail UI. |
| `/patients` | `src/app/patients/page.tsx`, `PatientRegistry.tsx` | Patient registry. |
| `/patients/[id]` | `src/app/patients/[id]/page.tsx`, `PatientDetail.tsx` | Patient detail. |
| `/patients/appointments` | `src/app/patients/appointments/page.tsx`, `MyAppointments.tsx` | Patient's own appointments. |
| `/patients/appointments/[id]` | `src/app/patients/appointments/[id]/page.tsx`, `AppointmentDetail.tsx` | Appointment detail. |
| `/doctors` | `src/app/doctors/page.tsx`, `DoctorDirectory.tsx` | Doctor directory. |
| `/doctors/[id]` | `src/app/doctors/[id]/page.tsx`, `DoctorDetail.tsx` | Doctor detail. |
| `/ot-rooms` | `src/app/ot-rooms/page.tsx`, `OtRoomManagement.tsx` | OT room management. |
| `/equipment` | `src/app/equipment/page.tsx`, `EquipmentManagement.tsx` | Equipment management. |
| `/audit` | `src/app/(dashboard)/audit/page.tsx`, `AuditLogViewer.tsx` | Audit event viewer in dashboard route group. |
| `/users` | `src/app/(dashboard)/users/page.tsx` | User listing/management surface. |

## API route inventory

Auth and account recovery:

- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js handlers.
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/resend-verification/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`

User and profile resources:

- `src/app/api/users/route.ts`, `src/app/api/users/[id]/route.ts`, `src/app/api/users/[id]/approve/route.ts`
- `src/app/api/doctors/route.ts`, `src/app/api/doctors/[id]/route.ts`, `src/app/api/doctors/[id]/status/route.ts`
- `src/app/api/patients/route.ts`, `src/app/api/patients/[id]/route.ts`
- `src/app/api/departments/route.ts`, `src/app/api/departments/[id]/route.ts`
- `src/app/api/ot-rooms/route.ts`, `src/app/api/ot-rooms/[id]/route.ts`, `src/app/api/ot-rooms/[id]/status/route.ts`, `src/app/api/ot-rooms/[id]/active/route.ts`
- `src/app/api/equipment/route.ts`, `src/app/api/equipment/[id]/route.ts`, `src/app/api/equipment/[id]/status/route.ts`

Scheduling:

- `src/app/api/schedules/route.ts`
- `src/app/api/schedules/[id]/route.ts`
- `src/app/api/schedules/[id]/status/route.ts`
- `src/app/api/schedules/[id]/staff/route.ts`
- `src/app/api/schedules/[id]/staff/[staffId]/route.ts`
- `src/app/api/schedules/[id]/equipment/route.ts`
- `src/app/api/schedules/[id]/equipment/[equipmentId]/route.ts`
- `src/app/api/schedules/[id]/notes/route.ts`
- `src/app/api/schedules/[id]/notes/[noteId]/route.ts`
- `src/app/api/me/schedules/route.ts` — doctor-specific schedule list.
- `src/app/api/me/staff-schedules/route.ts` — OT staff assignment list.
- `src/app/api/me/appointments/route.ts` — patient's own appointments.

Other:

- `src/app/api/alerts/route.ts`, `src/app/api/alerts/read-all/route.ts`, `src/app/api/alerts/[id]/route.ts`, `src/app/api/alerts/[id]/read/route.ts`
- `src/app/api/audit/route.ts`

## Domain modules

| Module | Key files | Main responsibilities |
|---|---|---|
| Auth | `src/auth.ts`, `src/lib/auth/*`, `src/lib/api/auth.ts` | Credential verification, session validity, page/API authorization. |
| Schedules | `src/modules/schedules/schedule.validation.ts`, `schedule.service.ts`, `schedule.repository.ts`, `schedule-access.ts`, `schedule-conflict-error.ts` | Schedule rules, status transitions, conflict handling, staff/equipment/note operations and response access helpers. |
| Patients | `src/modules/patients/patient.validation.ts`, `patient.service.ts`, `patient.repository.ts` | Patient input validation and data access. |
| Doctors | `src/modules/doctors/doctor.validation.ts`, `doctor.service.ts`, `doctor.repository.ts` | Doctor profiles and status. |
| Departments | `src/modules/departments/department.validation.ts`, `department.service.ts`, `department.repository.ts` | Department records. |
| OT rooms | `src/modules/ot-rooms/ot-room.validation.ts`, `ot-room.service.ts`, `ot-room.repository.ts` | Room inventory, status and activation. |
| Equipment | `src/modules/equipment/equipment.validation.ts`, `equipment.service.ts`, `equipment.repository.ts` | Equipment inventory and lifecycle. |
| Users | `src/modules/users/user.validation.ts`, `user.service.ts`, `user.repository.ts` | User records and account operations. |
| Alerts | `src/modules/alerts/alerts.validation.ts`, `alerts.service.ts`, `alerts.repository.ts` | User-scoped alert operations. |
| Audit | `src/modules/audit/audit.service.ts`, `audit.repository.ts` | Audit event writes and reads. |

## Shared infrastructure

- `src/lib/api/response.ts`: response envelopes.
- `src/lib/api/validation.ts`: malformed JSON handling and Zod parsing helper.
- `src/lib/api/request-id.ts`: request correlation ID.
- `src/lib/api/error.ts`: Prisma/domain error message mapping utilities.
- `src/lib/api/client.ts`: browser-side API client.
- `src/lib/db/prisma.ts`: Prisma singleton.
- `src/lib/env.ts`: environment validation.
- `src/components/layout/`: `AppShell`, `Header`, `Sidebar`.
- `src/components/dashboard/`: dashboards and operational widgets.
- `src/components/schedules/`: schedule calendar, card, filters, form, list, status actions/badge.
- `src/components/alerts/AlertCenter.tsx`: alert drawer/center.
- `src/components/ui/`: shared buttons, badges, cards, empty/error/loading states.

## Tests

| Test | Focus | External dependency |
|---|---|---|
| `tests/api-request-validation.test.ts` | Shared JSON-body validation behavior. | No database intended. |
| `tests/foundation-validation.test.ts` | Foundation validation rules. | No database intended. |
| `tests/permissions.test.ts` | Role-to-permission map. | Keep isolated from Auth.js/Prisma imports. |
| `tests/schedule-access.test.ts` | Schedule transitions/access/redaction helpers. | No database intended. |
| `tests/schedule-constraints.test.ts` | PostgreSQL exclusion constraints for overlapping schedules. | Requires `DATABASE_URL` to a disposable test DB. |
