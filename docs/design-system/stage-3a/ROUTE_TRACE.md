# Stage 3A — Route Trace

## Investigation method

The trace covered:

- every application reference to `/alerts` and `alerts` outside generated Prisma code, docs and screenshots;
- the `src/app` route tree for an existing page, route group, redirect or dynamic segment;
- the alert API, service, repository, validation, permissions and Prisma model;
- the header alert drawer and dashboard alert summaries;
- project documentation mentioning alerts;
- Git history for a deleted `src/app/alerts` route.

## Direct `/alerts` links

| File | Line | Context | Destination |
| --- | --- | --- | --- |
| `src/components/dashboard/HospitalIntelligence.tsx` | 354 | Critical-alert ribbon action “Respond” | `/alerts` |
| `src/components/dashboard/HospitalIntelligence.tsx` | 540 | “Needs a decision” panel header “All alerts →” | `/alerts` |

These are the only application links to `/alerts`. Both appear on the ADMIN operations floor. No navigation item, redirect, route constant or API route pointed to a different alerts page.

The `AlertCenter` in `src/components/layout/Header.tsx` is a popover drawer, not a route. It opens in place and does not navigate.

## Existing alert implementation

### UI

| File | Role |
| --- | --- |
| `src/components/alerts/AlertCenter.tsx` | Header drawer; fetches `/api/alerts`, marks one/all read, dismisses |
| `src/components/dashboard/AlertsSummaryWidget.tsx` | Dashboard summary of unread alerts |
| `src/components/dashboard/OperationalOverview.tsx` | Dashboard counts from `/api/alerts` |
| `src/components/dashboard/HospitalIntelligence.tsx` | ADMIN alert rail and the two `/alerts` links |

The drawer already provided alert reading and actions, but the dashboard links promised a full register. There was no full-page surface.

### API routes

| Route | Methods | Source |
| --- | --- | --- |
| `/api/alerts` | GET, POST | `src/app/api/alerts/route.ts` |
| `/api/alerts/[id]` | GET, PATCH, DELETE | `src/app/api/alerts/[id]/route.ts` |
| `/api/alerts/[id]/read` | PATCH | `src/app/api/alerts/[id]/read/route.ts` |
| `/api/alerts/read-all` | PATCH | `src/app/api/alerts/read-all/route.ts` |

All four use `authorizeApiPermission` before touching the service. The list route enforces `alerts:read`; read/update routes accept `alerts:update` or `alerts:update:own`; delete accepts `alerts:delete` or `alerts:delete:own`.

### Service and repository

- `src/modules/alerts/alerts.service.ts` forces `effectiveFilter.userId = requestingUser.id` for every role except ADMIN.
- `getAlertById`, `updateAlertById`, `markAlertAsReadById` and `deleteAlertById` independently verify ownership for non-admins.
- `markAllAlertsAsRead` rejects a target user other than the requesting user unless the requester is ADMIN.
- `src/modules/alerts/alerts.repository.ts` performs alert writes and audit-log creation inside Prisma transactions.
- `src/modules/alerts/alerts.validation.ts` validates IDs, list filters, creation and updates.

### Data model

`prisma/schema.prisma` contains:

- `AlertType`: `SCHEDULE`, `RESOURCE`, `SYSTEM`, `MAINTENANCE`
- `AlertSeverity`: `INFO`, `WARNING`, `CRITICAL`
- `Alert`: recipient user, optional schedule, type, title, message, severity, read state, read timestamp, creation timestamp
- indexes for user/read state, schedule, severity and creation time

### Permissions

`src/lib/auth/permission.ts` grants `alerts:read` to ADMIN, DOCTOR, OT_STAFF and PATIENT. Non-admin scoping is a service rule, not a missing page permission.

## Route inventory

Before this stage, `src/app` contained alert API routes under `src/app/api/alerts/`, but no `src/app/alerts/` directory and no page that rendered a full alert register.

The app also has `/dashboard`, `/schedules`, `/patients`, `/doctors`, `/departments`, `/equipment`, `/ot-rooms`, `/users`, `/audit`, `/unauthorized`, `/login`, `/register`, `/preview/[module]` and the design-system routes. None is an alerts register under another name.

## Historical check

`git log --all -- src/app/alerts` returned no commits. `git log --all --diff-filter=D --name-only` returned no deleted `src/app/alerts` path. There is no evidence that a page existed and was removed in the available history.

## Documentation references

`MEDORCH_DOCUMENTATION_FULL.md` lists `/api/alerts` and `AlertCenter.tsx` but does not list an `/alerts` page. `PROJECT_STATUS.md` describes alerts as “User-scoped API, alert center, read/read-all and dashboard summary.” This matches the tree: the domain and drawer exist; the page was never added.

## Root cause

The 404 was a missing destination, not an incorrect link:

1. The dashboard correctly links “Respond” and “All alerts” to `/alerts`.
2. The alerts domain is fully implemented behind `/api/alerts`.
3. No `/alerts` page route was ever created.
4. Clicking or prefetching the link therefore reached a non-existent page and returned 404.

## Corrective decision

Creating a page is the smallest correct fix because:

- changing the links to `/dashboard` would discard the promised full register;
- opening the header drawer from a dashboard link would require coupling two unrelated components and would not provide a shareable destination;
- no other alerts page exists to redirect to.

The new route reuses the existing API and actions rather than adding a parallel data path. There is no change to the link destinations, the alert service, the repository, the API or the Prisma schema.
