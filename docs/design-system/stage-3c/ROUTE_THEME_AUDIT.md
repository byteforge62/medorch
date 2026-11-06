# Stage 3C — Route and Theme Audit

**Audit date:** 6 November 2026  
**Baseline commit:** `2fac5ac`  
**Audit method:** source inspection of every route page, `AppShell`, navigation and the semantic token layer; role permissions read from `src/lib/auth/permission.ts`; pre-change production screenshots captured at 1440 px.

## 1. Accessible route inventory

The product shell is used by the routes below. Access is decided server-side by `requireAuth`, `requireRole` or `requirePermission`; the table records the permission source, not a client-side menu rule.

| Route | ADMIN | DOCTOR | OT_STAFF | PATIENT | Server guard |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | Yes | Yes | Yes | Yes | `requireAuth`, role branch |
| `/schedules` | Yes | Yes | Yes | No | `requireAuth` |
| `/schedules/[id]` | Yes | Yes | Yes | No | `requireRole(ADMIN, DOCTOR, OT_STAFF)` |
| `/departments` | Yes | Yes | Yes | No | `departments:read` |
| `/patients` | Yes | Yes | No | No | `patients:read` |
| `/patients/[id]` | Yes | Yes | No | No | `patients:clinical:read` |
| `/patients/appointments` | No | No | No | Yes | `schedules:read:own` |
| `/patients/appointments/[id]` | No | No | No | Yes | `schedules:read:own` |
| `/doctors` | Yes | Yes | Yes | No | `doctors:read` |
| `/doctors/[id]` | Yes | Yes | Yes | No | `doctors:read` |
| `/equipment` | Yes | Yes | Yes | No | `requireRole(ADMIN, DOCTOR, OT_STAFF)` |
| `/ot-rooms` | Yes | Yes | Yes | No | `requireRole(ADMIN, DOCTOR, OT_STAFF)` |
| `/alerts` | Yes | Yes | Yes | Yes | `alerts:read` |
| `/users` | Yes | No | No | No | `requireRole(ADMIN)` |
| `/audit` | Yes | No | No | No | `requireRole(ADMIN)` |
| `/unauthorized` | Any session | Any session | Any session | Any session | Public boundary page |
| `/login`, `/register`, password flows | Public | Public | Public | Public | Public boundary |
| `/preview/[module]` | Internal visual harness | Internal | Internal | Internal | Not linked from product |
| `/design-system/*` | Internal design reference | Internal | Internal | Internal | Not linked from product |

The patient navigation exposes Dashboard and My appointments; `/alerts` remains directly accessible because PATIENT holds `alerts:read` and the Alerts API scopes records to the signed-in patient.

## 2. Theme findings

### T1 — Route-driven dark environment (root cause)

`src/lib/design/workspace.ts` returned `operations` for every path under `/ot-rooms`, `/equipment` and `/schedules`. `AppShell` wrote that value into `data-workspace`, and `globals.css` then applied a graphite token set, including `color-scheme: dark`. This is why Schedules, Equipment and Theatres rendered dark for ADMIN, DOCTOR and OT_STAFF.

### T2 — Role-driven dark dashboard

The same function returned `operations` for `/dashboard` when the role was ADMIN or OT_STAFF. The ADMIN page passed an explicit `workspace="clinical"` override in Stage 3B, but OT_STAFF had no override and therefore received the dark environment.

### T3 — Dark navigation rail

The clinical token set itself used `--rail: #0e2433`, `--rail-elevated: #16334a`, and chalk text. Even light pages therefore had a dark sidebar. This is a theme inconsistency independent of `data-workspace`.

### T4 — Palette did not match the approved clinical values

The root tokens differed from the approved palette: paper `#f4f7fa` instead of `#F5F8FB`, primary `#17324d` instead of `#245B8F`, teal `#087e8b` instead of `#168C91`, text `#172b3a` instead of `#243447`, secondary text `#647586` instead of `#718096`, borders `#dfe6ec` instead of `#E3EAF0`, success `#279b78` instead of `#24845D`, warning `#a87318` instead of `#B7791F`, and danger `#d95d5d` instead of `#C74646`.

### T5 — Incorrect theme in state surfaces

Because state components read semantic tokens, the whole set inherited the dark scope: tables, filter bars, selects, calendar cells, dialogs, loading panels and error panels. Individual components did not carry separate dark styles; fixing the scope is the correct shared repair.

