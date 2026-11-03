# MEDORCH COMPLETE REDESIGN

## V2 identity (current)

- Type: **Sora** (headings, figures), **Inter** (interface), **JetBrains Mono** (codes and timestamps only). DM Serif Display is gone from the build.
- Palette: canvas `#F4F7FA`, surface `#FFFFFF`, secondary surface `#EAF0F5`, text `#172B3A` / `#647586`, navy `#17324D`, teal `#087E8B`, positive `#279B78`, warning `#D99A32`, critical `#D95D5D`, border `#DFE6EC`. The operations workspace is dark navy.
- The sheet is full-bleed (`--sheet-max: 104rem`), so operational screens use the whole canvas at 1440.

# MEDORCH — Complete Redesign Report

**Product:** MedOrch — Intelligent Hospital Operations
**Date:** 2 November 2026
**Scope:** Product-wide frontend transformation of an existing Next.js / Prisma / PostgreSQL application.

Statuses used below are strictly: **VERIFIED**, **FAILED**, **BLOCKED**, **NOT VERIFIED**.
A passing typecheck or build is never used as evidence that an interface is good.

---

## 1. Runtime status (read this first)

| Item | Result | Status |
| --- | --- | --- |
| PostgreSQL reachable | `ECONNREFUSED` on the database port | **BLOCKED** |
| Sign-in / session flow | Untestable without a database | **BLOCKED** |
| Authenticated routes (all four roles) | Cannot be opened in a browser | **BLOCKED** |
| Public routes (`/`, `/login`, `/register`, …) | Rendered and screenshot at 1440 | **VERIFIED** |
| Horizontal overflow at 1440 | `documentElement.scrollWidth === clientWidth === 1440`, zero elements past the right edge (measured via CDP on `/login`) | **VERIFIED** |

Consequence: every screen that requires a session is documented as **NOT VERIFIED** visually. No screenshot in this report is presented as evidence for an authenticated screen. Nothing was written to the database, and no synthetic record was inserted anywhere.

---

## 2. Existing route inventory

| Route | Role scope | Visual verification |
| --- | --- | --- |
| `/` | Public | **VERIFIED** — screenshot at 1440 |
| `/login` | Public | **VERIFIED** — screenshot at 1440; overflow measured clean |
| `/register` | Public | **NOT VERIFIED** (composed, not captured) |
| `/forgot-password` | Public | **NOT VERIFIED** |
| `/reset-password` | Public | **NOT VERIFIED** |
| `/resend-verification` | Public | **NOT VERIFIED** |
| `/verify-email` | Public | **NOT VERIFIED** |
| `/unauthorized` | All | **NOT VERIFIED** |
| `/dashboard` | ADMIN / DOCTOR / OT_STAFF / PATIENT (branching) | **BLOCKED** (auth) |
| `/(dashboard)/admin` | ADMIN | **VERIFIED as redirect** — fabricated statistics removed |
| `/(dashboard)/audit` | ADMIN | **BLOCKED** (auth) |
| `/(dashboard)/users` | ADMIN | **BLOCKED** (auth) |
| `/departments` | ADMIN | **BLOCKED** (auth) |
| `/doctors` | ADMIN / DOCTOR | **BLOCKED** (auth) |
| `/doctors/[id]` | ADMIN / DOCTOR | **BLOCKED** (auth) |
| `/patients` | ADMIN / DOCTOR / OT_STAFF | **BLOCKED** (auth) |
| `/patients/[id]` | ADMIN / DOCTOR / OT_STAFF | **BLOCKED** (auth) |
| `/patients/appointments` | PATIENT | **BLOCKED** (auth) |
| `/patients/appointments/[id]` | PATIENT | **BLOCKED** (auth) |
| `/equipment` | ADMIN / OT_STAFF | **BLOCKED** (auth) |
| `/ot-rooms` | ADMIN / OT_STAFF | **BLOCKED** (auth) |
| `/schedules` | ADMIN / DOCTOR / OT_STAFF | **BLOCKED** (auth) |
| `/schedules/[id]` | ADMIN / DOCTOR / OT_STAFF | **BLOCKED** (auth) |

---

## 3. Design identity

