# Stage 3C — Change Manifest

**Date:** 6 November 2026  
**Baseline commit:** `2fac5ac` (`feat: add TheatreOperationsBoard and WorkforceOverview components`)  
**Working tree:** all Stage 3C changes are uncommitted. Nothing was committed, pushed, reset, stashed or switched to another branch.

## 1. New workspace boundary

| File | Change |
| --- | --- |
| `src/app/(workspace)/layout.tsx` | **New.** Server layout: `await requireAuth()` then one `<AppShell>{children}</AppShell>`. |
| `src/app/(workspace)/loading.tsx` | **New.** Content-only loading skeleton; shell remains mounted above it. |

## 2. Authenticated routes moved under `(workspace)`

All URLs are unchanged. Each source file below was moved to the destination path; most also had stale `AppShell` wrappers/imports removed.

| Former path | New path |
| --- | --- |
| `src/app/dashboard/page.tsx` | `src/app/(workspace)/dashboard/page.tsx` |
| `src/app/schedules/page.tsx` | `src/app/(workspace)/schedules/page.tsx` |
| `src/app/schedules/[id]/page.tsx` | `src/app/(workspace)/schedules/[id]/page.tsx` |
| `src/app/schedules/[id]/ScheduleDetails.tsx` | `src/app/(workspace)/schedules/[id]/ScheduleDetails.tsx` |
| `src/app/equipment/page.tsx` | `src/app/(workspace)/equipment/page.tsx` |
| `src/app/equipment/EquipmentManagement.tsx` | `src/app/(workspace)/equipment/EquipmentManagement.tsx` |
| `src/app/ot-rooms/page.tsx` | `src/app/(workspace)/ot-rooms/page.tsx` |
| `src/app/ot-rooms/OtRoomManagement.tsx` | `src/app/(workspace)/ot-rooms/OtRoomManagement.tsx` |
| `src/app/departments/page.tsx` | `src/app/(workspace)/departments/page.tsx` |
| `src/app/doctors/page.tsx` | `src/app/(workspace)/doctors/page.tsx` |
| `src/app/doctors/DoctorDirectory.tsx` | `src/app/(workspace)/doctors/DoctorDirectory.tsx` |
| `src/app/doctors/[id]/page.tsx` | `src/app/(workspace)/doctors/[id]/page.tsx` |
| `src/app/doctors/[id]/DoctorDetail.tsx` | `src/app/(workspace)/doctors/[id]/DoctorDetail.tsx` |
| `src/app/patients/page.tsx` | `src/app/(workspace)/patients/page.tsx` |
| `src/app/patients/PatientRegistry.tsx` | `src/app/(workspace)/patients/PatientRegistry.tsx` |
| `src/app/patients/[id]/page.tsx` | `src/app/(workspace)/patients/[id]/page.tsx` |
| `src/app/patients/[id]/PatientDetail.tsx` | `src/app/(workspace)/patients/[id]/PatientDetail.tsx` |
| `src/app/patients/appointments/page.tsx` | `src/app/(workspace)/patients/appointments/page.tsx` |
| `src/app/patients/appointments/MyAppointments.tsx` | `src/app/(workspace)/patients/appointments/MyAppointments.tsx` |
| `src/app/patients/appointments/[id]/page.tsx` | `src/app/(workspace)/patients/appointments/[id]/page.tsx` |
| `src/app/patients/appointments/[id]/AppointmentDetail.tsx` | `src/app/(workspace)/patients/appointments/[id]/AppointmentDetail.tsx` |
| `src/app/alerts/page.tsx` | `src/app/(workspace)/alerts/page.tsx` |
| `src/app/alerts/AlertsWorkspace.tsx` | `src/app/(workspace)/alerts/AlertsWorkspace.tsx` |
| `src/app/(dashboard)/admin/page.tsx` | `src/app/(workspace)/admin/page.tsx` |
| `src/app/(dashboard)/users/page.tsx` | `src/app/(workspace)/users/page.tsx` |
| `src/app/(dashboard)/audit/page.tsx` | `src/app/(workspace)/audit/page.tsx` |

The now-empty `src/app/(dashboard)/` route group is removed from the route tree. Moving from `(dashboard)` to `(workspace)` is URL-neutral.

### Content changes inside moved files

- Removed per-page `AppShell` imports and wrappers.
- Removed the `workspace` prop passed to `AppShell` from ADMIN dashboard/preview paths.
- Removed pre-existing unused locals in `DoctorDirectory` and `MyAppointments` that blocked the changed-file lint pass.
- No module markup, status colour, layout, data query, action or API call was redesigned.

## 3. Shared shell and theme files modified

