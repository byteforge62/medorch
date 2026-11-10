# MedOrch — Visual Direction

## Position

MedOrch is a working clinical record, not a dashboard product. The interface is set like **printed hospital stationery**: warm limestone paper, deep green ink, a rust registration mark, and a serif voice for the things that matter. It should feel like a well-made case note on a consultant's desk, not a SaaS dashboard with a medical skin.

The previous plate-heavy pass was too literal: photographs were used as content, every module got an image band, and the geometric sans made the product read as generic software. This direction removes that. Photography is reduced to three purposeful anchors and is always treated — desaturated, blurred or frosted — never presented as a plain picture.

## Three rules

1. **The record is the interface.** Cards, tables and image tiles are the fallback, not the default. Modules are built from open registers, ruled rows, typographic bands, drawn schematics and status compositions.

2. **Photography is atmosphere, not a gallery.** Only three surfaces carry an image: the landing preview, the sign-in boundary and the admin theatre window. Each is desaturated and scrimmed; the sign-in image is genuinely blurred. No stock photo stands in for a doctor, patient, department, alert, schedule or equipment item.

3. **One voice, many compositions.** A serif display face carries page titles and record names; Public Sans carries the interface; IBM Plex Mono is reserved for machine values. The palette, rules and control language stay constant, so modules are recognisable by their structure rather than by a different theme.

## Material language

- **Ground:** warm clinical limestone `#f1efe8`; working sheets `#fbf9f3`; recessed paper `#e7e3d8`.
- **Ink:** deep green-black `#202b26`; secondary `#5c6962`; muted `#727d76`.
- **Structure:** hairlines `#d7d3c7`, heavier double rules for mastheads, square 2px corners on controls and sheets. No floating cards, no soft shadow stacks, no glass.
- **Primary:** surgical green `#24594a`. **Accent:** rust `#a45d3f`, used for registration marks, active indices and the second clause of a title.
- **Semantics:** success `#2d7355`, warning `#9c671d`, danger `#a9483c`; always printed beside a word, never colour alone.
- **Inverse:** the sidebar and the equipment/OT bands use `#18261f` with ivory type and a faint blueprint grid.

## Typography

| Role | Face | Use |
|---|---|---|
| Display | **Newsreader** 400/500/600 | Page titles, record names, large operational figures. Tight leading, editorial scale. |
| Interface | **Public Sans** | Navigation, body, labels, forms, register rows. |
| Machine | **IBM Plex Mono** 400/500 | Codes, serials, timestamps, durations, plate marks. |

Section labels are sentence case, not tracked uppercase. Mono is never used for a whole label row. Figures are tabular and oversized only when the number is the subject.

## Composition

### Shell
A deep-green instrument rail with ivory type, a numbered index and a rust edge on the active destination. The command bar is paper, not white, with a hairline rule. Content sits on a centred measure with generous margins.

### Dashboard
The masthead is an editorial split: a large serif title and description on the left, a full-width theatre window below, and a four-part metric register built into its base. The window is desaturated, scrimmed and framed by a blurred environmental field. Below it, operational attention is a ruled two-column ledger, not four stat cards.

### Page headers
`PageHeader` prints an indexed kicker in rust, a large serif subject, a single orientation column, and a double rule. No dot, no pill, no card.

### Equipment
A dark readiness board carries the four real counts as large serif figures over a composition bar. The inventory is an **open register**: a ruled list with a drawn category glyph, serif item name, department, serial, readiness and a minimal status control. There is no `<table>` and no thumbnail.

### Theatres
A two-column register of rooms, each a ruled entry with code, name, state, booked cases, a one-pixel day bar and capacity. The selected-room panel replaces the corridor photograph with a **drawn theatre schematic** — table, pendant, anaesthesia stack, trolley and scrub door — labelled as schematic.

### Schedules
The reference photograph is gone. The day desk is now a printed masthead with a rust index, serif title and ruled day/week strips; the timeline remains the subject.

### Doctors, patients, departments, alerts
Photographic bands are removed. Each page states its rule typographically:
- Doctors: a printed no-portrait statement between double rules.
- Patients: a text-first privacy statement; no patient image exists.
- Departments: a division frontispiece with a line glyph and record head, then the operational footprint.
- Alerts: a severity board with rail colours and printed counts; no monitor photograph.

### Audit
The ledger keeps its integrity strip and timeline, now on the warm paper and green ink tokens.

### Access and landing
The sign-in page keeps one treatment-bay photograph, deliberately blurred behind an ink wash; the form is the subject. The landing page keeps one theatre preview image, softened and duotone, and replaces the second photographic band with the room schematic. All hard-coded blue values were remapped to the warm/green palette.

## Motion

- One page-enter rise, one plate settle, one skeleton sweep.
- Hover changes edge and background, not elevation; no levitating cards.
- The active room mark is a rust rule, not a glow.
- Everything collapses under `prefers-reduced-motion: reduce`.

## Guardrails

No plain full-colour stock photographs in product content. No invented patient or clinician identity. No fabricated charts. No dark-theme drift. No workflow, API, schema, auth, URL or data change. No new dependency.