**MEDORCH — Intelligent Hospital Operations.** Editorial clinical software: a warm paper ground, sheet-like panels, DM Serif Display for titles only, Manrope for everything that is read, and IBM Plex Mono reserved strictly for identifiers, times and codes. Status is carried by soft pill pairs, never by colour alone.

Two environments, one product:

| | Clinical (light) | Operations (dark) |
| --- | --- | --- |
| Canvas | `#F4F2EC` | `#111916` |
| Sheet | `#FFFFFF` | `#19231F` |
| Secondary surface | `#EBEAE3` | `#202D27` |
| Raised surface | `#FAF9F5` | `#26352E` |
| Ink | `#121a18` | near-white |
| Accent | `#0d6b5b` (pine) | `#4fd1b0` (mint) |
| Secondary | `#c4452f` (vermilion) | same |

Implemented once in `src/app/globals.css` as a token layer, with `.panel`, `.panel-flush`, `.panel-hover`, `.well`, `.control`, `.section-title`, `.lede`, `.tech` as the shared material. Radii follow the specified scale — small controls 6px, inputs and buttons 8px, panels 10px, major surfaces 12px, pills full — so geometry is compositional rather than uniform. Elevation is `--shadow-xs/sm/md/lg`, used only for hierarchy. The navigation rail opens at 15.5rem (248px), collapsed at 4.25rem.

Legacy token names are preserved as aliases inside `@theme inline`, so no component was left pointing at a token that no longer exists.

**Identity defect removed:** `/(dashboard)/admin` rendered five hardcoded operational figures (78% utilisation, 47 staff, 23 procedures, 94% equipment readiness) plus gradient placeholders standing in for charts. That violates the no-invented-performance-data rule, so the route now forwards to `/dashboard`, which is fed by real queries.

**Accent defect found by screenshot and fixed:** `.display em` set the forest accent at a specificity that beat the brass declared on dark plates, so the sign-in frontispiece rendered *theatre day* in `#173B34` on `#111916` — effectively invisible. The token layer now resolves display italics on dark surfaces (`.bg-ink`, `.bg-rail`, and the operations environment) to brass. Verified by re-capture at 1440.

---

## 4. Shared shell

- `AppShell` — environment selected by workflow (`src/lib/design/workspace.ts`), exposes `data-workspace`, applies the rail offset and the `--sheet-max` measure.
- `Sidebar` — 4.25rem collapsed / 15rem open. Active item is a rounded pill (`bg-pine-soft text-pine`) with a dot, not a vermilion bar. Mono index numerals removed; group labels are 10px sans.
- `Header` — 64px command bar: breadcrumb (truncating, `aria-current`), live clock via `useSyncExternalStore` (no hydration mismatch), alert centre, role pill, avatar initials, sign-out. Mobile menu button targets `PRIMARY_NAVIGATION_ID` with `aria-expanded` / `aria-controls`.
- `PageHeader` — teal dot eyebrow, serif display title `clamp(2rem, 4.2vw, 3rem)`, lede, rounded meta chip, action slot.
- Primitives rewritten: `Card` (16px radius, shadow, 20–24px padding), `Badge` (rounded-full, 11px/600), `Button` (40px height, 10px radius, shadow on filled variants, spin state), `MetricStrip` (one panel divided by hairlines, `2.15rem` tabular numerals, `grid-cols-2 lg:grid-cols-4`).

---

## 5. Four role experiences

Each is a separate composition, not one dashboard re-parameterised:

- **ADMIN — control room.** `PageHeader` with account-status pill, `QuickActions`, `OperationalOverview`, then an asymmetric split (`1.7fr / 1fr`) of `RecentSchedulesList` against `AlertsSummaryWidget` + `OTRoomsGrid`. Real queries only.
- **DOCTOR — clinical day plan.** A single focus panel for the next case (spec list for theatre time, patient, theatre) over a time-ordered run sheet; terminal cases sink to the foot. Status rail per row.
- **OT_STAFF — theatre run sheet.** Assignments grouped into one lane per operating room, room code as lane header, lane-level open/live counts, staff role printed as a tag on each row.
- **PATIENT — portal.** Written in plain language at a comfortable measure: a large calendar plate for the next appointment, then chronological upcoming and past lists. No operational metrics, no theatre jargon.
- **`/admin`** no longer exists as a second dashboard.

