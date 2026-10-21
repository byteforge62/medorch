# API reference

The JSON API is implemented by Next.js Route Handlers under `src/app/api`. Dynamic identifiers shown in braces (for example, `{id}`) are path segments. Resource operations require an authenticated session; allowed roles vary by method. Auth.js, registration, verification, and account-recovery endpoints are public as required by those flows.

## Response format

Successful responses use the shared envelope:

```json
{
  "success": true,
  "data": {}
}
```

Error responses use this shape:

```json
{
  "success": false,
  "message": "Invalid schedule data.",
  "details": {},
  "requestId": "generated-request-id"
}
```

`details` and `requestId` are optional. Resource handlers generally respond with HTTP `200`, including create operations; registration and account-recovery handlers may return `202`. Typical error statuses include `400` for invalid input or a rejected domain rule, `401` for missing/unauthorized sessions, `404` for missing records, `409` for duplicate assignments, `429` for throttled requests, and `500` for unexpected handler failures. The endpoint implementation determines the precise status and error text.

## Route inventory

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/[...nextauth]` | Auth.js handler. |
| `POST` | `/api/auth/[...nextauth]` | Auth.js handler, including credentials sign-in. |
| `POST` | `/api/auth/register` | Register a patient account. |
| `POST` | `/api/auth/verify-email` | Verify a patient email address. |
| `POST` | `/api/auth/resend-verification` | Request another verification email. |
| `POST` | `/api/auth/forgot-password` | Request password-reset instructions. |
| `POST` | `/api/auth/reset-password` | Reset a password using a one-time token. |
| `GET`, `POST` | `/api/users` | List users or create a user. |
| `GET` | `/api/users/{id}` | Get one user. |
| `POST` | `/api/users/{id}/approve` | Approve a verified pending patient account. |
| `GET`, `POST` | `/api/doctors` | List or create a doctor record/profile. |
| `GET`, `PATCH` | `/api/doctors/{id}` | Get or update a doctor. |
| `PATCH` | `/api/doctors/{id}/status` | Change doctor account status. |
| `GET`, `POST` | `/api/patients` | List or create a patient record. |
| `GET`, `PATCH` | `/api/patients/{id}` | Get or update a patient. |
| `GET`, `POST` | `/api/departments` | List or create departments. |
| `GET`, `PATCH`, `DELETE` | `/api/departments/{id}` | Get, update, or delete a department. |
| `GET`, `POST` | `/api/ot-rooms` | List or create operating rooms. |
| `GET`, `PATCH` | `/api/ot-rooms/{id}` | Get or update an operating room. |
| `PATCH` | `/api/ot-rooms/{id}/status` | Change room status. |
| `PATCH` | `/api/ot-rooms/{id}/active` | Change room active state. |
| `GET`, `POST` | `/api/equipment` | List or create equipment. |
| `GET`, `PATCH` | `/api/equipment/{id}` | Get or update equipment. |
| `PATCH` | `/api/equipment/{id}/status` | Change equipment status. |
| `GET`, `POST` | `/api/schedules` | List schedules or create a validated schedule. |
| `GET`, `PATCH` | `/api/schedules/{id}` | Get or update a validated schedule. |
| `PATCH` | `/api/schedules/{id}/status` | Apply a supported lifecycle transition. |
| `GET`, `POST` | `/api/schedules/{id}/staff` | List or assign schedule staff. |
| `DELETE` | `/api/schedules/{id}/staff/{staffId}` | Remove a staff assignment. |
| `GET`, `POST` | `/api/schedules/{id}/equipment` | List or assign schedule equipment. |
| `PATCH` | `/api/schedules/{id}/equipment/{equipmentId}` | Update/release a schedule equipment assignment. |
| `GET`, `POST` | `/api/schedules/{id}/notes` | List or add schedule notes. |
| `PATCH`, `DELETE` | `/api/schedules/{id}/notes/{noteId}` | Update or delete a schedule note. |
| `GET` | `/api/me/schedules` | List the signed-in doctor's surgical schedules. |
| `GET` | `/api/me/staff-schedules` | List the signed-in OT staff member's assignments. |
| `GET` | `/api/me/appointments` | List appointments linked to the signed-in patient. |
| `GET`, `POST` | `/api/alerts` | List visible alerts or create an alert. |
| `GET`, `PATCH`, `DELETE` | `/api/alerts/{id}` | Get, update, or delete an alert. |
| `PATCH` | `/api/alerts/{id}/read` | Mark one alert as read. |
| `PATCH` | `/api/alerts/read-all` | Mark alerts read for a user. |
| `GET` | `/api/audit` | Query audit records (administrator only). |

The inventory reflects the implemented handlers; it is not a promise that every operation has a corresponding screen in the current UI.

## Authorization matrix

Role names used by the API:

- `ADMIN` — administrator
- `DOCTOR` — doctor
- `OT_STAFF` — operating-theatre staff
- `PATIENT` — patient

| Operation group | Read operations | Write operations |
| --- | --- | --- |
| Users | `ADMIN` | `ADMIN` can create users and approve verified pending patients; there are no general user update/delete handlers. |
| Doctors | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Patients | `ADMIN`, `DOCTOR` | `ADMIN` |
| Departments, rooms, equipment | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Schedules | `ADMIN`, `DOCTOR`, `OT_STAFF`; OT staff can fetch an individual schedule and its staff/equipment only when assigned. Patients can read only their own appointments through `/api/me/appointments`. OT-staff schedule responses redact clinical notes and patient email, date of birth, and gender. | Schedule create and staff/equipment assignment require `ADMIN`. Schedule update and status changes allow `ADMIN` and `DOCTOR`; Doctors may manage any schedule. Schedule-note operations allow `ADMIN`, `DOCTOR`. |
| Alerts | All four roles can read; non-admins are restricted to their own alerts by the service. | Alert creation allows `ADMIN`, `DOCTOR`, `OT_STAFF`; alert changes are available to all four roles, with non-admin ownership checks in the service. |
| Audit | `ADMIN` | No audit mutation endpoint is exposed. |

This table describes the current Route Handler guards and service-level ownership checks. It is intentionally distinct from the role-permission map in `src/lib/auth/permission.ts`. Patients do not receive general schedule access; their appointment endpoint filters records by the signed-in account.

## Query and body validation

Handlers validate route IDs and request data with Zod schemas located in each domain module's `*.validation.ts` file. Malformed JSON request bodies return HTTP `400`. For example, schedule input requires UUID references, a trimmed procedure name from 1–200 characters, an end time later than the start time, and a supported optional priority. Schedule notes are trimmed and limited to 5,000 characters.

`GET /api/alerts` accepts these query parameters:

| Parameter | Meaning |
| --- | --- |
| `userId` | Filter by recipient; service logic still limits non-admin users to their own alerts. |
| `isRead` | Filter read state. |
| `severity` | Filter alert severity. |
| `type` | Filter alert type. |

For exact request shapes and domain error mapping, consult the matching route and validation schema; this reference summarizes the API surface rather than duplicating every Zod definition.

## Schedule lifecycle values

`PATCH /api/schedules/{id}/status` accepts `SCHEDULED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, or `DELAYED`. Valid transitions are checked by the schedule service. See [Product and workflow overview](./product-overview.md#status-and-priority-are-separate-concepts).


## Source-of-truth note (2026-10-19)

This inventory was cross-checked against the uploaded source snapshot. The current route files include `POST /api/users`, `/api/users/{id}/approve`, patient/doctor/OT-room/equipment management pages, `/schedules/{id}` detail UI, and the audit page/API. Older project notes that say these are absent are stale. For the exact permission required by any operation, inspect that method's `authorizeApiPermission(...)` call in its current route handler and `src/lib/auth/permission.ts`; do not infer permission solely from this table. This document lists routes but does not replace source-level review or integration tests.
