# MedOrch — creative UX review

Three interactive concepts that replace the earlier landing-page directions as
the subject of review. The previous three (`direction-a`, `direction-b`,
`direction-c`) shared one composition — masthead, oversized hero, product card,
stacked sections — and were rejected for that reason. They remain reachable for
comparison only.

| | Route | Model |
| --- | --- | --- |
| A · Digital theatre control room | `/design-system/concept-control` | Console: select a theatre, then a case; the record re-reads in place |
| B · Surgical case journey | `/design-system/concept-journey` | Scroll-linked lifecycle of one case through seven records |
| C · Interactive hospital suite | `/design-system/concept-suite` | Spatial plan where every region is a selectable record |

**No concept has been selected.** This document compares interaction models,
strengths, weaknesses and tradeoffs. It does not rank them, and the production
landing page (`src/app/page.tsx`) is unchanged.

## How the three differ

| | A · Control room | B · Case journey | C · Suite plan |
| --- | --- | --- | --- |
| Primary object | The theatre and its day | One surgical case | The suite as a drawing |
| Entry action | Choose a room | Start scrolling / jump to a stage | Choose a region |
| Navigation | Room rail + case list + context tabs | Sticky stage rail with scroll position | Plan regions + manifest index |
| Page structure | One console, then a short operator legend | Seven full-height records, then completion | Drawing sheet, manifest, notes, title-block CTA |
| Scroll model | Fixed console, local state changes | Document scroll drives progress and active stage | Document scroll; the plan pans internally on narrow screens |
| Motion | Short fades on holds and tab panels | Progress and stage markers follow scroll | Dashed set route, focus and hover states |
| Typography | Mono labels, Sora room codes, dense 9–13px UI text | Georgia document serif for headings, Inter for records | Mono annotations, Sora headline, technical drawing labels |
| Grayscale silhouette | Dark console, vertical rail, thin horizontal lane | Pale page, long left spine, wide record grid | White drawing sheet with heavy room outlines and hatching |
| Page height at 1440 | ≈1,214px | ≈3,006px | ≈1,860px |

Colour is not what separates them. With colour removed, A is a dark instrument
panel, B is a printed document with a vertical spine, and C is an architectural
sheet. Their anchor order, grid behaviour and primary interaction all differ.

## Concept A — Digital theatre control room

**Interaction model.** The first screen is the working surface: a theatre rail on
the left, the selected theatre's day in the middle, the selected case's context on
the right. Choosing a theatre rewrites the day, the case list, the readiness
figures and the context panel without navigating. Choosing a case rewrites people,
sets and audit entries. The three context tabs (People, Sets, Trail) are a
keyboard tablist; arrow keys move between them. A provisional 30-minute room hold
can be placed and released, which draws a block on the strip, adds a row to the
list, and is labelled "not saved".

**Techniques used.** Contextual panel, meaningful selection states, progressive
disclosure (record field, action trail), an operational timeline, and a small
resource-allocation action. Not used: scroll effects, route transitions, cards.

**Strengths**

- The product is the landing page. There is no marketing composition to decode:
  a visitor learns the product by operating a plausible theatre day.
- Three surfaces share one state, so the relationship between room, case, team
  and set is demonstrated rather than described.
- Dense but calm; a theatre manager can read room state, occupancy, the next case
  and turnover in one pass without leaving the first screen.
- The mobile arrangement preserves the model: room chips, a readable case list,
  the same context panel below.

**Weaknesses**

- The opening has no proposition beyond the console: a visitor who does not
  already know what MedOrch is must infer it from labels. This is deliberate, but
  it raises the cost of the first ten seconds.
- Persistent dark instrumentation can read as monitoring or security software
  rather than a clinical record; the palette is a strong filter.
- The sample day is fixed at 09:42, so "live" is represented, not performed.
  A real clock would be a product claim the prototype cannot support.
- The room rail and the case list both act as selectors; the duplication is
  useful but adds chrome.

