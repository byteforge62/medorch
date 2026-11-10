# MedOrch lavender UI transformation

Visual-only redesign of the existing Operation Scheduler. The schedule API, Prisma schema, authentication, role rules, validation, filters and CRUD behaviour are unchanged.

## Design system

- Lavender environment (`#F0ECFA` page field, `#E8E1F7` layered geometry) around a white working sheet.
- Violet `#6550B5` / `#8D7AD0` actions, active navigation, icon tiles, focus rings and selection.
- Layered fixed background shapes, curved rules, local SVG medical illustrations and soft violet shadows.
- Persistent white sidebar with labelled navigation and lavender icon tiles; mobile drawer below `lg`.
- White capsule header with breadcrumb, live theatre clock, alert centre and identity controls.
- Shared primitives for buttons, cards, inputs, badges, status pills, page headers, empty, loading and error states.
- Tokens centralized in `src/app/globals.css`; reduced-motion support retained.
- Existing Phosphor icon library used throughout; no mixed icon sets or emoji.

## Routes covered

- Public: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification`, `/unauthorized`.
- Workspace: `/dashboard`, `/schedules`, `/schedules/[id]`, `/departments`, `/patients`, `/patients/[id]`, `/patients/appointments`, `/patients/appointments/[id]`, `/doctors`, `/doctors/[id]`, `/equipment`, `/ot-rooms`, `/alerts`, `/audit`, `/users`.
- Shared shell, dialogs, forms, filters and error/not-found surfaces.

## Key files

- `src/app/globals.css`
- `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`
- `src/components/brand/Brand.tsx`
- `src/components/visual/MedicalOrbit.tsx`
- `src/components/auth/AuthShell.tsx`, `auth-styles.ts`, `LoginForm.tsx`
- `src/components/landing/clinical/*`
- `src/components/dashboard/admin/AdminDashboard.tsx`
- `src/components/schedules/*`
- `src/components/patients`, `doctors`, `equipment`, `departments`, `users`, `audit`, `alerts` feature components
- `src/components/ui/*`

## Verification

- `npx tsc --noEmit` — pass.
- `npx eslint <changed ts/tsx files>` — pass.
- `npm run build` — pass (49 routes generated).
- `npm run test:schedule-constraints` — 8/8.
- `npm run test:permissions` — 5/5.
- `npm run test:accessibility` — 5/5.
- `npm run test:me-read-handlers` — 9/9.
- `npm run test:database` — 30/31; only `alerts-repository-audit.test.ts` skipped by its documented disposable `medorch_alerts_test_*` database guard.
- Production route smoke at 1024 px: dashboard, schedules, departments, patients, doctors, equipment, theatres, alerts, audit, users — all loaded, zero horizontal overflow. Schedule, patient and doctor detail pages loaded without errors.
- Browser console: no errors on production dashboard/routes; API requests returned 200.
- Runtime authorization harness: did not pass in this environment (2/11). The harness's NextAuth origin is pinned to another local server (`:5274`) instead of its temporary production port, so seeded sessions were not usable, and two assertions issue GET requests with bodies. Manual authenticated route smoke tests passed.

## Limitations

- No destructive database operations, commits or branch changes were performed.
- Create/update/delete APIs were not mutated during this visual pass; existing forms and handlers were preserved unchanged.
- Patient-role appointment screens were restyled but not exercised with a patient account in this pass.
- The runtime authorization suite requires a clean environment with `NEXTAUTH_URL` matching its temporary server.

## Screenshots

- `desktop-dashboard.png` (1440)
- `desktop-schedules.png` (1440)
- `desktop-schedule-dialog.png` (1440)
- `desktop-patients.png` (1440)
- `desktop-equipment.png` (1440)
- `desktop-audit.png` (1440)
- `desktop-landing.png` (1440)
- `laptop-schedules.png` (1024)
- `tablet-schedules.png` (768)
- `mobile-dashboard.png` (390)
- `mobile-schedules.png` (390)
- `mobile-login.png` (390)
