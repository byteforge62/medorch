# Stage 3C — Implementation Report

**Date:** 6 November 2026  
**Baseline commit:** `2fac5ac`  
**Deliverable:** one light clinical theme and one persistent authenticated shell for ADMIN, DOCTOR, OT_STAFF and PATIENT.

## 1. Outcome

Stage 3C is complete in the working tree.

- Schedules, Equipment and Theatres — the three dark outliers — now render on the approved light clinical surface for every permitted role.
- Every other authenticated route uses the same palette and the same shell.
- The shell is mounted once by `src/app/(workspace)/layout.tsx`; it survives section navigation.
- Route URLs, server authorization and page-level role checks are unchanged.
- The public landing, auth, registration, password and unauthorized boundaries were left outside the workspace group.
- No Prisma schema, API route, dependency, seed, auth rule or email flow was changed.

## 2. Palette implementation

The root semantic layer in `src/app/globals.css` now uses the approved clinical palette exactly:

| Role | Token(s) | Value |
| --- | --- | --- |
| Canvas | `--paper` | `#F5F8FB` |
| Working surface | `--sheet`, `--chalk` | `#FFFFFF` |
| Recessed surface | `--paper-deep`, `--surface-subtle`, `--rule-soft` | `#EDF3F8` |
| Primary action | `--pine` | `#245B8F` |
| Working accent / active signal | `--brass`, `--info` | `#168C91` |
| Ink | `--ink` | `#243447` |
| Secondary / muted text | `--ink-secondary`, `--ink-muted` | `#718096` |
| Hairline / strong border | `--rule`, `--rule-strong` | `#E3EAF0` / derived `#CBD8E4` |
| Success | `--success` | `#24845D` |
| Warning | `--warning` | `#B7791F` |
| Danger | `--danger` | `#C74646` |

Derived tints are colour mixes of those values:

- `--success-soft` `#E6F3EE`
- `--warning-soft` `#FBF1E0`
- `--danger-soft` `#FBEAEA`
- `--brass-soft` `#E2F2F3`
- `--pine-soft` `#E7EFF7`

The root declares `color-scheme: light`. The body ground is `--paper`; panels use `--sheet` with `--rule` hairlines and the existing cool shadow.

### Navigation colour

The authenticated rail previously read the dark `--rail` tokens. It now uses:

```
bg-sheet text-ink border-rule
```

That is a white clinical rail with ink labels and a light blue-grey active fill. `--rail` remains `#243447` and is still used by the public landing and sign-in frontispiece, which are intentionally inverted plates. It is not used by the authenticated sidebar.

### Dark plates outside the workspace

`--surface-inverse`, `--rail`, `--rail-elevated`, `--rail-line`, `--rail-muted` and the `[data-palette='intelligence']` design-reference palette remain in the stylesheet. They serve the landing playground, auth frontispiece and design-system galleries. No authenticated page selects a dark palette or applies a dark workspace scope.

## 3. Route and theme model

`src/lib/design/workspace.ts` was deleted. It returned:

- `operations` for all `/schedules`, `/equipment` and `/ot-rooms` routes;
- `operations` for `/dashboard` for ADMIN and OT_STAFF;
- `clinical` for the remaining authenticated routes.

`AppShell` no longer accepts a `workspace` prop and no longer calls `workspaceForRoute`. It declares one environment:

```tsx
<div data-workspace="clinical" data-app-shell="clinical" …>
```

The graphite token override block, including the `color-scheme: dark` scope, was removed. This fixes the cause rather than patching individual pages: tables, selects, calendar cells, dialogs, form fields, loading panels and error panels all inherit the same semantic tokens.

## 4. Shell implementation

### Server boundary

`src/app/(workspace)/layout.tsx`:

- awaits `requireAuth()`;
- renders the single `AppShell`;
- leaves each page's `requireRole` / `requirePermission` guard intact.

### Persistent frame

`src/components/layout/AppShell.tsx`:

- owns only drawer state and pathname;
- sets `data-workspace="clinical"`, `data-app-shell="clinical"`, `data-app-header` and `data-page-content`;
- keys only the page content by pathname for the page-enter transition.

### Sidebar

`src/components/layout/Sidebar.tsx`:

- uses `next/link` for every destination;
- keeps one role-filtered navigation list;
- keeps prefix-aware active state, including detail routes;
- keeps the desktop hover/focus expansion and mobile drawer;
- switches the desktop rail to `bg-sheet`, ink labels and clinical active state;
- exposes `data-app-sidebar`.

