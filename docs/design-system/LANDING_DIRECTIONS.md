# Landing Directions

Three prototypes, each a full page built only from the components in
`COMPONENT_CATALOG.md`. They differ in **palette scope, section order, section
variants and density** — not in a recoloured copy of one template.

| | A — Clinical Technology | B — Premium Enterprise | C — Operational Intelligence |
| --- | --- | --- | --- |
| Route | `/design-system/direction-a` | `/design-system/direction-b` | `/design-system/direction-c` |
| Palette | default clinical (`#17324d` navy, `#087e8b` teal) | `data-palette="enterprise"` (`#f7f4ef` porcelain, `#23291f` pine, `#8a5a2b` brass) | `data-palette="intelligence"` (`#0b1418` graphite, `#7fe3c8` mint) |
| Page ground | light, ice paper | warm light, porcelain | dark throughout |
| Nav | `minimal` | `floating` | `transparent` |
| Hero | `split` (copy left, schedule right) | `statement` (centred, preview below) | `overlay` (copy over dark plate) |
| Type scale | tight, technical | largest display, editorial | medium, instrument-like |
| Density | medium, rule-led | low, whitespace-led | high, data-led |

---

## Direction A — Clinical Technology

**Thesis.** MedOrch is software a theatre team operates. Credibility comes
from precision: hairlines, aligned columns, honest status vocabulary, and a
product frame that looks like the product rather than an illustration.

**Composition (top to bottom).**

1. `SiteNav variant="minimal"`, dropdown under *Modules*, `Sign in` CTA.
2. `Hero variant="split"` — eyebrow, display headline, lede, primary
   *Enter the platform*, secondary *Request an account*, and a
   `ProductPreview variant="schedule"` on the right.
3. `StatsBand variant="inline"` — a ruled strip directly under the hero
   (`platformFacts`: 10 modules, 6 schedule states, 4 role scopes, 1 audit spine).
4. `Showcase variant="framed"` — *The interface is the record*; the schedule
   frame sits inside a full-width rule/panel.
5. `FeatureSection variant="grid"` — four capabilities as coded cells.
6. `Workflow variant="steps"` — four numbered moves, same rhythm for elective
   and emergency.
7. `CtaBand variant="split"` — accounts approved before access; `Sign in` +
   `Request access`.
8. `SiteFooter variant="columns"`.

**What it signals.** Governance and clinical safety first. Best if the buyer
is a clinical director or theatre manager who needs to trust the record.

**Risk.** The most conventional of the three; without the product frame it
reads as infrastructure software.

**Screenshot.** `screenshots/10-direction-a-1440.png`,
`screenshots/13-direction-a-390.png`.

---

## Direction B — Premium Enterprise

**Thesis.** Sell the platform, not the screen. Warm porcelain, very large
display type, a floating capsule nav, and a product frame treated as an object
on a page rather than a window in a layout.

**Composition.**

1. `SiteNav variant="floating"` — detached pill bar, `Request access` filled.
2. `Hero variant="statement"` — centred two-line display headline over the
   full schedule preview; CTA pair centred beneath.
3. `FeatureSection variant="alternating"` — numbered capabilities, hairline
   rules, generous vertical space.
4. `Showcase variant="offset"` — heading offset left, preview pushed right on
   a tinted plate, so the two never share a baseline.
5. `Workflow variant="rail"` — four steps as a ruled rail, not cards.
6. `StatsBand variant="rail"` — facts on a dark rail plate (inverse surface).
7. `CtaBand variant="panel"` — the CTA is a dark inset panel inside the warm
   page, with the playground link as a tertiary ghost.
8. `SiteFooter variant="editorial"`.

**What it signals.** Confidence, budget, and a product that belongs beside
enterprise systems. Best if the buyer is procurement or a hospital group
evaluating vendors.

**Risk.** The least "clinical" of the three; brass-on-porcelain must not drift
into hospitality branding, and the type scale needs the real brand face before
launch.

**Screenshot.** `screenshots/11-direction-b-1440.png`,
`screenshots/14-direction-b-390.png`.

---

## Direction C — Operational Intelligence

**Thesis.** The theatre suite is a live system, so the page should read like an
instrument. Dark ground, one bright signal colour, live state visible above the
fold and a coordination board that shows how rooms, cases and equipment relate.

**Composition.**

1. `SiteNav variant="transparent"` — no chrome over the dark hero.
2. `Hero variant="overlay"` — copy over a dark plate, `ProductPreview
   variant="schedule" tone="dark"` inset in the hero, plus
   `OperationalStatus` readouts.
3. `Showcase variant="bleed"` — the interface breaks the gutter.
4. **Coordination board** (custom section, composed from `StatusPill`,
   `OperationalStatus`, `Surface tone="inverse"` and the schedule content) —
   theatres, cases and readiness on one plane.
5. `StatsBand variant="plate"` — facts on a light plate that inverts against
   the dark page.
6. `Workflow variant="timeline"` — the case lifecycle as a timeline.
7. `FeatureSection variant="rows"` — capabilities as dense ruled rows.
8. `CtaBand variant="centered"` — centred dark panel, mint primary action.
9. `SiteFooter variant="compact"`.

**What it signals.** Operational command. Best if the pitch is real-time
coordination across theatres, equipment and audit — the most differentiated
story of the three.

**Risk.** Dark UI raises contrast and photography requirements, and the data
density must stay legible at 390px (verified, but it is the tightest of the
three).

**Screenshot.** `screenshots/12-direction-c-1440.png`,
`screenshots/15-direction-c-390.png`, plus
`screenshots/16-mobile-nav-open-390.png` for the open mobile panel.

---

## Shared content, different argument

All three read the same `content.ts` and the same `ProductPreview` variants, so
differences between them are compositional, not factual. No prototype contains
a customer name, a testimonial, a certification, a clinical outcome statistic
or a usage number. The only figures are product facts (module count, schedule
states, role scopes, audit spine) and sample records (OT-01…04) marked
**Preview**.

## Comparing them

Open the playground's **Landing directions** section
(`/design-system#directions`), which renders each direction's hero and control
strip side by side, then open each route full-page at 1440 and 390. Compare on
four axes: *who signs the contract*, *what the page promises*, *how much
product is shown before any copy*, and *whether the palette survives without
the product frame*.

No direction has been selected. `/` is unchanged; nothing in this phase is
wired into production navigation.