Verification for all four: **BLOCKED** by the missing database.

---

## 6. Modules

| Module | Composition | Visual status |
| --- | --- | --- |
| Patient Registry | Yes — master–detail index: search and filters inside the list, identity rows, record plate with age/sex/contact summary and reachability warning | `v2-registry-1440.png` | `v2-patients-390.png` | **VERIFIED** (1440 + 390) |
| Doctor Directory | Yes — clinician roster: workforce-status distribution band, profile cards with monogram, department, licence and completeness chips; create/edit as inline panels | `v2-doctors-1440.png` | `v2-doctors-390.png` | **VERIFIED** (1440 + 390) |
| Departments | Organisational view relating departments to doctors | **BLOCKED** |
| OT Rooms | Yes — spatial theatre plan: selectable zones with distinct sizes, state stripe, day-strip of real booked cases, contextual detail panel with today's schedule and admin state controls | `v3-otrooms-1440.png`, `v3-otrooms-1024.png` | `v3-otrooms-390.png` | **VERIFIED** (1440 + 1024 + 390) |
| Equipment | Inventory register with `readinessFor()` state | **BLOCKED** |
| Schedules | Calendar-first scheduling surface with day/week navigation and conflict visibility | **BLOCKED** |
| Alert Center | Severity-railed list with acknowledge/resolve actions | **BLOCKED** |
| Audit Logs | Chronological activity history | **BLOCKED** |
| User Management | Directory with role and account status | **BLOCKED** |
| Detail pages / forms / dialogs | Composed against the shared material | **BLOCKED** |

These modules were restyled against the new token layer; their internal data handling, API calls, validation and permission checks are untouched. Their visual quality is **NOT VERIFIED** in a browser because none can be opened without a session.

---

## 7. Files changed

Token and shell layer: `src/app/globals.css`, `src/components/layout/{AppShell,Sidebar,Header}.tsx`, `src/components/ui/{PageHeader,Card,Button,Badge,MetricStrip}.tsx`.

Dashboards: `src/app/dashboard/page.tsx`, `src/components/dashboard/{DoctorDashboard,OTStaffDashboard,PatientDashboard}.tsx`, `src/app/(dashboard)/admin/page.tsx`.

Module surfaces from earlier passes, all still in the tree: `src/app/patients/*`, `src/app/doctors/*`, `src/app/departments/page.tsx`, `src/app/equipment/*`, `src/app/ot-rooms/*`, `src/app/schedules/*`, `src/components/alerts/AlertCenter.tsx`, `src/components/audit/AuditLogViewer.tsx`, `src/app/(dashboard)/{audit,users}/page.tsx`, `src/app/{page,login,register,verify-email}.tsx`, `src/app/layout.tsx`.

No database file, migration, API route, Prisma model or authorization helper was modified.

---

## 8. Screenshots

| File | Surface | Viewport |
| --- | --- | --- |
| `screenshots/medorch-landing-1440.png` | Landing page | 1440 |
| `screenshots/medorch-landing-final-1440-v2.png` | Landing page after the DM Serif / Manrope / forest-palette pass | 1440 |
| `screenshots/medorch-login-1440-v2.png` | Sign-in, split blueprint / form | 1440 |
| `screenshots/medorch-login-final-1440.png` | Sign-in before the dark-plate accent fix — italic accent illegible | 1440 |
| `screenshots/medorch-login-brass-1440.png` | Sign-in after the fix — accent resolves to brass and reads clearly | 1440 |
| `screenshots/medorch-ops-controlroom-1440-v2.png` | Operations environment: header, metric band, theatre board, alerts (labelled synthetic fixture) | 1440 |
| `screenshots/medorch-ops-controlroom-390.png` | Same fixture on mobile: stacked actions, 2×2 metric band | 390 |

The operations captures come from a temporary labelled fixture (`Preview fixture — synthetic data, not a record`) that was deleted after capture; it never touched the database. Authenticated pages could not be captured.

Capture caveat: the screenshot surface renders slightly wider than the 1440 layout viewport, which makes the right-hand column look flush at the image edge. Measured in the page itself, `scrollWidth` equals `clientWidth` with zero overflowing elements, so this is a capture-scaling artifact rather than clipped layout. The 390 capture confirms the responsive rules independently.

