# MedOrch Design System — Phase Report

Status: **foundation + exploration complete. No direction selected. Production
landing page unchanged.**
Date: 3 November 2026 · Stack: Next.js 16.3.6 (App Router, Turbopack), React 19,
TypeScript, Tailwind CSS v4 · Dependencies added: **none**

Companion documents:

- `COMPONENT_CATALOG.md` — every component, variant, prop and state.
- `COMPONENT_USAGE_MAP.md` — where each is used and which variant to prefer.
- `LANDING_DIRECTIONS.md` — the three compositions and their trade-offs.
- `screenshots/` — 16 captures; `evidence/` — raw verification output.

---

## 1. Audit findings

| Area | Finding | Action |
| --- | --- | --- |
| `src/components/ui/` | 9 primitives (`Button`, `Card`, `Badge`, `MetricStrip`, `PageHeader`, `Ledger`, `EmptyState`, `ErrorState`, `LoadingState`), all product-facing, no marketing variants | **Reused** `Button`; extended it. Left product primitives untouched |
| Tokens | Rich semantic layer in `globals.css` (`--paper`, `--sheet`, `--ink*`, `--rule*`, `--pine`, `--brass`, semantic status colours) plus a dark `[data-theme]` scope | **Extended additively**; nothing renamed or removed |
| Typography | Sizes existed as utilities; no display/eyebrow/caption components | Added `Type.tsx` |
| Layout primitives | Ad-hoc `max-w-*` + `px-*` per page | Added `--ds-max`, `--ds-gutter`, `--ds-section-y`, `--ds-measure`, `.ds-shell` |
| Navigation | Only product chrome; two legacy landing files (`LandingHero.tsx`, `LandingMobileNav.tsx`) no longer imported | Built `SiteNav`; legacy files left in place |
| Inputs | None | Built `Input.tsx` (7 controls) |
| Data display | `MetricStrip`, `Badge` are product-shaped | Added `StatusPill` + `Indicators` for landing/read-only presentation |
| `docs/design-system/medorch/MASTER.md` | Documents an earlier landing-only token set; **stale** against `globals.css` | Not edited in this phase; flagged in §7 |
| Production landing `/` | A bespoke "surgical atlas" page, self-contained | **Untouched**, verified still serving |

Dependency audit: no animation library, no component library, no CSS-in-JS.
The system therefore uses Tailwind utilities + the existing CSS variable layer,
with CSS transitions only.

---

## 2. Token foundation

Appended as one clearly-marked block in `src/app/globals.css`
(`DESIGN SYSTEM v2 — tokens for the landing playground`, ~270 lines). Purely
additive: no existing token was renamed or given a new value.

- **Layout rhythm** — `--ds-max: 84rem`, `--ds-gutter` (1.25 → 2 → 3rem),
  `--ds-section-y` (4 → 5.5 → 7rem), `--ds-measure: 62ch`.
- **Radius** — existing `--radius-sm/md/lg/xl` plus `--radius-pill`.
- **Motion** — `--dur-fast: 120ms`, `--dur-base: 200ms`, `--dur-slow: 320ms`,
  `--ease-standard`, `--ease-emphasis`.
- **Interaction** — `--focus-width: 2px`, `--focus-offset: 2px`,
  `--hover-overlay: 0.055`, `--disabled-opacity: 0.5` (matches the value the
  product buttons already used, so no dashboard changes appearance).
- **Elevation** — existing `xs`–`lg` plus `--shadow-xl`.
- **Inverse surfaces** — `--plate-ink`, `--plate-ink-soft`, `--plate-line`,
  applied by `.inverse-surface` so a dark plate re-points ink, rules and pills
  without a parallel set of components.
- **Palette scopes** — `[data-palette='enterprise']` (porcelain `#f7f4ef`,
  pine `#23291f`, brass `#8a5a2b`) and `[data-palette='intelligence']`
  (graphite `#0b1418`, mint `#7fe3c8`). Each scope redefines the same semantic
  names, so **every component restyles with no variant**.
- **Utilities** — `.ds-shell`, `.ds-enter`, `.ds-rule`, `.ds-grid-paper`.

Colour is deliberately not healthcare-blue: Direction A uses the existing
clinical navy + teal, B is warm porcelain with brass, C is graphite with mint.

---

## 3. Components

Twelve primitives in `src/components/ui/`, seven section components plus a
product-preview pair in `src/components/landing/system/`. Full API in
`COMPONENT_CATALOG.md`.

Reuse decisions worth recording:

- **Extended `Button`** with `icon` / `text` variants, `xs`–`lg` sizes, `shape`
  (`control`/`pill`) and `loadingLabel`, rather than adding a marketing button.
  It exports `buttonClasses()` so a link can wear button styling — a `<button>`
  nested inside `<Link>` is invalid HTML, produces two tab stops and left the
  link without an accessible name (caught by the interaction test and fixed).
- **One `Surface`** with six materials and four tones replaced what would have
  been six card components.
- **`Field` clones its control** instead of taking a render function: these are
  server components, and functions cannot cross the server/client boundary.
