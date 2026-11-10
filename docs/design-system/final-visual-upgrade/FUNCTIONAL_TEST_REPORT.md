# Functional Test Report

## Environment

| Item | Value |
|---|---|
| Application | MedOrch, Next.js 16.3.6 (Turbopack dev) |
| Local origin | `http://localhost:5274` |
| Database | PostgreSQL 17 in Docker (`medorch-postgres`), healthy |
| Browser | Installed Google Chrome, headless, driven over the DevTools Protocol |
| Harness | `scripts/visual-upgrade-verify.mjs` (no new dependency) |
| Date | 8 November 2026 |

The harness authenticates against the real credentials callback, writes only a session cookie, and loads the app as each seeded role. It does not submit domain forms or mutate domain data.

## Accounts exercised

| Role | Account |
|---|---|
| ADMIN | `admin@medorch.local` |
| DOCTOR | `ananya.shah@demo.medorch.local` |
| OT_STAFF | `kavya.nurse@demo.medorch.local` |
| PATIENT | `aarav.mehta@demo.medorch.local` |

Each sign-in returned the expected role from `/api/auth/session` before screenshots were taken.

## Viewports and captures

- **1440 × 900**, **1024 × 768**, **390 × 844**, device scale factor 1.
- **54 screenshots**, all verified as the exact requested pixel dimensions with Sharp. Viewport captures, not stitched full-page images.
- Routes:
  - Public: `/`, `/login`
  - Admin: `/dashboard`, `/schedules`, `/departments`, `/patients`, `/doctors`, `/equipment`, `/ot-rooms`, `/alerts`, `/audit`
  - Doctor: `/dashboard`, `/schedules`, `/doctors`
  - OT staff: `/dashboard`, `/ot-rooms`
  - Patient: `/dashboard`, `/patients/appointments`

Location: `screenshots/<role>-<route>-<width>.png`.

Reproduce:

```bash
APP_BASE_URL=http://localhost:5274 node scripts/visual-upgrade-verify.mjs
```

## Automated results

Source: `evidence/browser-audit.json`.

| Check | Result |
|---|---|
| Pages / viewports audited | 54 |
| Broken images | **0** |
| Pages with horizontal overflow | **0** |
| Images missing `alt` | **0** |
| Pages with console errors | **0** |
| Pages with a rendered `h1` | 54 / 54 |

Image counts now reflect the deliberate reduction: landing 1, login 2 (one image plus its blurred atmospheric copy is counted twice by the audit), admin dashboard 2 (sharp window + ambient field), and **0 on every other authenticated module**.

## Visual review performed

Screenshots reviewed at 1440 for dashboard, equipment, theatres, doctors, patients, departments, alerts, landing and login, plus the mobile dashboard and alerts.

Confirmed in the captures:

- Newsreader is applied to page titles and record names; Public Sans carries interface copy; mono is confined to codes and plate marks.
- The sidebar is deep green with ivory type and a rust active edge.
- The admin masthead uses the ambient wash and a treated theatre window; metrics read as a printed register.
- Equipment is an open register with drawn glyphs, not a table with thumbnails.
- Theatres is a ruled two-column room register with a drawn schematic in the detail panel.
- The OT staff theatre board is one ruled register, not a row of mini cards; the shift band is drawn, not photographed.
- The doctor day plan uses an open metrics register, a double-ruled focus sheet and stamps instead of pills.
- Patient and clinician status capsules are printed stamps; circular monograms were squared.
- The admin theatre plate is blurred 1.5px and green-toned, with a frosted live strip.
- Doctors and patients show typographic rule statements where photographs used to sit.
- Mobile dashboard metrics stack into a two-by-two register without clipping.

## Controls, navigation and permissions

- All listed routes loaded under their permitted roles and rendered their expected `h1`.
- Route structure, links, query/search controls and role gates were not changed.
- `npm run test:permissions`: **5/5 pass** (`evidence/permissions-tests.log`) from the earlier verification run; permission code was not touched by the follow-up visual edits.
- The screenshot harness was rerun after every source change; final run `2026-11-08T17:24:00Z`.
- Core mutations and form workflows were not re-submitted during this visual pass to avoid changing domain records. Presentational JSX around them was changed; handlers and API contracts were not.
- The equipment status `select` and theatre selection still call the same handlers; only their visual shells changed.

## Accessibility and reduced motion

- `npm run test:accessibility`: **5/5 pass** (`evidence/accessibility-tests.log`).
- Decorative backdrops and ambient layers use `alt=""` and `aria-hidden`.
- Status and severity are printed as words, not colour alone.
- With Chrome forced to `prefers-reduced-motion: reduce`, the media query matched and the global motion override applied. No `.photo-reveal` plate is rendered after the photo reduction, so the check records `plateCount: 0`; the page-enter and reveal rules remain covered by the same global override. See `evidence/reduced-motion.json`.
- Focus styles and control semantics were preserved.

## Static checks

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | pass, no output |
| Changed-file ESLint | `npx eslint <changed visual files>` | pass, no errors |
| Production build | `npm run build` | pass, 49/49 static pages |

## Data integrity

Domain record counts remain unchanged from the previous baseline:

| Record | Count |
|---|---:|
| Users | 14 |
| Departments | 4 |
| Doctors | 5 |
| Patients | 12 |
| Theatres | 7 |
| Equipment | 10 |
| Schedules | 10 |
| Alerts | 4 |

Audit-log count rises only from verification logins (`LOGIN` events); no permission or domain mutation was triggered. No record was created, updated or deleted by this pass.

## Limitations

- Screenshots are viewport captures; content below the fold is not shown.
- Only the development server was exercised for the browser sweep. A production build was generated and typechecked, but the production server was not re-run for a second screenshot pass.
- Visual review is screenshot-based, not an exhaustive click-through of every dialog and form validation path.
- The first sign-in immediately after a Next.js dev recompile can fail transiently with a Prisma transaction timeout (`Unable to start a transaction in the given time`). The harness now retries sign-in up to three times with backoff. The final sweep authenticated all four roles and completed with zero console errors. This is a development-server/database warm-up event; no application source was changed to mask it.
- The dev overlay’s floating “N” badge appears in local screenshots; it is a Next.js development indicator, not product UI, and is absent from production builds.
