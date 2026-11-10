# MedOrch Design System

## Identity

MedOrch is designed as a **clinical daybook**: a controlled operational record with the calm of printed hospital stationery and the precision of theatre instrumentation.

The identity is built from four recurring ideas:

1. **The aperture mark** — a square viewfinder around a clinical cross. It appears in the shell, access boundary and public identity.
2. **Cool clinical paper** — white working sheets on a pale blue-grey ground, separated by fine rules rather than stacked floating cards.
3. **The theatre rule** — a short working-colour line before a module label, used where a section needs a clear operational beginning.
4. **The record plate** — monospaced codes, timestamps and identifiers reserved for genuine technical values, never used as decorative body copy.

The existing approved light clinical palette remains the foundation. No gradients, glassmorphism, neon, decorative blobs or fabricated clinical diagrams were introduced.

---

## Palette

| Token | Value | Purpose |
| --- | --- | --- |
| `--paper` | `#f5f8fb` | Clinical canvas |
| `--paper-deep` | `#edf3f8` | Recessed bands |
| `--sheet` | `#ffffff` | Working surface |
| `--ink` | `#243447` | Primary text and inverted plates |
| `--ink-secondary` | `#718096` | Supporting copy |
| `--ink-subtle` | `#8795a6` | Decorative metadata only |
| `--pine` | `#245b8f` | Primary action, focus, active state |
| `--pine-soft` | `#e7eff7` | Selected rows and soft primary surfaces |
| `--brass` | `#168c91` | Working teal accent, live signal |
| `--vermilion` | `#c74646` | Harm, cancellation, patient record signal |
| `--success` | `#24845d` | Completed / operating |
| `--warning` | `#b7791f` | Pending / delayed / maintenance |
| `--info` | `#168c91` | Informational status |

Status is never conveyed by colour alone. Every badge or indicator carries a text label.

---

## Typography

| Role | Family | Behaviour |
| --- | --- | --- |
| Display / module titles | Sora | Tight tracking, 600 weight, up to ~2.9rem in workspaces |
| Interface / body | Inter | 12–15px working sizes with 1.6–1.8 line height |
| Technical values | JetBrains Mono | Record IDs, times, counts, timestamps only |

Rules:

- Workspace headings are proportional to the screen, not marketing scale.
- All-caps is limited to short record labels and plates; most operational labels are sentence case.
- Numbers use tabular figures where comparison matters.
- Hairlines and whitespace create hierarchy before shadow or colour.

---

## Surfaces and geometry

| Surface | Specification |
| --- | --- |
| Panel | White, 1px `--rule`, 10px radius, soft clinical shadow |
| Flush panel | Same as panel, clips internal rows, no padding |
| Control | 8px radius, solid white, hairline border, 1px shadow |
| Dense row | Hairline separator, no individual card border |
| Inverted plate | `--ink` ground, white/teal type, used sparingly for date and command plates |

Panels are used only where a record needs containment. Lists, ledgers, timelines and filter desks are usually open bands or single flush panels rather than repeated cards.

---

## Module composition

| Module | Composition |
| --- | --- |
| Public landing | Editorial clinical narrative with operating-theatre drawing, not a generic SaaS hero |
| Access / auth | Dark instrument frontispiece + working sheet with one printed access record |
| Shell | Persistent 84px dark-to-light instrument rail, command bar, paper working sheet |
| Admin dashboard | Hospital-wide operational intelligence: attention queue, room state, alerts, live numbers |
| Doctor workspace | Day plan organised around the clinician's own cases |
| OT workspace | Theatre command: room state first, then assignment timeline |
| Patient workspace | Patient-facing visit record, not an operational control panel |
| Schedules | Theatre timeline and resource coordination board (Stage 3D, preserved) |
| Equipment | Asset readiness and allocation inventory |
| Theatres | Spatial theatre floor and room-state management |
| Doctors | Workforce atlas with directory and profile sheets |
| Patients | Master-detail patient registry and clinical record |
| Departments | Organisational index + selected division resource record |
| Alerts | Prioritised signal register |
| Accounts | Identity-first access register with role scope |
| Audit | Chronological ledger with inline event inspection |

The shared identity is consistent; the information architecture is deliberately not.

---

## Interaction and state

- Hover and focus states are state-driven, using 120–250ms transitions.
- Focus uses a 2px pine outline or a 3px focus-within ring on control shells.
- Reduced motion collapses all animation and transition durations to near-zero.
- Loading uses skeleton structures or named loading states, never an empty page.
- Empty states name the absence and the next useful action.
- Error states keep the record context and provide a retry where the API allows it.
- Success states are inline, short and tied to the changed record.
- Dialogs and destructive confirmations retain the native safety confirmation for pause/reactivate operations.

---

## Responsive behaviour

- Desktop: persistent rail, multi-column record layouts.
- Tablet: rail retained, secondary columns collapse into readable stacked records.
- Mobile: drawer navigation, single-column data, date plates become horizontal or compact blocks, tables are replaced with row-based records.
- Responsive layout changes structure; it does not merely shrink desktop columns.

The browser verification checks page-level horizontal overflow at 390px for the landing, login, dashboard, departments, users, audit and patient appointment surfaces.

---

## Accessibility

- Landmarks: shell header, primary navigation, breadcrumb and page `<main>`.
- All field labels are programmatically associated.
- Record rows are buttons or links with contextual accessible names.
- Navigation toggle exposes `aria-expanded` and resolves `aria-controls`.
- Tabs use `aria-pressed`; current navigation uses `aria-current="page"`.
- Status and error messages use `role="status"` or `role="alert"`.
- Keyboard focus is visible on inputs, selects, links and navigation.
- Reduced motion is honoured globally.
- Patient-facing pages avoid operational language and do not expose unauthorised records.
