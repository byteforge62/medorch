# Product and workflow overview

## Product intent

Operating-theatre coordination depends on several connected facts: which patient and procedure are planned, which room and surgeon are assigned, whether those resources are available, and how the schedule changes over time. MedOrch is a portfolio prototype that brings those records into one operational workspace and models the checks that make a schedule plausible.

The product goal is operational visibility and coordination. It is not clinical decision support: the application does not recommend treatment, assess clinical suitability, or replace a hospital information system.

## Users represented in the application

The domain model and permission definitions represent four roles:

| Role | Intended responsibility |
| --- | --- |
| **Administrator** | Maintain users and operational master data; coordinate schedules and access. |
| **Doctor** | Review schedules and resource context; contribute to schedule operations. |
| **Operating-theatre staff** | Review theatre schedules and coordinate assigned operational resources. |
| **Patient** | A represented account role with intended access to personal schedule and alert information. |

These roles describe the product model, not a claim that every workflow is available to every role in the current UI or API. Effective endpoint access is route-specific; see the [API authorization matrix](./api-reference.md#authorization-matrix) and [known boundaries](./security-and-limitations.md#known-implementation-boundaries).

## Implemented workflow

### 1. Prepare operational records

Administrators can work with department, doctor, patient, room, equipment, and user records through their API resources. Rooms belong to departments; equipment can be associated with a department; doctor profiles can identify a department and specialization.

### 2. Propose a schedule

A schedule links a patient, department, operating room, surgeon, creator, procedure description, date, start and end times, priority, and optional clinical notes. Input validation requires UUID identifiers, a non-empty procedure name, a valid time range, and supported priority values.

### 3. Validate operational fit

The schedule service checks referenced records and room/surgeon eligibility. It rejects an inactive department, an unavailable or mismatched room, an inactive or non-doctor surgeon, and an overlapping schedule for the selected room or surgeon. Updates exclude the schedule being edited from their own conflict check.

### 4. Coordinate the schedule

The API supports assigning staff with a role, assigning equipment, releasing assigned equipment, and adding, editing, or deleting schedule notes. The data model records assignment timestamps and equipment release time.

### 5. Track lifecycle and surface changes

Schedule status is constrained to supported transitions. Alerts can be listed and marked read; non-administrator alert access is scoped to the requesting user in the service layer. Selected domain mutations create audit records.

## Status and priority are separate concepts

**Lifecycle status** describes progress:

`SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED`

Alternative supported paths include `SCHEDULED → CANCELLED`, `CONFIRMED → DELAYED`, and `DELAYED → CONFIRMED`, `IN_PROGRESS`, or `CANCELLED`. `COMPLETED` and `CANCELLED` are terminal in the service transition map.

**Priority** describes urgency: `ELECTIVE`, `URGENT`, or `EMERGENCY`. It does not itself advance a schedule's lifecycle.

## Interface and operational visibility

The authenticated dashboard presents room availability, schedule and equipment counts, recent schedules, quick actions, and alert summaries. The schedule page supports filters by status, priority, date, department, room, and text matching against procedure, patient, and surgeon names.

The dashboard requests data when it loads and derives its summary counts in the browser. The room panel offers a manual refresh. This implementation is useful for demonstrating operational aggregation and UI states, but it is not a continuously synchronized or real-time monitoring system.

## Suggested demonstration

For a concise recruiter walkthrough:

1. Start with the dashboard and explain which operational records feed its summary.
2. Move to the schedule list and demonstrate a filter or search.
3. Create or update a schedule using synthetic data.
4. Explain why the room/department relationship and room/surgeon overlap checks belong in the domain service rather than only in the form.
5. Trace the request through a Route Handler, service, repository, and Prisma model.
6. Show the status transition map and the related audit event behavior.

The seed supplies only a local administrator account; it does not populate a realistic demo hospital or prebuilt schedule scenario.
