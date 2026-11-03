# MedOrch Design System — Master

> **LOGIC:** Before building a page, check `design-system/pages/[page-name].md`.
> A page file overrides this Master. Otherwise follow this file exactly.
>
> This document describes **what the code actually ships**. If it disagrees
> with `src/app/globals.css` or the components, the code is right — fix this
> file.

---

**Project:** MedOrch
**Revised:** 2026-11-01
**Identity:** “Anatomical Press”
**Category:** Operating-theatre orchestration (clinical operations)

**Dials:** Variance 8/10 (editorial, plate-driven) · Motion 4/10 (restrained,
meaningful) · Density 7/10 (dense but airy — instrument, not spreadsheet)

---

## 1. Creative direction

MedOrch is drawn like a **printed surgical atlas**, not a SaaS dashboard. The
product is a technical publication: numbered plates, hairlines, coordinates,
mono captions and architectural drawings. Four relationships carry the identity:

1. **Porcelain paper** (`#F2EDE4`) is the canvas, with a barely-visible printed
   grain. Working surfaces are sheets laid on it (`#FAF7F1`), never floating
   cards.
2. **Ink** (`#14120F`) is structure: type, rails, rules. The navigation is a
   dark instrument spine, and the sign-in frontispiece uses the same material.
3. **Surgical pine** (`#123A31`) is the only working colour — actions, active
   states, emphasised serif words.
4. **Vermilion** (`#B8402A`) is a **signal, not decoration**: one mark per
   screen (a plate number, a live indicator, a cancelled case). Brass
   (`#D8B98A`) appears only on ink.

Consequences, therefore rules:

- **Zero radius.** Panels are `0`, controls `2px`. Separation is a hairline
  (`--rule`), never a shadow or lift.
- **No decorative effects.** No gradients, glassmorphism, blobs, glows, emoji
  icons, stock photography or fake charts. Every mark reports state.
- **Composition over template.** Screens share tokens, the masthead and the
  ledger vocabulary — never a layout. A metric band, a ruled ledger and an
  architectural plate are three different objects.
- **Numbers are set in mono or display serif**, never generic bold sans.

---

## 2. Colour

All pairs measured against WCAG 2.1 AA (text ≥ 4.5:1, boundaries ≥ 3:1).

| Role | Hex | CSS variable | Usage |
|---|---|---|---|
| Canvas | `#F2EDE4` | `--paper` / `bg-paper` | Page ground |
| Recessed | `#E8E1D3` | `--paper-deep` | Wells, footers, pressed states |
| Sheet | `#FAF7F1` | `--sheet` / `bg-sheet` | Panels, tables, inputs |
| Ink | `#14120F` | `--ink` | Primary type, rails |
| Ink 2 | `#3A352E` | `--ink-secondary` | Body copy (9.4:1) |
| Ink 3 | `#6B6459` | `--ink-muted` | Meta, captions (4.9:1) |
| Rule | `#CFC7B8` | `--rule` | All hairlines |
| Pine | `#123A31` | `--pine` | Primary action, active |
| Pine deep | `#0B2A23` | `--pine-deep` | Hover |
| Vermilion | `#B8402A` | `--vermilion` | Signal only |
| Brass | `#D8B98A` | `--brass` | Ink surfaces only |
| Success | `#2F6B4F` | `--success` | Completed / available |
| Warning | `#A9681B` | `--warning` | Delayed / maintenance |
| Danger | `#B8402A` | `--danger` | Failed / critical |
| Info | `#33566B` | `--info` | Neutral notices |

Legacy semantic aliases (`--color-surface`, `--color-foreground`,
`--color-primary`, `--color-border-strong`, `text-muted-foreground`, …) are
mapped onto this palette in `@theme inline`, so older screens inherit the
identity without being rewritten.

---

## 3. Typography

| Face | Token | Role |
|---|---|---|
| Instrument Serif | `font-display` | Plate titles, statements, metric numerals, the wordmark's neighbours |
| Inter Tight | `font-sans` (default) | Interface text, labels, table cells |
| JetBrains Mono | `font-mono` | Eyebrows, plate numbers, coordinates, timestamps, every tabular figure |

Rules:

- Display type is **tight** (`tracking -0.025em`, `line-height 0.94`) and set in
  `clamp()` so it breathes on wide screens without overflowing small ones.
- Italic serif inside a display line is the emphasis device — it replaces bold
  and colour-blocking.
