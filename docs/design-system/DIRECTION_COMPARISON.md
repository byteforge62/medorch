# Landing directions — comparison report

Three complete, independently accessible landing previews:

| | Route | Screenshots |
| --- | --- | --- |
| A — Clinical Technology | `/design-system/direction-a` | `screenshots/direction-a-{1440,1024,390}.png` |
| B — Premium Enterprise | `/design-system/direction-b` | `screenshots/direction-b-{1440,1024,390}.png` |
| C — Operational Intelligence | `/design-system/direction-c` | `screenshots/direction-c-{1440,1024,390}.png` |

**No direction has been selected.** This report describes trade-offs, not a
recommendation to ship one now.

## What all three share

- The same primitives (`Button`, `Type`, `Surface`, `StatusPill`,
  `Indicators`, `SiteNav`) and the same section components; differences come
  from palette scope, section order and variant choice, plus two
  direction-local operational sections each.
- Real MedOrch vocabulary: ten modules, six schedule states, four role scopes,
  equipment availability states and the audit trail.
- Sample records only, labelled **Preview**, with a footer line naming them as
  sample data. No hospital customers, clinicians, patients, outcome numbers,
  certifications or testimonials appear in any direction.
- No gradients, no abstract blobs, no image placeholders: every product plate
  is built from the interface vocabulary itself.

## Structural composition

| Block | A — Clinical Technology | B — Premium Enterprise | C — Operational Intelligence |
| --- | --- | --- | --- |
| Nav | `minimal`, static masthead, dropdown | `floating` pill bar, dropdown | `transparent` over the dark hero, dropdown |
| Hero | `split`: copy 6/6 with the schedule | `statement`: centred declaration, plate beneath | `overlay`: dark field, room-state plate right |
| Theatre scheduling | Ruled **theatre board** table (room, domain, case, occupancy, state) | **Room register** as an editorial list with display numerals | **Room lanes**: 8-hour occupancy tracks per theatre |
| Coordination | **Case dossier**: team column + instrument-set column | **Two plates**: inverse team plate, offset instrument plate | **Desk**: roster + sets, with the attributed event stream |
| Showcase | `framed`: audit trail + equipment side by side | `offset`: audit trail against the record argument | `bleed`: the day sheet, full width with annotations |
| Features | `grid`, six capabilities | `alternating`, six specification-style rows | `rows`, six operational domains |
| Workflow | `steps`, four numbered moves | `rail`, four moves as a horizontal rail | `timeline`, four attributed steps |
| Metrics | `inline` band | `rail` band | `plate` band |
| Final CTA | `split` | `panel` (dark) | `centered` |
| Footer | `columns` | `editorial` | `compact` |

A reads top-to-bottom as a technical dossier, B as a printed institutional
document, C as an operations desk. They are not recolours: anchor order, grid
behaviour and the primary product surface differ in every direction.

## Direction A — Clinical Technology

**Intended audience.** Theatre managers, clinical directors, informatics and
procurement committees evaluating whether the system is legible and defensible.
**Register.** Precision instrument: cool clinical ground, navy ink, teal accent.

**Strengths**

- The theatre board is the most *literal* answer to "show me room availability":
  aligned columns, occupancy and turnover in the same row as the case.
- Dense but calm; each product claim is immediately backed by an interface
  plate, which suits a technical evaluation.
- The case dossier (team + instrument set side by side) communicates the
  coordination model faster than copy can.
- Scales down cleanly: the table re-flows into stacked rows with no horizontal
  scroll at 390, and the two-column dossier becomes one column.

**Weaknesses**

- The palette is the least differentiated of the three; navy-and-teal is close
  to category convention, even without a gradient.
- The hero is informational rather than emotive — it will not carry an
  awareness campaign on its own.
- Highest text density of the three: at 390 the board becomes a long stack, and
  small mono labels may read as an internal tool to a non-clinical visitor.

**Variants used.** `SiteNav minimal` · `Hero split` · `Showcase framed` ·
`FeatureSection grid` · `Workflow steps` · `StatsBand inline` · `CtaBand split` ·
`SiteFooter columns` · `Surface preview/inset` · `ProgressBar`, `StatusPill`,
`AvailabilityIndicator` · direction-local `TheatreBoardA`, `CoordinationA`.

## Direction B — Premium Enterprise

**Intended audience.** Executive and board-level buyers, procurement and
partnership audiences assessing the institution-grade system of record.
**Register.** Printed stationery: warm porcelain, near-black ink, bronze accent.

**Strengths**

- Most distinctive identity: the porcelain/bronze palette and large display type
  do not look like hospital software, which is the point of this direction.
- The room register is ownable — rooms presented as a register with occupancy as
  a display figure, not a dashboard widget.
- The inverse team plate against porcelain creates a strong rhythm and gives the
  coordination section visual weight without cards.
- Editorial restraint (hairline rules, generous spacing) reads as considered and
  expensive, and the dark CTA panel closes the page decisively.

