# MedOrch

### Operating-theatre scheduling and resource coordination

MedOrch is a full-stack portfolio application for coordinating operating-theatre schedules with the resources they depend on: rooms, surgeons, staff, equipment, departments, and patient records. The central engineering problem is not simply storing a procedure time; it is validating that the proposed schedule is operationally coherent, making changes visible to the right users, and preserving a useful history of selected actions.

The project implements a dashboard, schedule-management workflow, resource APIs, credential authentication, role-aware route guards, PostgreSQL persistence, and domain-level checks for schedule availability. It is a software prototype—not a clinical system or medical device.

> **Use synthetic data only.** The project has not been assessed for healthcare deployment, privacy compliance, or clinical use. See [Security and project boundaries](./docs/security-and-limitations.md).

## Project at a glance

| | |
| --- | --- |
| **Application** | MedOrch — operating-theatre operations prototype |
| **Primary workflow** | Validate, coordinate, and track a procedure schedule |
| **Stack** | Next.js 16, React 19, TypeScript, PostgreSQL, Prisma 7 |
| **Authentication** | Auth.js credentials provider, JWT sessions, bcryptjs password hashes |
| **Validation** | Zod request schemas and domain-level schedule checks |
| **Local environment** | npm and Docker Compose |

## The workflow

1. An administrator configures departments, operating rooms, equipment, doctors, and patient records.
2. A schedule is proposed with its procedure, time window, priority, patient, department, room, and surgeon.
3. The service validates required records and availability, including overlapping room and surgeon bookings.
4. The schedule can be staffed, supplied with equipment, annotated with notes, and moved through its lifecycle.
5. Dashboard summaries and user-scoped alerts make selected operational changes visible.

This workflow is implemented across the interface, API handlers, domain services, and relational data model—not as a static mock screen. Current behavior and boundaries are documented in the guides below.

## What the code demonstrates

- A modular full-stack structure: App Router pages and Route Handlers, domain-specific services and repositories, shared API helpers, and Prisma persistence.
- Typed relational modeling for schedules and their related staff, equipment, notes, alerts, and audit events.
- Business-rule validation beyond basic schema checks: room/department matching, active resources, valid surgeons, time ordering, and schedule conflict detection.
- Explicit schedule lifecycle transitions rather than arbitrary status assignment.
- Server-side authentication and role guards, with ownership checks for alert access.
- A responsive dashboard and schedule interface with client-side filtering, loading, empty, and error states.

## Architecture and technical notes

The application uses Next.js App Router for both the web experience and JSON API. Interactive components call the shared API client; Route Handlers validate input and authorize requests before invoking domain services. Services own business rules and delegate persistence to repositories. Prisma maps the domain to PostgreSQL.

```text
Next.js pages / interactive components
                  │
         shared API client
                  │
        Route Handlers (/api)
        auth · validation · errors
                  │
       domain services and rules
                  │
         repositories / Prisma
                  │
             PostgreSQL
```

The dashboard aggregates room, schedule, equipment, and alert data from API requests when the page loads; it does not use a push-based real-time feed. For the implementation map and design details, see [Architecture](./docs/architecture.md).

## Run locally

**Prerequisites:** Node.js 20.9 or newer, npm, and Docker Desktop or a compatible Docker Compose runtime.

```bash
npm install
docker compose up -d
```

Create a root `.env` file:

```dotenv
DATABASE_URL="postgresql://medorch:medorch_dev_password@localhost:5432/medorch?schema=public"
```

Initialize the database and start the app:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed creates a local administrator; the development-only credentials and handling requirements are in [Local development](./docs/development.md). Do not use the Compose password or seeded account outside a local demo.

## A focused portfolio walkthrough

1. Sign in with the seeded development administrator.
2. Review the dashboard’s schedule, room, equipment, and alert summaries.
3. Open **Schedules** and inspect the filters for status, priority, date, department, room, and text search.
4. Create or edit a schedule using synthetic records; observe the required associations and conflict validation.
5. Explore the related API, service, and schema documentation to trace a request from UI to persistence.

The project does not include a hosted demo URL or bundled screenshot. Run it locally to demonstrate the workflow.

## Documentation

- [Product and workflow overview](./docs/product-overview.md) — intended users, implemented workflows, and a concise demo narrative.
- [Architecture](./docs/architecture.md) — request flow, modules, responsibilities, and implementation trade-offs.
- [API reference](./docs/api-reference.md) — route inventory, methods, authorization, validation, and response envelopes.
- [Data model](./docs/data-model.md) — entities, relationships, enums, and persistence constraints.
- [Local development](./docs/development.md) — setup, database lifecycle, seed behavior, and project commands.
- [Security and project boundaries](./docs/security-and-limitations.md) — implemented controls, known gaps, and non-production guidance.

## Quality checks

```bash
npm run lint
npm run build
```

There is currently no dedicated automated test script in `package.json`. See [Local development](./docs/development.md) for the current validation baseline.