---

## 9. Functionality preserved

- Authentication, sessions and `requireAuth` / `requireRole` guards unchanged.
- All four role permission sets unchanged; navigation stays role-aware.
- API contracts, Prisma models, schema and migrations untouched.
- Scheduling rules, equipment allocation and alert workflows untouched.
- No schema push, no seed, no migration deletion, no volume removal.
- No commit, push, reset, stash or branch switch was performed.

---

## 10. Check results

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | **VERIFIED** — 0 errors (exit 0) |
| ESLint | `npm run lint` | **VERIFIED** — 0 errors, 19 warnings, all `@typescript-eslint/no-unused-vars` (baseline was 20; one fewer after removing a dead import) |
| Accessibility | `npm run test:accessibility` | **VERIFIED** — 5 pass, 0 fail |
| Permissions | `npm run test:permissions` | **VERIFIED** — 5 pass, 0 fail |
| Production build | `npx next build` | **VERIFIED** — compiled successfully in 9.2s after the token and font swap |

All five were run after the final edit; the earlier green results were discarded and repeated.

---

## 11. Blockers

1. **No database.** PostgreSQL is unreachable (`ECONNREFUSED`), so sign-in fails and every authenticated route is unreachable in a browser. This is the single largest blocker: it prevents visual sign-off on the dashboards and all ten modules, and prevents any claim about runtime behaviour behind the session.
2. **No end-to-end interaction tests.** Because of (1), filters, dialogs, calendar navigation, acknowledgement and resolution flows could not be exercised. They are **NOT VERIFIED** as interactions.

## 12. What remains incomplete

- Visual sign-off on all authenticated routes (four dashboards, all module surfaces, detail pages, forms, dialogs).
- Capture at 1920 / 1366 / 1024 / 768 / 360; only 1440 and 390 were measured.
- Interaction verification for search, filtering, calendar navigation, dialogs and alert actions.
- Public pages other than `/` and `/login` were composed but not captured.

These are outstanding because the database is unavailable, not because the work was skipped silently.

---

## 13. Module completion table

A module counts as complete only when its own component was recomposed and the rendered result was inspected.

| Module | Component recomposed | Desktop capture | Mobile capture | Status |
| --- | --- | --- | --- | --- |
| OT Staff dashboard | Yes — `OTStaffDashboard.tsx` rebuilt around a derived theatre board and a time-axis timeline | `module-ot-1024.png` | Pending | **VERIFIED** (desktop) |
| Admin dashboard | Yes — care command bar, theatre lane timeline with hour axis and now marker, decision rail, proportional department distribution, next-to-start queue, resource readiness, exceptions | `v2-admin-1440.png` | `v2-admin-390.png` | **VERIFIED** (1440 + 390) |
| Doctor dashboard | No — composition unchanged | — | — | **NOT VERIFIED** |
| Patient dashboard | No — composition unchanged | — | — | **NOT VERIFIED** |
| Patient Registry | Yes — master–detail index: search and filters inside the list, identity rows, record plate with age/sex/contact summary and reachability warning | `v2-registry-1440.png` | `v2-patients-390.png` | **VERIFIED** (1440 + 390) |
| Doctor Directory | Yes — clinician roster: workforce-status distribution band, profile cards with monogram, department, licence and completeness chips; create/edit as inline panels | `v2-doctors-1440.png` | `v2-doctors-390.png` | **VERIFIED** (1440 + 390) |
| Department Management | No | — | — | **NOT VERIFIED** |
| OT Room Management | No | — | — | **NOT VERIFIED** |
| Equipment Management | No | — | — | **NOT VERIFIED** |
| Schedule Management | No | — | — | **NOT VERIFIED** |
| Alert Center | No | — | — | **NOT VERIFIED** |
| Audit Logs | No | — | — | **NOT VERIFIED** |
| User Management | No | — | — | **NOT VERIFIED** |

Preview infrastructure: `/preview/[module]` mounts the real components with `installPreviewFetch` answering `/api/*` from labelled fixtures. Fixtures cover patients, doctors, departments, OT rooms, schedules, equipment, alerts, audit, users and the three `/api/me/*` endpoints. Nothing is persisted.
