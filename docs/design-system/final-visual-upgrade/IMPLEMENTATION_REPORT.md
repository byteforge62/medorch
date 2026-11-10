# Implementation Report — Final Visual Upgrade

## Scope

This pass reworks the existing MedOrch visual system into an editorial clinical register. It does not change the Prisma schema, API contracts, authentication, authorization, business logic, public URLs or seeded records. No dependency was added.

All work is uncommitted in the working tree.

## 1. Typography

`src/app/layout.tsx` replaces Sora / Inter / JetBrains Mono with:

- **Newsreader** — `--font-newsreader`, display serif for `h1`, `h2`, `.display`, `.section-title`.
- **Public Sans** — `--font-public`, interface and body.
- **IBM Plex Mono** — `--font-plex`, codes, serials, timestamps and plate marks.

`src/app/globals.css` maps the three CSS variables into Tailwind’s theme (`--font-display`, `--font-sans`, `--font-mono`). `h3`/`h4` remain sans to keep dense interface hierarchy readable. The `.eyebrow` style is now sentence case at 12px; tracked uppercase is reserved for mono machine marks.

## 2. Palette and material

The semantic token names are unchanged, so every screen inherits the new identity without route-by-route colour code. Values were replaced:

| Token group | New value |
|---|---|
| paper / paper-deep / sheet | `#f1efe8` / `#e7e3d8` / `#fbf9f3` |
| ink / secondary / muted | `#202b26` / `#5c6962` / `#727d76` |
| rule / rule-strong | `#d7d3c7` / `#b9b3a4` |
| pine / pine-deep / pine-bright | `#24594a` / `#183f35` / `#34725f` |
| brass (rust accent) | `#a45d3f` |
| rail / rail-elevated / rail-line | `#18261f` / `#22342b` / `#3b4d43` |
| danger / warning / success | `#a9483c` / `#9c671d` / `#2d7355` |

Geometry: control and panel radius dropped from 8–10px to **2px**; shadows are near-flat. `.panel` is translucent paper, `.panel-hover` darkens the edge instead of lifting. `--pill` remains only for genuine toggles.

Added `--color-plate-ink`, `--color-plate-ink-soft` and `--color-plate-line` theme aliases; these were previously referenced by class names without a Tailwind colour definition, which made inverse-band labels invisible.

## 3. Ambient and frosted image treatments

`src/components/visual/ClinicalPlate.tsx` gains **`AmbientField`**: a decorative, `aria-hidden` photograph blurred at 54px, desaturated and washed with pine, ink or rust. It is used as an atmospheric field, never as information.

`ClinicalBackdrop` gains an `imageClassName` prop so a sharp backdrop can be desaturated and contrasted without changing its caption/scrim contract.

CSS adds `.ambient-photo`, `.ambient-scrim`, `.frost-strip` and `.editorial-split`. Backdrop blur is real (`backdrop-filter`), not a flat translucent colour.

## 4. Status language

`src/components/ui/Badge.tsx` no longer renders rounded pills. Every status, role and severity mark is a square printed stamp: a two-pixel coloured left rule, machine-face uppercase type and no filled capsule. The word remains the primary signal, so state still survives greyscale and colour blindness.

The same treatment replaced custom patient, clinician, appointment and alert-filter capsules. Filters that were circular chips are now segmented ruled controls.

## 5. Shell and shared header

- `Sidebar` is now a deep-green rail with ivory type, a rust active edge, square active tab and a numbered active index. The former white SaaS panel is gone.
- `Header` uses paper rather than white, a square identity mark and mono role text instead of a rounded pill.
- `PageHeader` is a printed masthead: rust index, large Newsreader subject, orientation column, double rule, baseline actions. The dot and pill were removed.

## 6. Module changes

### Dashboard
- Header carries a full-bleed `AmbientField` wash behind the masthead.
- The theatre window is taller (300px desktop), softly blurred (1.5px), desaturated and green-toned with a mix-blend colour wash, scrimmed, and topped by a frosted plate strip. It reads as a treated environmental plate rather than a stock photograph.
- Metrics are an open four-part register. Figures use the display serif.

### Doctor and patient dashboards
The doctor screen is now an open day plan: a ruled four-figure header register, a focus sheet edged by double rules, stamps for priority and status, and a ruled run sheet. The patient screen uses the same printed sheet logic without operational metrics; the empty state is a ruled statement, not a floating card.

### OT staff dashboard
The theatre-plant photograph is removed. In its place: an inverse shift band with a blueprint grid, the scope statement and a large serif theatre count. The theatre board is a single open register with status stamps and vertical rules, not a row of mini cards.

### Equipment
- The large plant photograph is replaced by an inverse readiness board: serif counts, borders and a composition bar.
- The `<table>` is replaced by `EquipmentRegister.tsx`: a ruled `<ul>` of open entries with drawn SVG category glyphs, serif names, readiness and an underlined status control.
- All row thumbnails and `next/image` usage were removed from the register.

### Theatres
- The room cards are now a two-column register of ruled entries, with a one-pixel day bar and a rust active mark.
- The sidebar photograph is replaced by `TheatreSchematic.tsx`, a drawn plan with table, pendant, anaesthesia stack, trolley and scrub door. It is explicitly labelled schematic.

### Schedules
The 224px floating theatre plate and its import were removed. The title block is enlarged and ruled.

### Doctors
The workforce photograph is removed. A printed no-portrait statement between double rules replaces it. Headcount figures use the display serif.

### Patients
The corridor privacy plate is removed and replaced with a text-first privacy statement. The registry remains dense and typed.

### Departments
The specialty photograph is removed. The division detail opens with a glyph frontispiece and record head; the old duplicate division name/label was removed.

### Alerts
The monitor photograph is removed. Severity is a full-width printed board with rail colours and large figures. The all/unread filter is a square segmented control, and each alert row carries a left severity rule.

### Audit
Existing ledger structure retained; it inherits the new paper, rule and serif tokens.

### Landing and authentication
- Landing hard-coded blue values were remapped to the warm/green palette across `clinical-landing.tsx`, `clinical-header.tsx`, `module-index.tsx`, `access-panel.tsx`, `theatre-preview.tsx` and `clinical-data.ts`.
- The landing evidence photograph was replaced with the drawn room schematic; the engineering monitor plate was removed.
- The preview theatre image is softened (`blur 1.5px`, `saturate 0.5`).
- The sign-in treatment-bay photograph is blurred 3px and desaturated behind the ink wash; the Pexels/plate footer was replaced with a plain boundary caption.
- Rounded surfaces in landing/auth were squared to 2px.

## 7. Data and behaviour

No Prisma model, API route, repository, permission, auth configuration, form action or seed record was changed. Running the project's own `npm run dev` invoked its configured `predev` seed; the seed is idempotent and left the extra registered users and patients in place (14 users, 12 patients after seeding). The equipment register and theatre register are presentational restructures over the same props and handlers. The selected theatre still uses the same state and schedule lookups.

## 8. Verification summary

See `FUNCTIONAL_TEST_REPORT.md` and `evidence/`.