### Header

`src/components/layout/Header.tsx`:

- keeps the existing command bar, alert link and session avatar;
- exposes `data-app-header`;
- keeps its mobile menu trigger and `aria-controls` relationship.

## 5. Route moves

All authenticated routes moved from their former root-level locations into `src/app/(workspace)/` with no URL change. Their client content components moved with them:

- dashboard;
- schedules list and schedule detail;
- equipment;
- OT rooms / theatres;
- departments;
- doctors list and doctor detail;
- patients list and patient detail;
- patient appointments list and appointment detail;
- alerts;
- users;
- audit;
- admin.

The only import repair needed outside the group was `src/app/preview/[module]/PreviewClient.tsx`, which imports the moved registry and management components. The preview harness still mounts its own `AppShell` because it is an internal visual surface, not an authenticated route.

The former `src/app/(dashboard)/` group was removed once its routes moved, so there is no duplicate route tree.

## 6. State surfaces

The theme repair was made at the token layer, so the following surfaces were not restyled individually:

- tables and table headers;
- filter bars, search fields and selects;
- calendar board, list view and schedule cards;
- schedule create/edit dialog and status dialog;
- equipment add/edit form and status selects;
- theatre cards and detail rail;
- alerts severity panels;
- empty, loading and error states;
- buttons, badges, chips and tooltips that use semantic tokens.

Two dialog states were explicitly opened and measured in the browser:

- **Create schedule dialog:** panel `rgb(255, 255, 255)`, select `rgb(255, 255, 255)`, text `rgb(36, 52, 71)`.
- **Add equipment form:** input `rgb(255, 255, 255)`, input text `rgb(36, 52, 71)`, panel `rgb(255, 255, 255)`.

The modal scrim remains `bg-foreground/40` (ink at 40% opacity). That is a backdrop, not a content surface, and is intentionally dark so the white dialog separates from the page.

## 7. Boundaries preserved

- **Landing page:** unchanged. It remains outside `(workspace)` and keeps its own inverted/editorial surfaces.
- **Auth pages:** unchanged except for text-contrast repairs on dark plates caused by the light-rail token change.
- **Unauthorized page:** outside the workspace group; unchanged.
- **Design-system galleries and preview harness:** internal, unchanged in intent; preview imports were repaired.
- **APIs:** no route, handler, query, permission check or response shape changed.
- **Database:** no migration, seed, reset or destructive command.
- **Dependencies:** no package was added, removed or upgraded.

## 8. Shared component details

- `AuthShell` and `Wordmark` dark-plate text now uses explicit white-opacity values instead of `text-rail-muted`, because the rail token became light for the authenticated sidebar. This is a contrast repair, not a redesign.
- `src/app/error.tsx` now imports `next/link` and uses it for "Return to dashboard". Styling was reordered by the formatter; no visual redesign.
- The schedule detail "Refresh" button keeps `window.location.reload()` intentionally. Sidebar navigation never uses it.
- Pre-existing dead locals in `DoctorDirectory` and `MyAppointments` were removed because they produced lint warnings after the move. No product behaviour changed.

## 9. Verification summary

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript (`npx tsc --noEmit`) | pass | `evidence/typecheck.log` |
| ESLint on changed files (`--max-warnings=0`) | pass | `evidence/lint-changed.log` |
| Production build (`npm run build`) | pass | `evidence/build.log` |
| Route-level browser checks | 96 / 96 | `evidence/browser-role-checks.json` |
| Detail-route theme checks | 7 / 7 | `evidence/browser-detail-checks.json` |
| Clean navigation smoke | 12 / 12, zero console errors | `evidence/browser-navigation-smoke.json` |
| Screenshot set | 29 files (28 unique captures at 1440 / 1024 / 390 + one naming alias) | `screenshots/after/` |

The full role pass covered 28 accessible route instances across all four roles, plus seven dynamic detail routes. See `FUNCTIONAL_TEST_REPORT.md` for the matrix and limitations.

## 10. Not changed

- Business logic in schedules, equipment, theatres, patients, doctors, departments, alerts, users or audit.
- API contracts, Prisma schema, seed data, Docker configuration or authentication rules.
- Loading labels, empty-state copy or status vocabulary.
- Public landing content or layout.
- Responsive module layouts, card proportions or information hierarchy.

The intent is a theme and shell change, not a module redesign. Schedules, Equipment and Theatres retain their existing board/table/card structures and status colours.
