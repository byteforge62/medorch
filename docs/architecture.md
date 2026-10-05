# Architecture

## System shape

MedOrch is a single Next.js application backed by PostgreSQL. It uses the App Router for rendered pages and Route Handlers for JSON APIs; it does not have a separately deployed frontend or API service.

```text
Browser
  │
  ├── App Router pages and layouts
  │     ├── server-side authentication and page guards
  │     └── React client components for interactive views
  │
  └── /api Route Handlers
        ├── session / role authorization
        ├── Zod input validation
        ├── domain services
        ├── Prisma repositories
        └── PostgreSQL
```

## Request lifecycle

1. A page or interactive component loads a view. Client components use the shared `apiClient` for JSON requests.
2. A Route Handler obtains a request identifier and applies the authorization appropriate to that operation.
3. The handler parses route parameters, query values, or JSON bodies with the domain's Zod schemas.
4. A domain service enforces rules that require related database records or state—for example, checking a schedule's room, department, surgeon, and conflicts.
5. A repository performs the Prisma query or write.
6. The handler returns a shared success or error response; the client converts error responses to `ApiClientError`.

Not every module uses precisely the same helper path. Use the individual route and service as the source of truth for an operation's current behavior.

## Code organization

| Location | Responsibility |
| --- | --- |
| `src/app/` | App Router pages, layouts, error states, and API Route Handlers. |
| `src/components/` | Dashboard, schedule, alert, user, layout, and shared interface components. |
| `src/lib/auth/` | Credential verification, session access, role checks, and permission definitions. |
| `src/lib/api/` | Request authorization helper, response envelope, validation helper, request identifier, and browser API client. |
| `src/lib/db/` | Prisma client configured with the PostgreSQL adapter. |
| `src/modules/<domain>/` | Domain validation, service rules, and repository access for a feature area. |
| `src/modules/audit/` | Audit record service and persistence access. |
| `src/generated/prisma/` | Generated Prisma client and model types. |
| `prisma/` | Prisma schema, SQL migrations, and development seed. |

The domain modules include alerts, audit, departments, doctors, equipment, operating rooms, patients, schedules, and users.

## Architectural choices

### Domain services own cross-record rules

Schema validation handles input shape and local constraints such as enum membership and time ordering. The schedule service performs checks that depend on persisted data: active department, room-to-department alignment, room availability, surgeon role/status, and conflicting schedules. This separates request parsing from operational rules.

### Route Handlers own transport concerns

Handlers translate HTTP input into validated domain calls, enforce operation-level access, and translate domain failures into HTTP responses. Shared response and client helpers provide a common envelope, while error mapping remains endpoint-aware.

### Prisma models the operational relationships

The relational schema makes schedule ownership and assignments explicit. Foreign keys and uniqueness constraints protect identity and association rules; indexes target common lookups such as schedule time, room, surgeon, status, and unread alerts.

## Persistence and runtime

Prisma 7 uses the PostgreSQL adapter (`@prisma/adapter-pg`). The application client is a shared module instance and is cached on `globalThis` during development to avoid repeated connections during hot reload. Docker Compose provisions PostgreSQL 17 for local development.

## Current trade-offs and boundaries

- Dashboard counts are assembled from API list requests on the client; there is no dedicated aggregate endpoint or push-based update channel.
- Schedule lists and their filters are loaded and filtered in the browser in the current interface.
- Schedule conflict detection is performed in service logic before persistence. The schema does not declare a database exclusion constraint for overlapping time ranges.
- Role permissions are enforced at route level and differ by operation. The permission definition is not a universal policy engine; consult the [API reference](./api-reference.md).
- Audit records are written by selected domain operations. Their presence does not by itself provide a compliance-grade immutable audit system.

These are documented implementation limits, not claims about a production architecture.
