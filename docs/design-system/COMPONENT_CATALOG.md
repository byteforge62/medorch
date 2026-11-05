# MedOrch — Component Catalog

Every component below is importable from `src/components/ui/` (primitives) or
`src/components/landing/system/` (sections). They all read the same semantic
tokens from `src/app/globals.css`, so a `data-palette` scope restyles them
without per-component variants.

Live reference: **`/design-system`** (localhost:3100). Each specimen on that
page carries the variant name and its props in a label.

Conventions shared by every component:

- **No hardcoded colour, radius or duration.** Only semantic tokens
  (`bg-sheet`, `text-ink-muted`, `border-border`, `var(--dur-base)` …).
- **Extend `className`, never replace it.** Every component accepts
  `className` and appends; layout stays at the call site.
- **State is never colour-only.** Status always carries its word; a bar always
  exposes its number; icon buttons require `aria-label`.
- **Motion is tokenised** (`--dur-fast/base/slow`, `--ease-standard/emphasis`)
  and every transition has a `motion-reduce` counterpart.

---

## 1. Buttons — `src/components/ui/Button.tsx`

`Button` extends the native `HTMLButtonElement` props and forwards its ref.

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `primary` \| `secondary` \| `outline` \| `ghost` \| `danger` \| `icon` \| `text` | `primary` |
| `size` | `xs` \| `sm` \| `md` \| `lg` | `md` |
| `shape` | `control` \| `pill` | `control` |
| `isLoading` | `boolean` | `false` |
| `loadingLabel` | `string` | `Loading` |
| `children` | `ReactNode` | required |

| Variant | Use | Contrast note |
| --- | --- | --- |
| `primary` | One per view; the committed action | Fill + `text-primary-ink`, so mint palettes flip to dark ink |
| `secondary` | Paired with primary in heroes and CTAs | Muted fill, no border |
| `outline` | Toolbar / filter actions on light surfaces | Hairline + `shadow-xs` |
| `ghost` | Header links, dismissals, in-card actions | Text-only until hover |
| `danger` | Irreversible clinical actions | `bg-danger` + white |
| `icon` | Square, glyph-only | Requires `aria-label` |
| `text` | Inline row action ("View record") | Underline-on-hover, no fill |

`isLoading` sets `aria-busy`, disables the control and swaps in
`loadingLabel` for assistive technology. `disabled` uses
`--disabled-opacity` rather than a colour swap.

**Links that look like buttons** use the exported helper, never a `<button>`
inside an `<a>` (invalid nesting, two tab stops, no accessible name):

```tsx
import { buttonClasses } from '@/components/ui/Button';
<Link href="/login" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
  Sign in
</Link>
```

---

## 2. Navigation — `src/components/ui/SiteNav.tsx`

`SiteNav` is the only interactive client component in the primitive set.

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `minimal` \| `floating` \| `transparent` \| `solid` | `solid` |
| `brand` | `ReactNode` | required |
| `items` | `NavItem[]` (`label`, `href?`, `children?: NavLink[]`) | required |
| `cta` | `{ label, href }` | — |
| `secondary` | `{ label, href }` | — |
| `label` | `string` (landmark name) | `Primary` |
| `className` | `string` | `''` |

| Variant | Treatment | Direction |
| --- | --- | --- |
| `minimal` | Hairline rule, no container; the page owns the margin | A |
| `floating` | Detached capsule with pill CTA, floats over content | B |
| `transparent` | No chrome, inherits a dark hero | C |
| `solid` | Full-width bar + hairline | product-adjacent default |

Behaviour, identical in all four: a parent item with `children` renders a
disclosure **button** (`aria-expanded`, `aria-controls`), not a hover menu;
Escape closes and returns focus to the trigger; outside click closes; below
`lg` the links collapse into one panel behind a labelled trigger with the same
Escape/focus contract.

---

## 3. Typography — `src/components/ui/Type.tsx`

| Component | Props | Notes |
| --- | --- | --- |
| `Display` | `as` (`h1`…`h3`), `size` (`xl`/`lg`/`md`), `id`, `className` | Tight display face, `text-balance` |
| `SectionHeading` | `eyebrow?`, `title`, `description?`, `align` (`start`/`center`), `as`, `className` | Pairs eyebrow + title + lede in the documented rhythm |
| `Body` | `size` (`sm`/`md`/`lg`), `tone` (`ink`/`secondary`/`muted`), `className` | Measure capped by `--ds-measure` where used |
| `Eyebrow` | `tone` (`muted`/`ink`/`accent`) | Uppercase, `0.18em` tracking, 11px |
| `Caption` | `className` | Metadata, mono-friendly |
| `Highlight` | `children` | Accent underline, keeps text selectable |
| `Label` | `htmlFor`, `className` | Form-field label, uppercase micro-caps |

Headings are always chosen by `as`, never by size — a visual `md` display can
still be an `h2` for the document outline.

---

## 4. Surfaces — `src/components/ui/Surface.tsx`

One container with six materials and four tones, instead of six card
components.

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `plain` \| `feature` \| `interactive` \| `metric` \| `preview` \| `inset` | `plain` |
| `tone` | `default` \| `raised` \| `inverse` \| `tinted` | `default` |
| `padding` | `none` \| `sm` \| `md` \| `lg` | `md` |