**Implementation tradeoffs.** One client component holds the selection state;
there are no fetches, no API changes and no persistence. A provisional hold is
explicitly local because writing a hold would require a scheduling mutation the
prototype must not perform. The console fits a desktop viewport at 1440×900 with
the legend below the fold; at 1024 it scrolls, which is acceptable because the
rail still selects rooms. On mobile the occupancy strip is removed rather than
squeezed, and the case list carries the same information.

**Screenshots.** `screenshots/creative/concept-a-initial-1440.png`,
`concept-a-full-1440.png`, `concept-a-initial-390.png`, `concept-a-full-390.png`;
interaction states `concept-a-room-ot03-1440.png`, `concept-a-sets-1440.png`,
`concept-a-hold-1440.png`, `concept-a-mobile-ot03-390.png`.

## Concept B — Surgical case journey

**Interaction model.** The page follows one case through seven records: booking,
confirmation, room allocation, team assignment, equipment readiness, procedure
and completion. A sticky rail names the current stage and marks it as the reader
scrolls; a hairline progress line reports how far through the record they are.
Selecting any stage in the rail jumps to it. Each stage opens its own handover
record — actor, action, time and detail — so the audit trail is discovered where
it is written rather than in a separate section.

**Techniques used.** Scroll-linked storytelling (position, not interception),
sticky contextual navigation, progressive disclosure per stage, and a document
rhythm that makes capability statements subordinate to the record they produce.
No scroll-jacking: the page scrolls normally and the rail follows it.

**Strengths**

- The clearest causal story of the three: each stage explains what the system
  holds at that point and why it matters, in the order a real case acquires it.
- Strongest differentiation in grayscale and typography. Georgia headings on
  paper read as a clinical document; nothing about the silhouette resembles the
  other two concepts or the rejected directions.