### T6 — Intentional dark surfaces outside the authenticated workspace

The public landing page, the two-column sign-in frontispiece, `/unauthorized`, the design-system galleries and the visual preview harness are separate boundaries. They are documented but are not role workspaces and are not being flattened into the authenticated shell.

## 3. Navigation findings

### N1 — Shell was duplicated inside every page

Every authenticated page imported `AppShell` and rendered it around its content. There was no `layout.tsx` under a shared authenticated route group. React therefore treated each route's shell as a new subtree and remounted the sidebar, header and session consumers on navigation. The URL changed through `next/link`, but the shell visibly reset.

### N2 — No routing-level reload handler

The sidebar already used `next/link`; no navigation handler used `window.location.href` or `window.location.assign`. The observed “reload” was a full shell remount, not a document navigation. The only ordinary `<a>` in the authenticated area was the recovery link in the global error page.

### N3 — No section-level loading inside the shell

The only loading route was `src/app/loading.tsx`, a full-page placeholder. There was no authenticated-group `loading.tsx`, so route streaming could not preserve the shell while section content loaded.

### N4 — Route groups did not provide a shared layout

`(dashboard)` contained only `/admin`, `/audit` and `/users`; the rest of the authenticated routes lived outside any common group. There was no persistent layout boundary to hold navigation state.

### N5 — History and direct links were structurally correct

Internal links are `Link` components and routes are ordinary App Router pages, so browser history and direct URLs should remain correct once the shell is moved into a layout. This was verified again after the change rather than assumed.

## 4. Pages reviewed individually

- **Dashboard:** ADMIN forced clinical in Stage 3B; DOCTOR and PATIENT clinical; OT_STAFF inherited dark operations. No page-level body background was found.
- **Schedules:** dark due to route scope; calendar, list, filters and form all inherited correctly.
- **Schedule detail:** dark due to route scope; its selects, notes, staff and equipment panels use shared tokens.
- **Equipment:** dark due to route scope; filter select, table, create/edit form and status select inherited correctly.
- **Theatres:** dark due to route scope; room cards, detail rail, selects and status indicators inherited correctly.
- **Departments, Doctors, Patients:** clinical by route; checked for hardcoded dark surfaces and found none requiring a module-level change.
- **Alerts:** clinical by route; checked severity colours against the approved palette.
- **Users and Audit:** clinical by route; no module-level dark styles.
- **Patient appointments:** clinical by route; checked mobile agenda and detail panels.
- **Auth, landing, unauthorized:** intentionally separate; left unchanged except for the error-page link behavior noted below.

## 5. Pre-change browser evidence

Captured against the running production build before any source edit:

- `screenshots/before/admin-schedules-1440.png`
- `screenshots/before/admin-equipment-1440.png`
- `screenshots/before/admin-theatres-1440.png`

The screenshots show the graphite page ground, graphite panels, dark table headers and dark navigation. These are the baseline for the after comparison.

## 6. Repair plan

1. Put all authenticated routes under one `(workspace)` route group with a server layout. The layout performs `requireAuth` and renders the single persistent `AppShell`; page-level authorization remains unchanged.
2. Remove `AppShell` from individual pages so only one shell exists.
3. Add a workspace `loading.tsx` that preserves the shell and replaces only the content region during navigation.
4. Set the authenticated workspace to the clinical environment only. Remove the unused operations environment and the route/role switch that selected it.
5. Replace the root tokens with the approved palette, including a light navigation rail.
6. Keep landing, auth and unauthorized boundaries outside the workspace group.
7. Replace the remaining hard navigation in the global error recovery link with `next/link`.
8. Verify navigation with document-load counters, retained shell DOM identities, active navigation state, history and direct links for every role.

## 7. Post-repair status

All eight repairs above were implemented and exercised against the production build:

| Check | Result |
| --- | --- |
| Theme rows across the 28 accessible route instances | 28 / 28 pass |
| Dynamic detail routes sampled across all four roles | 7 / 7 pass |
| Full role-run assertions | 96 / 96 pass |
| Frame navigations during sidebar/history sequences | 0 for every role |
| SQL / API / auth / dependency changes | none |

The implementation details are in `IMPLEMENTATION_REPORT.md`; the measured results and limitations are in `FUNCTIONAL_TEST_REPORT.md`.