| Variant | Elevation | Typical content |
| --- | --- | --- |
| `plain` | `shadow-sm` | Body copy blocks |
| `feature` | `shadow-md` | Capability cards |
| `interactive` | `shadow-sm` → `md` on hover, `-translate-y-0.5` | Linked cards; suppressed by `motion-reduce` |
| `metric` | `shadow-xs` | Numeric facts |
| `preview` | `shadow-lg`, `overflow-hidden` | Product frames |
| `inset` | hairline only, no shadow | Nested rows inside a surface |

`tone="inverse"` applies `inverse-surface`, which re-points the ink tokens so
nested text, rules and pills stay legible on the dark plate without a second
component.

---

## 5. Data presentation — `src/components/ui/StatusPill.tsx`, `Indicators.tsx`

| Component | Props | Renders |
| --- | --- | --- |
| `StatusPill` | `tone` (`positive`/`attention`/`critical`/`neutral`/`info`/`accent`), `size` (`sm`/`md`), `dot`, `children` | Label + optional aria-hidden dot |
| `MetricIndicator` | `label`, `value`, `unit?`, `detail?`, `tone` | Value, unit, label, supporting detail |
| `ProgressBar` | `value` 0–100 (clamped), `label?`, `valueLabel?`, `tone`, `size` (`sm`/`md`) | `role="progressbar"` with `aria-valuenow` |
| `Timeline` / `TimelineItem` | `label?` / `time`, `title`, `description?`, `tone`, `last` | Ordered event list with a connecting rule |
| `ChartFrame` | `title`, `caption?`, `meta?`, `footer?`, `children` | Titled frame with a labelled plot region |
| `AvailabilityIndicator` | `state` (`available`/`in-use`/`maintenance`/`offline`), `label?`, `detail?` | Equipment state with reason |
| `OperationalStatus` | `level` (`nominal`/`watch`/`critical`), `label?`, `detail?`, `live` | Theatre/suite status; `live` reserved for genuinely streaming state |

`StatusTone` and `AvailabilityState` are exported types, so call sites map
their domain vocabulary (scheduled, in progress, delayed, cancelled, completed)
onto one visual language instead of inventing badges.

---

## 6. Inputs and controls — `src/components/ui/Input.tsx`

| Component | Props | Validation |
| --- | --- | --- |
| `Field` | `label`, `hint?`, `error?`, `required?`, `htmlFor?`, `children` (exactly one control) | Clones its child to wire `id` + `aria-describedby`; renders the error with `role="alert"` |
| `TextInput` | `id`, `invalid`, native input props | `aria-invalid`, danger border |
| `SearchInput` | `label?`, `defaultValue?`, `placeholder?` | Controlled value with a labelled clear button |
| `Select` | `id`, `invalid`, `children` (`<option>`) | `aria-invalid` |
| `Textarea` | `id`, `invalid`, native props | `aria-invalid` |
| `Toggle` | `label`, `description?`, `defaultChecked?`, `disabled?` | `role="switch"` + `aria-checked` |
| `Checkbox` | `label`, `description?`, `defaultChecked?`, `disabled?` | Native input, focus ring on the box |

`Field` takes one element, not a render function, because these components are
used from server components and a function child cannot cross that boundary.
The error/hint wiring therefore happens by cloning the control.

---

## 7. Landing sections — `src/components/landing/system/`

Each section owns its internal layout and exposes the composition variants
that the three directions mix. Content is passed in; no section hardcodes copy.

| Component | Variants | Key props |
| --- | --- | --- |
| `Hero` (`hero.tsx`) | `split`, `statement`, `overlay` | `eyebrow`, `title`, `description`, `primary`, `secondary?`, `support?`, `preview?` |
| `Showcase` (`showcase.tsx`) | `framed`, `offset`, `bleed` | `eyebrow?`, `title`, `description?`, `preview`, `annotations?` |
| `FeatureSection` (`features.tsx`) | `grid`, `rows`, `alternating` | `eyebrow?`, `title`, `description?`, `items` (`code?`, `title`, `note`) |
| `StatsBand` (`stats.tsx`) | `inline`, `plate`, `rail` | `label?`, `facts` (`value`, `label`, `detail?`) |
| `Workflow` (`workflow.tsx`) | `steps`, `timeline`, `rail` | `eyebrow?`, `title`, `description?`, `steps` (`index`, `title`, `note`) |
| `CtaBand` (`cta.tsx`) | `split`, `centered`, `panel` | `title`, `description?`, `primary`, `secondary?`, `meta?` |
| `SiteFooter` (`footer.tsx`) | `columns`, `editorial`, `compact` | `brand`, `columns`, `note?` |
| `ProductFrame` / `ProductPreview` (`preview.tsx`) | `schedule`, `equipment`, `audit` × `light`/`dark` | `title?`, `meta?`, `tone` |

`ProductPreview` renders sample records only (OT-01…04, six schedule states,
equipment availability, audit rows) and every frame carries a **Preview**
plate, so a prototype can never read as live clinical data. Copy and facts live
in `content.ts` (`modules`, `scheduleStates`, `roles`, `scheduleRows`,
`equipmentRows`, `auditRows`, `platformFacts`, `workflowSteps`, `featureItems`)
and are shared by all three directions.

---

## Not part of the system

`src/components/landing/LandingHero.tsx` and `LandingMobileNav.tsx` are legacy
and no longer imported anywhere. They are left untouched in this phase and are
**retire candidates** once a direction ships — deleting them now would edit
files this phase does not own.