- Never set body copy in the serif face, never set a heading in Inter Tight.
- `.eyebrow` = mono, 10px, `0.24em` tracking, uppercase. One per section.

---

## 4. Geometry & surface

- `.corner-ticks` — four hairline registration marks that frame a plate.
- `.blueprint` / `.blueprint-ink` — 56px / 48px technical grid (light / ink).
- `.ruled` — 44px ruled ledger lines.
- `.tnum` — tabular figures for every number that aligns in a column.
- Rail widths: `--rail-closed: 5.25rem`, `--rail-open: 16rem`.
- Sheet measure: `--sheet-max: 90rem`, gutters 1.25rem → 2.25rem.

---

## 5. Shell

**Instrument rail** (`components/layout/Sidebar.tsx`)

- 84px closed; 256px on hover or keyboard focus (`focus-within`).
- Closed state shows only plate number + glyph + active tab. Wordmark, group
  names, destination labels and status text are clipped and faded to `opacity-0`
  while closed; they never leak into the sheet.
- Active destination inverts to paper with ink type, a 2px pine edge and a
  vermilion signal tick.
- Destinations are numbered `01`–`10`, grouped *Theatre operations* /
  *Administration*, filtered by the session role.

**Command bar** (`components/layout/Header.tsx`)

- 64px, paper, one hairline. Breadcrumb in mono with a vermilion asterisk,
  live clock (via `useSyncExternalStore`), alert centre, identity, sign-out.
- `role` / `user` props exist for previews and tests; runtime reads the session.

**Working sheet** (`components/layout/AppShell.tsx`)

- Pages render their own `<main>`; the shell never introduces a second one.
- Each navigation re-keys the sheet: `page-enter` = 500ms rise. No spinners, no
  curtain that delays content.

**Auth** (`components/auth/AuthShell.tsx`)

- Dark frontispiece with the theatre plan layered *behind* a full-width
  statement (never a squeezed column), plus the sheet where the form lives.
- Below `lg`, the frontispiece is dropped and the form is the page.

---

## 6. Motion

| Primitive | Where | Behaviour |
|---|---|---|
| `page-enter` | AppShell | 500ms rise on navigation |
| `Reveal` | Landing plates | IntersectionObserver, 850ms rise, `--reveal-delay` stagger |
| `.plate-line` | SVG plates | Stroke draw-in on mount |
| `.rule-sweep` | Mastheads | Scale-X sweep |
| `.signal-dot` | Status | 2.6s opacity/scale pulse |
| `link-draw` | Text links | Underline draws from the left |

All motion is neutralised by the global `prefers-reduced-motion` block in
`globals.css`. Motion explains hierarchy; it never decorates.

---

## 7. Components

- `brand/Brand.tsx` — `BrandMark` (aperture reticle) + `Wordmark`.
- `visual/TheatrePlan.tsx` — original suite plan: corridor, theatre, scrub,
  anaesthesia, equipment, lamps, table, door swings, dimension ticks.
- `visual/DeptGlyph.tsx` — four geometric department identifiers.
- `ui/PageHeader.tsx` — engineering title block (2px ink rule, eyebrow, display
  title, meta chip, action slot top-aligned).
- `ui/MetricStrip.tsx` — one bordered instrument band divided by hairlines.
- `ui/Ledger.tsx` — ruled list (`LedgerRow`, `LedgerTime`).
- `ui/Card.tsx` — a plain sheet, used sparingly.

---

## 8. Do / Don't

**Do** number plates, use hairlines, set numbers in mono/serif, let one
vermilion mark carry attention, give each screen a composition of its own.

**Don't** reintroduce the generic vocabulary: rounded cards, drop shadows,
gradient heroes, glass panels, emoji, blob backgrounds, four-up identical metric
cards, fabricated statistics, charts without data, or a second accent colour.

---

## 9. File map

```
src/app/globals.css              tokens, theme bridge, utilities, motion
src/app/layout.tsx               fonts + metadata
src/app/page.tsx                 landing (05 plates)
src/app/login|register/page.tsx  auth sheets
src/components/layout/*          AppShell, Sidebar, Header
src/components/auth/AuthShell    frontispiece + sheet
src/components/brand/*           mark + wordmark
src/components/visual/*          theatre plan, department glyphs
src/components/motion/Reveal     scroll choreography
src/components/ui/*              PageHeader, MetricStrip, Ledger, Card
```

Tailwind scans `src` only (`@source '../../src'`), deliberately excluding
`.agents/`, `docs/` and scripts whose illustrative token strings are not valid
CSS utilities.
