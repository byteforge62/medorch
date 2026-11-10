# Visual Polish Report

## Principle

This is a controlled polish of the recovered Final Transformation UI. It is not a
redesign. No page structure, information architecture, route, API call, permission or
business rule was changed for visual reasons.

The accepted direction is light clinical operational software: pale blue workspace,
white panels, blue primary action, teal structural accent, dense rows, pill statuses,
circular initials and three purposeful typefaces.

---

## 1. Typography

### Type system verified

`src/app/layout.tsx` loads:

- **Sora** — structure: page titles, section titles and operational figures.
- **Inter** — interface: navigation, labels, body copy, controls, tables.
- **JetBrains Mono** — machine values: codes, serials, timestamps, durations.

No new font family or font dependency was introduced.

### Changes

| Area | Change | Reason |
| --- | --- | --- |
| `.display` | Letter spacing `-0.035em → -0.032em`; line-height `1.02 → 1.04`; `text-wrap: balance` | Keeps display headings tight without collision or a one-word last line |
| `.section-title` | `1.25rem → 1.1875rem`; line-height `1.2 → 1.25`; balanced wrapping | Better hierarchy below page titles |
| `.lede` | Line-height `1.6 → 1.65`; measure `62ch → 66ch`; `text-wrap: pretty` | More readable supporting copy without widening the page |
| `PageHeader` | Heading clamp maximum `3rem → 2.8rem`; `text-balance` | Contains page titles at 1440 without making them small |
| Public landing | `h1`/`h2` now use the display face | Removes the public/authenticated type-system split |
| Numeric type | `.font-mono` now gets tabular numerals and `tnum`, in addition to `.tnum` | Times, IDs, counts and durations align in columns |
| Selection | Teal-soft `::selection` | Consistent with the clinical accent |

The previous rejected serif/editorial heading treatment is not present. `.display`
uses Sora.

---

## 2. Component and surface refinements

### Status pills

`Badge` keeps the accepted rounded pill, 11px semibold label and accepted variant
colours. A 1px inset black/5 ring was added. It defines the pill edge on white panels
without changing its shape or colour language.

### Panel motion

`.panel-hover` lift reduced from `-2px` to `-1px`. The shadow and border change remain.
This avoids a floaty card effect while preserving feedback.

### Focus visibility

The accepted `.control:focus-within` rule remains. Focused composite controls keep a
clear ring even where the inner input removes its own outline.

### Auth sheet

- Statement measure changed from `23ch` to `26rem`; type clamp reduced to `3rem`
  maximum; line-height set to `1.08`.
- Result at 1440: three controlled lines (“One controlled / record of the / theatre
  day.”), not one word per line.
- The accepted drawn theatre plan remains the only frontispiece; no photograph was
  restored.
- The index link is plain interface copy, not an ornamental mono arrow.

### Responsive schedule detail

At 390px, the staff card’s min-content width was set by a long `<select>` option. The
two assignment cards consequently extended 61px beyond the viewport. The fix is
limited to:

- `min-w-0` on the two assignment cards;
- `w-full min-w-0` on the two staff selects.

A direct DOM re-check returned:

```text
clientWidth: 374
scrollWidth: 374
bodyScrollWidth: 374
offending elements: 0
```

No layout was redesigned.

---

## 3. Deliberate non-changes

The following were considered and rejected:

- **Equipment thumbnails** — removed because the existing category-to-photo mapping
  would show a generic theatre photograph for unrelated devices, implying the photo
  represented the registered asset.
- **Photography across modules** — not added. The accepted UI is an operational
  surface, not a photo-led marketing site.
- **Audit integrity band** — removed; it was a leftover dark strip from the rejected
  visual pass and is absent from the accepted audit composition.
- **New cards or statistics** — not added. The accepted dashboards already use
  module-specific summaries.
- **Larger headings, gradients, glass, dark rail** — not reintroduced.

---

## 4. Before / after

### Public landing

Before recovery: warm paper, editorial headline, different visual system.  
After: pale clinical field, Sora headline, accepted schedule-preview composition and
blue primary action.  
Evidence: `screenshots/public-landing-1440.png`.

### Login

Before recovery: photographic/editorial access screen.  
After: accepted grid frontispiece with drawn theatre plan and a three-line statement.  
Evidence: `screenshots/public-login-1440.png`.

### Admin dashboard

Before recovery: oversized serif title and ruled editorial registers.  
After: accepted “Operations control” masthead, four-fact band, operational attention
panel and theatre board.  
Evidence: `screenshots/admin-dashboard-1440.png`.

### Equipment

Before recovery: editorial ruled register with altered type and surfaces.  
After: accepted white inventory register with dense rows, readiness states and status
controls.  
Evidence: `screenshots/admin-equipment-1440.png`.

### Audit

Before: accepted ledger plus a dark integrity strip from the rejected pass.  
After: accepted light ledger with filters, retained event count and inspection panel.  
Evidence: `screenshots/admin-audit-1440.png` and `admin-audit-1024.png`.

### Schedule detail at 390

Before: two cards forced a 61px page overflow.  
After: cards and selects fit the 390px viewport with zero overflow.  
Evidence: `screenshots/admin-schedule-record-390.png`.

---

## 5. Consistency checks

- One `<h1>` per page.
- Buttons align to the same right edge on module mastheads.
- Table headers use the shared eyebrow treatment; numeric cells use mono/tabular
  figures.
- Status pills use the shared Badge component or the existing schedule status badge.
- Panels use the existing `--radius-panel`, border and shadow tokens.
- No page uses a different palette or font stack.
- Mobile navigation is the accepted drawer; the 390px captures show the menu trigger,
  breadcrumb, alerts and sign-out.
- Desktop sidebars remain persistent at 1440 and 1024.

Full route/viewport results are in `FUNCTIONAL_TEST_REPORT.md`.