- The per-stage record grid makes an abstract claim ("the record travels with the
  case") concrete without a product screenshot.
- Sticky stage rail gives orientation on a long page; the mobile chips keep the
  journey navigable without a scroll bar.

**Weaknesses**

- Length is the cost of the model. Seven full-height stages produce a ≈3,000px
  page at 1440, and the payoff depends on the visitor reading rather than
  scanning.
- The serif register departs from the product's own type system; it is coherent
  inside this concept but would be a brand decision if adopted.
- The scroll-linked state is JavaScript-driven (IntersectionObserver), so with
  JavaScript disabled the rail remains a set of anchors but stops marking the
  active stage — the information is still reachable, the feedback is not.
- One case can feel narrow: a visitor interested in rooms or equipment still
  reads the whole lifecycle to reach those surfaces.

**Implementation tradeoffs.** The spine, progress line and active stage are
computed from scroll position and an observer; no scroll listeners modify layout,
so the page cannot trap the wheel. Reduced motion removes the disclosure
animation without removing content. The concept adds no navigation chrome beyond
the stage rail and a back-to-concepts link, which keeps the document feel but
means there is no global product menu on the page.

**Screenshots.** `screenshots/creative/concept-b-initial-1440.png`,
`concept-b-full-1440.png`, `concept-b-initial-390.png`, `concept-b-full-390.png`;
interaction states `concept-b-stage-05-1440.png`,
`concept-b-record-open-1440.png`, `concept-b-stage-07-1440.png`,
`concept-b-mobile-stage-04-390.png`.

## Concept C — Interactive hospital suite

**Interaction model.** The suite is drawn as one sheet: four theatres above a
clean corridor, sterile services, anaesthesia, team base, recovery and equipment
below. Every region is a focusable control. Selecting one rewrites the record
panel beside the plan — summary, held items, room cases — and draws the route an
instrument set takes from the sterile store to the selected theatre. A layer
switch changes what the plan annotates: room state, held resources, or role
coverage. The manifest below the sheet offers the same nine regions as rows for
visitors who prefer a list, and Previous/Next steps through the plan in drawing
order.

**Techniques used.** Spatial diagram as navigation, contextual information panel,
layered annotations, keyboard-selectable SVG regions, and an internal pan for
small screens. The set route is the only animated element and it is suppressed
under reduced motion.

**Strengths**

- Most distinctive browsing model: the suite's geography is the index, so rooms,
  sterile services and recovery are understood by where they sit, not by a menu.
- The plan carries real relationships — a theatre's route to sterile services,
  anaesthesia assigned to windows rather than rooms, recovery as the handover
  point — which no card layout communicates.
- Strong grayscale identity: line weights, hatching, dimension labels and a title
  block make it read as a drawing, not a dashboard.
- Scales to nine regions without growing the page much; the manifest keeps the
  same content reachable by list and by keyboard.

**Weaknesses**

- The drawing is diagrammatic, not a real floor plan. It must never be presented
  as a hospital's actual layout, and adopting it would require either a fictional
  suite or a real one drawn deliberately.
- On a 390px screen the plan pans inside its frame; half the suite is off-screen
  at load. The manifest compensates, but the spatial model is weaker on touch.
- SVG text scales with the drawing; at 1024 and below, annotations become small
  even when still legible.
- The route line implies wayfinding and set-tracking behaviour; the schema models
  assignments, not movement, so the line has to be understood as illustrative.

**Implementation tradeoffs.** The plan is inline SVG with `role="button"`,
`aria-pressed`, Enter/Space handling and a visible focus stroke; the accessible
name includes the region's state summary. No image assets are used. Selecting a
region is local state only. The plan's minimum width is 720px inside an
`overflow-x-auto` frame, so the page never overflows horizontally while the plan
itself remains readable. Layer annotations are recomputed from the same shared
sample records as the other concepts.

**Screenshots.** `screenshots/creative/concept-c-initial-1440.png`,
`concept-c-full-1440.png`, `concept-c-initial-390.png`, `concept-c-full-390.png`;
interaction states `concept-c-room-ot03-1440.png`,
`concept-c-equipment-layer-1440.png`, `concept-c-sterile-1440.png`,
`concept-c-mobile-ot02-390.png`.

## Techniques, selected per concept

| Technique | A · Control room | B · Case journey | C · Suite plan |
| --- | --- | --- | --- |
| Scroll-linked storytelling | — | Yes (position, not interception) | — |
| Interactive spatial diagram | — | — | Yes |
| Contextual information panel | Yes | Per-stage record | Yes |
| Expandable operational timeline | Case list + trail | Handover record per stage | Room day in the panel |
| Animated state transitions | Hold and panel fades | Progress and marker transitions | Set route, focus states |
| Layered composition | Rail / day / context | Spine / statement / record | Drawing / annotations / record |
| Progressive disclosure | Tabs, record field | Per-stage audit disclosure | Layer switch, context |
| Interactive resource allocation | Provisional 30-minute hold | — | — |
| Hover, focus, selection states | Yes | Yes | Yes |
| Responsive touch | Room chips, list rows | Stage chips | Tap regions, internal pan |

Deliberately avoided in all three: scroll-jacking, decorative animation without a
state behind it, gradient blobs, floating dashboard cards, repeated feature-card
grids, oversized display headings as the main event, cursor-following effects and
loading animations.

## Evaluation evidence

All three routes were built in the workspace and served from the local dev server
(Next.js 16, port 3100). Checks were run with Chromium via Playwright against that
server.

- **Routes:** `/design-system/concept-control`, `/design-system/concept-journey`,
  `/design-system/concept-suite` each return HTTP 200 independently.
- **Viewports:** 1440×900, 1024×768 and 390×844 produce no horizontal page
  overflow (page `scrollWidth` equals `clientWidth` at all three). Concept C's
  plan deliberately pans inside its own frame at narrow widths.
- **Console:** zero console errors and zero page errors on all three concepts at
  1440 and 390.
- **Interactions:** 18/18 scripted checks pass, covering room and case selection,
  arrow-key tabs, hold placement and release, stage jumps, scroll-driven stage
  marking, audit disclosure, depth stepping, plan selection and layers, keyboard
  activation of SVG regions, touch selection, reduced-motion behaviour and mobile
  overflow. Raw results: `screenshots/creative/interactions.json`.
- **Keyboard:** room controls, case rows, tabs, stage links, region groups and the
  manifest are reachable by Tab; Enter/Space activates a region; tabs use arrow
  keys. Focus is visible on every control (SVG regions draw a focus stroke).
- **Touch:** room chips, case rows, stage chips and plan regions respond to taps;
  hit areas in the case list and stage chips are at least 32px high.
- **Reduced motion:** the journey remains navigable and the plan's route
  animation is disabled (`animation-name: none`).
- **Screenshots (24):** `screenshots/creative/` — for each concept: initial
  viewport at 1440, full page at 1440, initial and full page at 390, three or four
  interaction states, and at least one mobile interaction state. The per-concept
  lists above name every file.

Not covered by this evidence: automated accessibility auditing (no axe run),
Firefox and Safari rendering, screen-reader testing, and real-device touch. These
are stated as limits rather than assumed to pass. Screenshots include the Next.js
development indicator because they were taken from the dev server.

## Product authenticity

The sample data is modelled on the deployed Prisma schema and only uses fields
that exist:

- `OTRoom` → room code, name, specialty/department, capacity, status
  (available, occupied, maintenance).
- `Schedule` → procedure, priority (elective, urgent, emergency), status
  (scheduled, confirmed, in progress, delayed, completed), start and end times.
- `ScheduleStaff` and `StaffRole` → surgeon, anaesthetist, scrub, circulating,
  recovery assignments.
- `Equipment` and `ScheduleEquipment` → instrument sets, cameras, devices,
  availability, maintenance and assignment/release.
- `AuditLog` → action, entity, actor and timestamp for every written record.
- `Department` and role scopes → the department on each theatre and the
  permission framing used in the records.

All names, codes, patient references and times are synthetic and labelled as
sample data in the interface. No hospital customer, clinician, patient, outcome
statistic, certification, accreditation or testimonial appears in any concept.
The suite plan in C is a diagram of relationships, not a claim about a real
hospital's floor plan.

## Files and boundaries

Added:

- `src/components/landing/system/concepts/concept-data.ts` — shared synthetic
  records.
- `.../concepts/control-room.tsx`, `.../concepts/case-journey.tsx`,
  `.../concepts/suite-plan.tsx` — the three client concepts.
- `src/app/design-system/concept-control|concept-journey|concept-suite/page.tsx` —
  independently accessible routes.
- `docs/design-system/CREATIVE_UX_REVIEW.md`, 24 screenshots and interaction
  evidence under `docs/design-system/screenshots/creative/`.

Modified only for navigation: `src/app/design-system/page.tsx` now lists the
three concepts beside the superseded directions. That page is the preview
playground, not the production landing page.

Unchanged: `src/app/page.tsx` (production landing), shared design tokens in
`globals.css`, component APIs and primitives, dashboard modules, authentication,
API routes, Prisma schema and migrations. No dependency was added. Motion is CSS
plus scroll/observer state, with reduced-motion handling.

## What to evaluate

These are the questions the three answers differently. They are criteria, not a
ranking:

1. **Where should the product first appear?** In A the first screen is the
   console; in B the product appears as records inside a story; in C the suite is
   the first screen and the record follows selection.
2. **What should the visitor do?** Operate a day (A), follow a case (B), or move
   through a space (C).
3. **What does the page ask the visitor to read?** A almost nothing, B a
   paragraph per stage, C annotations plus a short record.
4. **Which promise is most defensible today?** A promises legibility, B promises
   attributable lifecycle, C promises spatial understanding of resource
   relationships. The last is the most metaphorical and needs the most care in
   copy.
5. **What does adoption cost?** A needs a product-state model on the marketing
   page; B needs strong copy and accepts length; C needs an accurate suite
   diagram or a clearly fictional one.

No winner is chosen here.
