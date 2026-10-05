# API reference

The JSON API is implemented by Next.js Route Handlers under `src/app/api`. Dynamic identifiers shown in braces (for example, `{id}`) are path segments. All resource operations require an authenticated session; allowed roles vary by method. The Auth.js endpoints are the exception because they handle sign-in and session operations.

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

`details` and `requestId` are optional. Successful handlers currently respond with HTTP `200`, including create operations. Typical error statuses include `400` for invalid input or a rejected domain rule, `401` for missing/unauthorized sessions, `404` for missing records, `409` for duplicate assignments, and `500` for unexpected handler failures. The endpoint implementation determines the precise status and error text.

## Route inventory

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/[...nextauth]` | Auth.js handler. |
| `POST` | `/api/auth/[...nextauth]` | Auth.js handler, including credentials sign-in. |
| `GET` | `/api/users` | List users. |
| `GET` | `/api/users/{id}` | Get one user. |
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
| `GET`, `POST` | `/api/alerts` | List visible alerts or create an alert. |
| `GET`, `PATCH`, `DELETE` | `/api/alerts/{id}` | Get, update, or delete an alert. |
| `PATCH` | `/api/alerts/{id}/read` | Mark one alert as read. |
| `PATCH` | `/api/alerts/read-all` | Mark alerts read for a user. |

The inventory reflects the implemented handlers; it is not a promise that every operation has a corresponding screen in the current UI.

## Authorization matrix

Role names used by the API:

- `ADMIN` — administrator
- `DOCTOR` — doctor
- `OT_STAFF` — operating-theatre staff
- `PATIENT` — patient

| Operation group | Read operations | Write operations |
| --- | --- | --- |
| Users | `ADMIN` | No user create/update/delete handler is currently exposed. |
| Doctors | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Patients | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Departments, rooms, equipment | `ADMIN`, `DOCTOR`, `OT_STAFF` | `ADMIN` |
| Schedules | `ADMIN`, `DOCTOR`, `OT_STAFF` | Schedule create/update/status and staff/equipment assignment require `ADMIN`; schedule-note operations allow `ADMIN`, `DOCTOR`, `OT_STAFF`. |
| Alerts | All four roles can read; non-admins are restricted to their own alerts by the service. | Alert creation allows `ADMIN`, `DOCTOR`, `OT_STAFF`; alert changes are available to all four roles, with non-admin ownership checks in the service. |

This table describes the current Route Handler guards and service-level alert ownership checks. It is intentionally distinct from the broader intended permissions in `src/lib/auth/permissions.ts`. In particular, the schedule read routes do not currently grant `PATIENT` access, despite a patient-owned schedule permission being declared there.

## Query and body validation

Handlers validate route IDs and request data with Zod schemas located in each domain module's `*.validation.ts` file. For example, schedule input requires UUID references, a trimmed procedure name from 1–200 characters, an end time later than the start time, and a supported optional priority. Schedule notes are trimmed and limited to 5,000 characters.

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