**Weaknesses**

- Least product-first opening: at 1440×900 the hero's schedule plate sits below
  the fold, so the first impression is typography before software.
- Floating pill nav plus centred declaration is the most convention-adjacent
  "premium SaaS" pattern of the three; distinct in palette, familiar in shape.
- Longest page (≈5.9k px at 1440): the editorial spacing that creates the
  premium feel costs scroll and puts more weight on copy quality.
- "Specified, not decorated" sets a high bar; every line of copy has to earn the
  register, and thin content would expose the layout.

**Variants used.** `SiteNav floating` · `Hero statement` · `Showcase offset` ·
`FeatureSection alternating` · `Workflow rail` · `StatsBand rail` ·
`CtaBand panel` · `SiteFooter editorial` · `Surface feature/inverse`, `inset` ·
`ProgressBar`, `StatusPill`, `AvailabilityIndicator` · direction-local
`RoomRegisterB`, `CoordinationB`.

## Direction C — Operational Intelligence

**Intended audience.** Operations directors, theatre-suite managers and
perioperative leads buying live state and accountability, not a brochure.
**Register.** Operations desk: graphite ground, mint signal, monospace detail.

**Strengths**

- The product is unambiguously central: the hero carries a live room-state
  panel, and the room lanes make idle capacity and conflicts visible at a glance.
- The lanes board is the most immediately legible "availability" artefact of the
  three and is genuinely hard to mistake for a marketing graphic.
- State machine + event stream + audit trail form one coherent argument about
  attributed transitions, which is the product's real differentiator.
- The hero panel answers "what is open right now?" instead of repeating the day
  sheet that appears later on the page.

**Weaknesses**

- Dark-first styling can read as monitoring, security or trading software; some
  clinical buyers will find it less reassuring than a light ground.
- Mint-on-graphite is high signal but fatiguing across long passages; this
  direction keeps prose short, which constrains future copy.
- The lanes require reading (hour scale, block lengths); short blocks truncate
  their labels on narrow durations and rely on a hover title.
- On mobile the lanes deliberately become per-room time lists — coherent, but
  the signature visual is lost on the smallest screen.

**Variants used.** `SiteNav transparent` · `Hero overlay` · `Showcase bleed` ·
`FeatureSection rows` · `Workflow timeline` · `StatsBand plate` ·
`CtaBand centered` · `SiteFooter compact` · `Surface inset` ·
`OperationalStatus`, `Timeline`, `ProgressBar`, `StatusPill`,
`AvailabilityIndicator` · direction-local `SuitePanelC`, `RoomLanesC`,
`CoordinationC`.

## Mobile composition (390×844)

| | Behaviour |
| --- | --- |
| A | Nav becomes a disclosure panel; the theatre board re-flows to stacked rows (room → domain → case → occupancy → state); the dossier becomes one column; all product plates stay full width. |
| B | Floating pill collapses to brand + menu; the register stacks index/room above the specialty and occupancy figure; the two coordination plates stack with their offset removed; the editorial footer folds to sections. |
| C | Transparent nav becomes a solid panel when opened over the dark hero; room lanes become per-room time lists with the same records; the hero room panel moves below the copy and CTAs; the desk roster and event stream stack. |

Verified at 390: no horizontal overflow on any direction, all anchors resolve,
navigation opens and closes with Escape and returns focus to its trigger.

## Verification for this pass

- `npx tsc --noEmit` → exit 0.
- Nine route/viewport combinations (3 directions × 1440×900, 1024×768, 390×844):
  HTTP 200, horizontal overflow 0 px, console errors 0, failed requests 0,
  broken images 0 (`evidence/directions-matrix.json`).
- Navigation, anchor and CTA interactions: 12/12 PASS
  (`evidence/directions-interactions.json`): each direction's dropdown opens and
  closes on Escape, its room anchor sets the expected hash, its hero CTA resolves
  to `/login`, and its mobile panel opens, closes on Escape and restores focus.
- Screenshots: full-page captures of each direction at all three viewports in
  `screenshots/direction-{a,b,c}-{1440,1024,390}.png`.

## Choosing without a recommendation

These are the questions the three directions answer differently; they are
offered as evaluation criteria, not as a ranking:

1. **What should the first screen prove?** A proves the schedule is legible.
   B proves the product belongs to a serious institution. C proves the suite can
   be seen live.
2. **Who signs?** A committee evaluating fit and permission scope (A's record
   language and role scopes), an executive protecting institutional reputation
   (B's register and restraint), or an operations lead who wants idle capacity
   and conflicts visible (C's lanes).
3. **Where will it be seen?** A conference screen at 1024 favours A's table and
   B's register. A control-room or demo environment favours C.
4. **What must the copy carry?** B puts the most weight on prose; C the least.
5. **What is the risk of the register?** A risks blending into clinical software;
   B risks reading as a design exercise rather than software; C risks reading as
   a monitoring tool rather than a clinical record.
