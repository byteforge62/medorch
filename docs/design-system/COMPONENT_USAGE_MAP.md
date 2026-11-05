# Component Usage Map

Where each component appears, in which direction, and which variant is
recommended when a direction is chosen. "Playground" means the `/design-system`
section named in the second column.

## Buttons

| Context | Playground | A | B | C | Recommended |
| --- | --- | --- | --- | --- | --- |
| Nav CTA | Buttons | `primary` `sm` | `primary` `sm` `pill` | `outline` `sm` | `primary` `sm`; `pill` only inside a pill nav |
| Hero primary | Buttons | `primary` `lg` | `primary` `md` `pill` | `primary` `md` | `primary` `md` (`lg` only for a centred hero) |
| Hero secondary | Buttons | `secondary` `lg` | `ghost` `md` | `secondary` `md` | `secondary`, or `ghost` on a dark panel |
| Final CTA | Buttons | `primary` + `outline` | `primary` + `ghost` | `primary` + `outline` | `primary` + one quieter action, never two filled |
| Inline row action | Buttons | — | — | `text` `sm` | `text` — a bordered button inside a row is noise |
| Icon-only control | Buttons | Search clear | Search clear | — | `icon` with `aria-label`; never primary-coloured |
| Loading / disabled | Buttons | specimen | — | — | `isLoading` + `loadingLabel` for async submit |

## Navigation

| Variant | Used by | Why it fits | Recommendation |
| --- | --- | --- | --- |
| `minimal` | A | Page owns the margin; keeps the hero the first object | **Recommended default** for product-adjacent pages |
| `solid` | product pages | Full-width authority, hairlines match the record UI | Fallback when a page needs a hard boundary |
| `floating` | B | Signals a premium marketing layer, detaches from content | Only for a marketing surface, never inside the app |
| `transparent` | C | Lets a dark hero reach the top edge | Only with a sufficiently dark first section |

Mobile behaviour is shared: disclosure trigger, full-width panel, Escape
returns focus. All four were exercised at 390px.

## Typography

| Element | Component | A | B | C | Recommended |
| --- | --- | --- | --- | --- | --- |
| Page headline | `Display` | `size="lg"` `as="h1"` | `size="xl"` | `size="lg"` | `lg` unless the hero is a statement |
| Section title | `SectionHeading` | `align="start"` | `align="start"` | `align="start"` / centred CTA | `start`, description optional |
| Lede | `Body size="lg"` | yes | yes | yes | One lede per hero, never per section |
| Section lede | `Body` `tone="secondary"` | yes | yes | yes | Cap with `--ds-measure` |
| Metadata | `Caption` | preview meta | preview meta | timestamps | Mono, `text-ink-muted` |
| Kicker | `Eyebrow` | `tone="muted"` | `tone="accent"` | `tone="accent"` | `muted` on light, `accent` on dark |
| Emphasis | `Highlight` | — | — | — | Reserved; used only where a phrase carries the promise |

## Surfaces

| Variant | A | B | C | Recommended |
| --- | --- | --- | --- | --- |
| `plain` | feature copy blocks | — | dense rows | Default for body content |
| `feature` | capability cells | alternating cards | — | Capability cards on light pages |
| `interactive` | playground only | playground only | playground only | Only when the whole card is a link |
| `metric` | inline stats | — | plate stats | Facts inside a band |
| `preview` | product frames | product frames | dark product frames | Always for a product screenshot frame |
| `inset` | rows in a frame | rows in a frame | board rows | Nested rows only |

`tone="inverse"` is used by B's stats rail and CTA panel and by C's
coordination board; everywhere else surfaces stay default or tinted.

## Data presentation

| Component | A | B | C | Recommended |
| --- | --- | --- | --- | --- |
| `StatusPill` | schedule states | schedule states | states + board | `sm` + `dot` in tables, `md` standalone |
| `MetricIndicator` | playground | playground | board readouts | Playground/product only — landing uses `StatsBand` |
| `ProgressBar` | playground | — | board | Only with a real 0–100 value |
| `Timeline` / `TimelineItem` | playground | — | audit preview | Audit and lifecycle only |
| `ChartFrame` | playground | — | — | No landing chart until a real series exists |
| `AvailabilityIndicator` | equipment preview | — | board | Equipment surfaces |
| `OperationalStatus` | playground | — | hero readouts | C only; `live` only for streaming state |

## Inputs

| Component | Playground section | Landing use | Recommended |
| --- | --- | --- | --- |
| `Field` + `TextInput` | Inputs & controls | — | Only inside real forms (auth, registration) |
| `SearchInput` | Inputs & controls, Navigation | — | Product surfaces, not marketing heroes |
| `Select` / `Textarea` | Inputs & controls | — | Real forms only |
| `Toggle` / `Checkbox` | Inputs & controls | — | Settings; not decorative in a hero |

Inputs are documented and testable but deliberately absent from all three
landing prototypes: none of the three pitches needs a lead-capture form, and a
fake form would be dishonest about what `/register` does.

## Landing sections

| Section | A | B | C | Recommended |
| --- | --- | --- | --- | --- |
| `Hero` | `split` | `statement` | `overlay` | `split` — shows copy and product together above the fold |
| `Showcase` | `framed` | `offset` | `bleed` | `framed`; `offset` if the page needs editorial pacing |
| `FeatureSection` | `grid` | `alternating` | `rows` | `grid` for scanning, `rows` for density |
| `StatsBand` | `inline` | `rail` | `plate` | `inline` — least likely to read as a claim |
| `Workflow` | `steps` | `rail` | `timeline` | `steps`; `timeline` when order is the point |
| `CtaBand` | `split` | `panel` | `centered` | `split`; `centered` for a single action |
| `SiteFooter` | `columns` | `editorial` | `compact` | `columns` — real link groups, no newsletter theatre |
| `ProductPreview` | `schedule` | `schedule` | `schedule`/`dark` | `schedule` — it carries the six states |

## Direction-level reuse

Every direction imports the same section components, the same `content.ts`
and the same `ProductPreview`. No direction defines its own button, heading,
card or nav. The only direction-local markup is:

- **A:** none.
- **B:** none.
- **C:** the coordination board (lines composed from `StatusPill`,
  `OperationalStatus` and `Surface`), which is a section, not a new primitive.

The playground (`/design-system`) renders every primitive and every section
variant, so a direction change is a prop change, not a rewrite.