| File | Change |
| --- | --- |
| `src/components/layout/AppShell.tsx` | Removed `workspace` prop and route/role theme resolution. Hard-codes `data-workspace="clinical"`, adds `data-app-shell`, `data-page-content`. Keeps one mount point. |
| `src/components/layout/Sidebar.tsx` | Authenticated rail changed from dark rail tokens to `bg-sheet` / ink / `border-rule`; active state uses clinical primary/soft tokens. Added `data-app-sidebar`. All links remain `next/link`. |
| `src/components/layout/Header.tsx` | Added `data-app-header`; formatting only otherwise. |
| `src/app/globals.css` | Replaced root clinical palette with the approved values; light rail; removed graphite operations token block and `color-scheme: dark` override; retained public/auth inverted `--rail` tokens and design-reference palettes. |
| `src/components/auth/AuthShell.tsx` | Dark-plate metadata text changed from `text-rail-muted` to explicit `text-white/60` so the light rail token cannot reduce contrast on the auth frontispiece. |
| `src/components/brand/Brand.tsx` | Same dark-plate contrast repair for `Wordmark` on chalk tone. |
| `src/app/error.tsx` | Recovery link changed from `<a>` to `next/link`; class order formatted. |
| `src/app/preview/[module]/PreviewClient.tsx` | Imports moved registry/management components from `src/app/(workspace)/…`; removed obsolete `Workspace` type and `workspace` prop. Preview still owns its own shell. |

## 4. Deleted file

| File | Reason |
| --- | --- |
| `src/lib/design/workspace.ts` | It mapped routes/roles to `clinical` or `operations`. There is now one authenticated environment, so the switch and its type are dead code. |

## 5. Documentation added

| File | Purpose |
| --- | --- |
| `docs/design-system/stage-3c/ROUTE_THEME_AUDIT.md` | Route inventory, root causes T1–T6 and N1–N5, per-page findings, repair plan. |
| `docs/design-system/stage-3c/NAVIGATION_ARCHITECTURE.md` | Route group, shell lifecycle, link behavior, auth/loading boundaries, history and direct-link model. |
| `docs/design-system/stage-3c/IMPLEMENTATION_REPORT.md` | Palette/token mapping, shell implementation, route moves, preserved boundaries, build results. |
| `docs/design-system/stage-3c/FUNCTIONAL_TEST_REPORT.md` | 96-check role pass, 7 detail pages, 12-check smoke, responsive and visual evidence, limitations. |
| `docs/design-system/stage-3c/CHANGE_MANIFEST.md` | This manifest. |

## 6. Evidence added

### Browser captures

- `screenshots/before/` — 3 dark baseline captures at 1440.
- `screenshots/after/` — 29 clinical files (28 unique captures plus one naming alias):
  - 10 ADMIN route captures at 1440;
  - Schedules, Equipment and Theatres at 1024 × 768 and 390 × 844;
  - Doctor, OT_STAFF and Patient dashboards at 1440, 1024 and 390;
  - schedule create dialog at 1440;
  - ADMIN schedule detail and PATIENT appointment detail at 1440.
- `screenshots/after/admin-theatres-1440.png` is the same `/ot-rooms` capture duplicated under the before/after naming convention; the canonical route is `/ot-rooms`.

### Raw test and build evidence

| File | Contents |
| --- | --- |
| `evidence/browser-role-checks.json` | 96 checks, 28 theme rows, 4 navigation rows, event counts, console/network capture. |
| `evidence/browser-role-run.log` | Role progress and final 96/0 summary. |
| `evidence/browser-detail-checks.json` | 7 detail-route theme checks and 2 detail screenshots. |
| `evidence/browser-navigation-smoke.json` | 12 navigation/dialog/form checks; zero console messages. |
| `evidence/typecheck.log` | `npx tsc --noEmit` success (empty output). |
| `evidence/lint-changed.log` | Changed-file ESLint success with `--max-warnings=0`. |
| `evidence/lint-src-all.log` | Whole-`src` lint baseline: 17 pre-existing warnings in two untouched files. |
| `evidence/build.log` | Production build route table and timing. |

## 7. Explicit non-changes

The following were **not** changed:

- Prisma schema, migrations, seed data, database contents or Docker configuration.
- Any `src/app/api/**` route, handler, validation schema, response shape or status code.
- Authentication configuration, session model, password/email flows, role definitions or permission rules.
- `package.json`, lockfiles or dependencies.
- Public landing page content, layout or palette.
- Public auth pages beyond the dark-plate contrast repair listed above.
- `/unauthorized` page.
- Design-system galleries and internal preview features, beyond import repair in `PreviewClient`.
- Module information architecture, card/table structure, responsive breakpoints or status vocabulary.
- Schedules, Equipment and Theatres business actions (create/edit/status assignment).

## 8. Verification status

| Item | Status |
| --- | --- |
| TypeScript | pass |
| Changed-file ESLint | pass |
| Production build | pass |
| Full role browser pass | 96 / 96 |
| Detail-route pass | 7 / 7 |
| Clean navigation smoke | 12 / 12 |
| Screenshots | 29 after (28 unique + alias) / 3 before |
| Repository-wide ESLint warnings | 17 pre-existing, in untouched files (documented limitation) |
| Loading/empty/error screenshots | not separately captured; source/theme audited |