- **`SiteNav` is the only client component** in the primitive set. Dropdowns are
  disclosure buttons (`aria-expanded` + `aria-controls`), never hover menus.
- **No speculative components.** `ChartFrame` exists but no landing section
  uses a chart, because no real series exists to plot.

---

## 4. Playground — `/design-system`

A browser-rendered page, not a static document. Eight sections, each specimen
labelled with its variant and props:

1. **Tokens & palettes** — the same three semantic plates side by side
   (clinical, enterprise, intelligence) so a palette change is visible, not
   described.
2. **Buttons** — 7 variants × 4 sizes, pill shapes, loading, disabled,
   icon and text buttons, plus a link-as-button specimen.
3. **Navigation** — all four treatments rendered against their intended
   ground, plus the mobile disclosure instructions.
4. **Typography** — display sizes, section heading rhythm, body tones,
   eyebrows, captions, highlight, labels.
5. **Surfaces & cards** — six materials × four tones, including the inverse
   plate.
6. **Data presentation** — status pills, metric indicators, progress bars,
   timeline, chart frame, availability and operational status.
7. **Inputs & controls** — text, search, select, textarea, toggle, checkbox,
   default and error fields, disabled states.
8. **Landing directions** — each direction's hero in a palette-scoped frame
   with a link to its full route.

The page is entirely static markup plus the one client nav; it reads no
session, no database and no API, so it is isolated from production behaviour.

## 5. Directions

`/design-system/direction-a` (Clinical Technology),
`/design-system/direction-b` (Premium Enterprise),
`/design-system/direction-c` (Operational Intelligence).

Each is a complete page: nav, hero, theatre scheduling and room availability,
clinical team and equipment coordination, product showcase, features, workflow,
metrics, final CTA, footer. They differ in palette scope, section order and
section variants — see `LANDING_DIRECTIONS.md` and `DIRECTION_COMPARISON.md`.
The theatre and coordination sections are direction-local compositions over the
shared primitives, so no shared component changed for them. All copy comes from one
`content.ts`; no customer, testimonial, certification, clinical statistic or
outcome claim appears anywhere. Every product frame is labelled **Preview**.

**Superseded.** The three directions were rejected for sharing one conventional
composition — masthead, oversized hero, product card, stacked sections. Three
interaction concepts now replace them as the subject of review:
`/design-system/concept-control` (theatre control room),
`/design-system/concept-journey` (surgical case journey) and
`/design-system/concept-suite` (interactive suite plan). Their interaction models,
strengths, weaknesses, tradeoffs and evidence are in `CREATIVE_UX_REVIEW.md`, with
screenshots in `screenshots/creative/`. No winner has been chosen; the production
landing page and shared tokens are untouched.

## 6. Verification

All checks run on 3 November 2026. Raw output in `evidence/`.

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | **exit 0**, no diagnostics |
| Lint | `npm run lint` | **exit 0**, 0 errors, 20 warnings — all in four untouched pre-existing files (`EquipmentManagement`, `DepartmentManagement`, `MyAppointments`, `DoctorDirectory`); none in new files |
| Production build | `npm run build` | **exit 0**, compiled successfully; `/design-system` and the three direction routes prerendered **static (○)** |
| Route/render matrix | Playwright, 4 routes × 3 viewports | **12/12**: HTTP 200, horizontal overflow 0px, console errors 0, failed requests 0 |
| Interactions | Playwright, 10 scenarios | **10/10 PASS** |

Matrix viewports: 1440×900, 1024×768, 390×844.

Interaction scenarios (`evidence/interactions.json`):

1. Desktop nav dropdown opens (`aria-expanded=true`) and Escape closes it.
2. Search input accepts text and clears.
3. Toggle flips `aria-checked` true → false.
4. Mobile nav opens, Escape closes all panels and returns focus to
   `Open navigation`.
5. Header anchor scrolls to `#data` (`scrollY=1623`).
6. Loading/disabled states present (`aria-busy=2`, `disabled=6`).
7. Direction A hero CTA resolves to `/login`.
8. Direction B nav CTA resolves to `/register`.
9. Direction C dropdown opens.
10. Production landing `/` still returns 200 with its original `<h1>`
    containing "single field".

### Screenshots (`screenshots/`)

| File | Content |
| --- | --- |
| `01-playground-1440.png` | Full playground, 1440 |
| `02-playground-1024.png` | Full playground, 1024 |
| `03-playground-390.png` | Full playground, 390 |
| `04-buttons-1440.png` | Every button variant, size and state |
| `05-navigation-1440.png` | Four nav treatments + mobile contract |
| `06-typography-1440.png` | Type specimens |
| `07-surfaces-1440.png` | Surface materials and tones |
| `08-data-presentation-1440.png` | Pills, metrics, bars, timeline, statuses |
| `09-inputs-1440.png` | All controls incl. error state |
| `10/11/12-direction-{a,b,c}-1440.png` | Directions at 1440 (first pass, before the operational sections) |
| `13/14/15-direction-{a,b,c}-390.png` | Directions at 390 (first pass) |
| `16-mobile-nav-open-390.png` | Mobile navigation panel open |
| `direction-{a,b,c}-1440.png` | Current full-page directions at 1440, including theatre and coordination sections |
| `direction-{a,b,c}-1024.png` | Current full-page directions at 1024 |
| `direction-{a,b,c}-390.png` | Current full-page directions at 390 |

Direction evidence: `evidence/directions-matrix.json` (9 route/viewport rows)
and `evidence/directions-interactions.json` (12/12 navigation, anchor and CTA
checks). Trade-offs between the three are in `DIRECTION_COMPARISON.md`.

---

## 7. Files created or changed

### Changed (2)

| File | Change |
| --- | --- |
| `src/app/globals.css` | +~270 lines: `DESIGN SYSTEM v2` token block, two palette scopes, `.ds-*` utilities, `.inverse-surface` (additive only) |
| `src/components/ui/Button.tsx` | Added `icon` / `text` variants, `xs`–`lg` sizes, `shape`, `loadingLabel`; new exported `buttonClasses()` |

`Button`'s existing variants, sizes and call sites are unchanged — the product
dashboards render exactly as before.

### Created — primitives (`src/components/ui/`)

`Type.tsx`, `Surface.tsx`, `StatusPill.tsx`, `Indicators.tsx`, `Input.tsx`,
`SiteNav.tsx`.

### Created — landing system (`src/components/landing/system/`)

`content.ts`, `preview.tsx`, `hero.tsx`, `features.tsx`, `showcase.tsx`,
`stats.tsx`, `workflow.tsx`, `cta.tsx`, `footer.tsx`,
`directions/direction-a.tsx`, `directions/direction-b.tsx`,
`directions/direction-c.tsx`.

### Created — routes (`src/app/design-system/`)

`page.tsx`; `_components/{specimen,tokens,buttons,navigation,surfaces,data,inputs}.tsx`;
`direction-a/page.tsx`, `direction-b/page.tsx`, `direction-c/page.tsx`.

### Created — documentation

`docs/design-system/{DESIGN_SYSTEM_REPORT,COMPONENT_CATALOG,LANDING_DIRECTIONS,COMPONENT_USAGE_MAP}.md`,
`docs/design-system/screenshots/*.png` (16),
`docs/design-system/evidence/{matrix,interactions}.json` and
`{typecheck,lint,build}.txt`.

### Explicitly untouched

`src/app/page.tsx` (production landing), `src/app/layout.tsx`, all auth routes
and server actions, every `/api` route, `prisma/schema.prisma`, all dashboard
and management modules, `src/components/landing/LandingHero.tsx` and
`LandingMobileNav.tsx` (legacy, unreferenced). No dependency was installed and
no file was deleted or renamed. Nothing is committed; the working tree is left
for review.

## 8. Limitations

- **Chromium only.** Playwright ran against the packaged Chromium. Firefox and
  WebKit were not exercised, so `backdrop-filter`, `text-balance` and focus-ring
  parity there are unverified.
- **Dev-mode screenshots.** Captures come from `next dev`; the Next.js dev
  badge appears in a few images. Layout is identical in the production build,
  which was verified separately, but the images are not from it.
- **No automated a11y audit.** No axe/Lighthouse run is available in this
  environment. Focus order, `aria-expanded`, `aria-busy`, `aria-invalid`,
  `aria-describedby`, `role="progressbar"`/`switch` and Escape-returns-focus
  were verified by the interaction script and by inspection, not by a scanner.
- **Contrast checked by token design, not measured.** Every fill/ink pair was
  chosen against 4.5:1 (and 3:1 for control boundaries) and the mint palette's
  primary was fixed to dark ink after review, but no automated contrast pass
  was run.
- **Interaction script is not committed.** Playwright is not a project
  dependency; the test scripts were run from a cached install and removed to
  avoid adding tooling or files to the repo. The JSON results are kept as
  evidence. Re-running them requires installing Playwright.
- **Prototype routes are indexable.** `/design-system*` has no `robots`
  exclusion. Add `noindex` (or keep the routes behind a flag) before this ever
  reaches production.
- **`docs/design-system/medorch/MASTER.md` is stale** — it documents an earlier
  landing-only token set. Left unedited because this phase does not own it;
  it should be retired or rewritten when a direction ships.
- **Legacy landing components remain** (`LandingHero.tsx`,
  `LandingMobileNav.tsx`). Unused, not deleted, to keep this phase's diff
  limited to its own surface.
- **No real brand typeface.** The prototypes use the project's existing fonts;
  Direction B's display scale is designed to be re-tuned once a licensed face
  is chosen.
- **Content is product-factual, not validated marketing copy.** Numbers are
  module/state/role counts from the product, and all records are sample data.

## 9. Next step

Nothing is selected. To proceed, pick one direction on the evidence in
`LANDING_DIRECTIONS.md`; the production work is then a composition change in
`src/app/page.tsx` calling the same sections with the chosen variants, plus
metadata and a real brand face — no new components required.
