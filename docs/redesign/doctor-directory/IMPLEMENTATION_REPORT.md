# Doctor Directory — Implementation Report

Phase 2 of the MedOrch redesign. Scope: `src/app/doctors/DoctorDirectory.tsx` plus two scoped
keyframes in `src/app/globals.css`. No other module, route, service, repository, Prisma model or
dependency was touched.

Companion documents in this folder:

- `FUNCTIONAL_TEST_REPORT.md` — executed test matrix, engineering checks, blocked items.
- `VISUAL_REVIEW.md` — screenshot inventory, before/after comparison, defects found and fixed.
- `CHANGE_MANIFEST.md` — file-by-file change record.

---

## 1. The problem the redesign had to solve

The HEAD component was a generic admin CRUD screen:

| Region | HEAD implementation | Why it failed the brief |
| --- | --- | --- |
| Header | eyebrow "Clinical Operations", `<h1>` "Doctor Directory", one descriptive sentence | said nothing about the workforce; the sentence restated the counts below |
| Metrics | four white `Card`s in `sm:grid-cols-2 xl:grid-cols-4` (Total / Active / Pending / Suspended or rejected) | the forbidden "repeated stat cards" pattern, and the only organising concept was account status |
| Filters | a `Card` holding a search `<input>` and a status `<select>` | no specialty filter at all, although specialization is how a medical staff office reasons |
| Roster | a `Card` > `<table class="min-w-[820px]">` with six columns (Doctor, Specialization, Department, License, Status, Profile created) + Actions | the forbidden "conventional table as the primary experience"; horizontal scroll below 820 px |
| Detail | separate route reached by a "View details" link | no comparison, no context, no in-place review |
| Empty/error | `EmptyState` / `ErrorState` | kept, semantics preserved |

So the before-state was **stat cards + a table**, not (as an earlier draft of
`MEDORCH_DOCTOR_DIRECTORY_REDESIGN_REPORT.md` claimed) "six identical cards". That narrative has
been corrected; the screenshot `screenshots/00-before-1440.png` is the authoritative record.

## 2. New information architecture

Three deliberate regions, each answering a different question, in descending scope:

```
┌ Masthead ────────────────────────────────────────────────────────────────┐
│ MEDICAL STAFF OFFICE · Clinical Workforce                       ledger:  │
│ description (2 lines, left)              Profiles | Approved |           │
│                                          Awaiting review | Restricted    │
├ Specialty composition ───────────────────────────────────────────────────┤
│ proportional band (real specialization counts) + interactive legend      │
├ Clinical Workforce Atlas ────────────────────────────────────────────────┤
│ Specialty rail │ Clinician index (numbered roster) │ Clinician profile    │
│  10.5rem       │  minmax(0,1fr)                   │  18rem               │
└──────────────────────────────────────────────────────────────────────────┘
```

1. **Masthead + approval ledger** — the workforce in one sentence, then four hairline-separated
   figures aligned to the description baseline. This is a ledger (`<dl>`), not four cards: no
   borders, no boxes, no backgrounds, numerals in JetBrains Mono with `tabular-nums`.
2. **Specialty composition band** — a proportional bar built from real `specialization` values,
   with an interactive legend. Selecting a segment or legend entry filters the index; non-matching
   segments dim to 30 % opacity. It is the only visualisation above the workspace.
3. **Clinical Workforce Atlas** — one bounded surface divided by rules into specialty rail, index
   and profile. Selecting a row never navigates: the profile pane (desktop) or bottom sheet
   (mobile) updates in place, so clinicians can be compared without losing the list.

## 3. Component and state map

Single client component, 1283 lines, no new dependencies.

| Concern | Location | Notes |
| --- | --- | --- |
| selection state | `selectedDoctorId` L90 | one source of truth for desktop pane *and* mobile sheet |
| Escape-to-close | effect L119–129 | window keydown, only while a selection exists, listener removed on cleanup |
| roster fetch | effect L131–160 | `apiClient.get<Doctor[]>('/api/doctors')` |
| admin option fetch | effect L163–197 | users + departments, only when `isAdmin` |
| search / status / specialty filtering | `filteredDoctors` L210–243 | one memo, name/email/specialization/licence/department, case-insensitive |
| ledger counts | `counts` L244–258 | derived from `doctors`, no stored counters |
| status mutation | `handleStatusChange` L260–297 | `PATCH /api/doctors/:id/status`, optimistic-free: replaces the returned status in place |
| create | `handleCreateDoctor` L298–373 | `POST /api/doctors` |
| edit | `handleUpdateDoctor` L374–425 | `PATCH /api/doctors/:id` |
| specialty grouping | `specialtyGroups` L426–458 | count per `specialization`, `Unspecified` fallback, empty groups dropped |
| active profile | `activeDoctor` L459–471 | explicit selection, else first filtered doctor (desktop context), never on mobile |
| role gate | `isAdmin` L472 | `session?.user?.role === 'ADMIN'` — unchanged rule |
| band tones | `BAND_TONES` L474–481 | six token-based opacities of `--primary`; no gradients |
| status vocabulary | `statusMeta` L483–518 | label / short / dot / chip / action per status |
| reset | `resetFilters` L520–524 | clears search, status and specialty |
| profile renderer | `renderProfile` L526–706 | shared by desktop aside and mobile sheet |
| masthead | L709–735 | title, description, `<dl>` ledger |
| composition band | L737–820 | band `role="img"` with aria-label, legend buttons with `aria-pressed` |
| create panel | L823–935 | admin only, `<form onSubmit={handleCreateDoctor}>` |
| edit panel | L938–1049 | admin only, prefilled from `editingDoctor` |
| workspace | L1051–1219 | rail (L1055), index (`ul aria-label="Clinician index"`, L1147), 4-column metadata grid per row |
| desktop profile | L1221–1256 | `aside aria-label="Clinician profile"` |
| mobile sheet | L1258–1278 | `role="dialog" aria-modal="true"`, Close button with `autoFocus` |

### Data flow (unchanged end to end)

```mermaid
flowchart LR
  A[Prisma Doctor + User] --> B[doctor.repository.ts<br/>findDoctors]
  B --> C[doctor.service.ts<br/>getDoctors]
  C --> D[GET /api/doctors<br/>authorizeApiPermission 'doctors:read']
  D --> E[apiSuccess → { success, data }]
  E --> F[apiClient.get<br/>src/lib/api/client.ts]
  F --> G[DoctorDirectory state: doctors]
  G --> H[filteredDoctors / counts / specialtyGroups]
  H --> I[Index rows · band · profile pane]
  J[Approve / Suspend / Reject] --> K[PATCH /api/doctors/:id/status<br/>'doctors:manage']
  L[Edit profile] --> M[PATCH /api/doctors/:id<br/>'doctors:manage']
  N[Create profile] --> O[POST /api/doctors<br/>'doctors:manage']
  K --> G
  M --> G
  O --> G
```

The component still reads `Doctor` exactly as the API returns it (`user`, `department`,
`specialization`, `licenseNumber`, `createdAt`). No field was invented, no new endpoint was added,
no envelope was changed.

## 4. Interaction rules

- **Selection** — clicking a row sets `selectedDoctorId`; the row reports `aria-pressed` and gains
  a two-pixel left rule. Desktop keeps a contextual profile visible at all times (`filteredDoctors[0]`
  when nothing is explicitly selected); mobile shows a sheet *only* after an explicit selection.
- **Filters** — search (L210), status `<select>` and specialty (rail and legend, both
  `aria-pressed`) compose. Every change resets nothing else: they are independent predicates.
- **Empty state** — when `filteredDoctors` is empty, the index is replaced by a short message and a
  single **Clear filters** action (L1137), which is the only place filters are reset.
- **Escape** — closes the mobile sheet only; the desktop pane has no dismiss semantics, so Escape
  is a no-op there and never clears a filter.
- **Admin gating** — governance buttons and the edit affordance render only under `isAdmin`;
  otherwise the profile ends with "Read-only view. Account governance requires administrator
  access." The server still enforces `doctors:manage` on every mutation; the UI gate is a courtesy,
  not the boundary.
- **Create / edit panels** — mutually independent panels above the workspace, both collapse on
  cancel, both surface server errors in `role="alert"` blocks.

## 5. Design-system adherence

- **Tokens only.** `text-ink`, `text-ink-secondary`, `text-ink-subtle`, `bg-surface-subtle`,
  `bg-[var(--sheet)]`, `border-rule`, `border-rule-soft`, `panel`, `control`, `bg-primary`,
  `bg-success-soft`, `bg-warning-soft`, `bg-danger-soft`. No new colours, no blue gradients.
- **Type.** Sora for headings, Inter for body, JetBrains Mono for ordinals, licence numbers, dates
  and ledger figures with `tabular-nums` so columns do not jitter.
- **No forbidden patterns.** No glassmorphism, no blobs, no decorative badges, no repeated stat
  cards, no table, no six-card grid, no second dashboard layout, nothing copied from OT Rooms.
- **Motion.** Two scoped keyframes appended to `globals.css`: `.workforce-panel-enter` (220 ms,
  18 px rise + fade) and `.workforce-sheet-enter` (240 ms). Everything else uses
  `transition-colors`/`transition-opacity` at 150–300 ms. The global
  `@media (prefers-reduced-motion: reduce)` block already sets animation/transition duration to
  0.01 ms, so both entrance animations are neutralised without extra code.
- **Depth.** One shadow token (`--shadow-sm`) for the selected row and one (`--shadow-lg`) for the
  mobile sheet. No layered glass surfaces.

## 6. Responsive compositions

| Viewport | Composition |
| --- | --- |
| 1440×900 | three columns `lg:grid-cols-[10.5rem_minmax(0,1fr)_18rem]`; ledger inline to the right of the description; band legend wraps to one row |
| 1024×768 | same three columns (the `lg` breakpoint is 1024), tighter rail; ledger wraps under the description; legend wraps to two lines; measured 0 px horizontal overflow |
| 390×844 | single column: ledger becomes a 2×2 grid, band legend wraps, rail becomes a horizontally scrollable chip strip, index rows keep ordinal + status chip, profile only as a bottom sheet (max 86 vh, internally scrollable) |

The earlier draft used `xl:` for the workspace grid, which collapsed the three-region layout into a
stacked pile at 1024 px; it now uses `lg:`. The desktop aside is explicitly `hidden … lg:block` so
it cannot leak into the mobile flow, and mobile children carry `min-w-0` so long names and the
specialty rail cannot create page-level overflow.

## 7. Accessibility

- Landmarks and labels: `nav[aria-label="Filter by specialty"]`, `ul[aria-label="Clinician index"]`,
  `aside[aria-label="Clinician profile"]`, `section[aria-label="Specialty composition"]`,
  `section[aria-label="Clinician directory"]`, `dialog[aria-modal="true"]` with a per-clinician
  `aria-label`.
- State: `aria-pressed` on the selected row and on both specialty navigations; the selected row
  also carries a visible rule so the state is not colour-only.
- Keyboard: every control is a native `button`, `select`, `input` or `a`; Tab order is
  search → status → rail → index rows → profile actions; Enter/Space activate rows; Escape closes
  the mobile sheet; focus lands on the sheet's Close button when it opens.
- Text: ledger numerals are decorative-friendly but present as text; status is encoded by chip text
  as well as dot colour; the completeness checklist uses text + a filled/hollow square, not colour
  alone.
- The automated suite `npm run test:accessibility` passes 5/5 (evidence in `evidence/accessibility.txt`).

## 8. What was deliberately preserved

- `src/app/doctors/page.tsx` still calls `requirePermission('doctors:read')` and renders `AppShell`.
- API routes, validation schemas, permission strings, service/repository functions, Prisma models
  and the `{ success, data }` envelope are untouched.
- `handleStatusChange`, `handleCreateDoctor` and `handleUpdateDoctor` keep their original request
  shapes and error handling; only their presentation moved.
- Every existing piece of information survives somewhere in the new composition (department,
  licence, email, profile date, status, completeness signals).

## 9. Evidence boundaries

- No PostgreSQL instance is available in this environment (`ECONNREFUSED`), so no request in this
  package reached a database. Read paths were exercised against the project's own preview fixtures
  (`src/lib/preview/fixtures.ts`) which feed the real component; write paths were exercised against
  the temporary harness described in `FUNCTIONAL_TEST_REPORT.md` §2, which stubs only the transport.
- Consequently: *the UI contract and state transitions are verified; persistence, audit rows and
  server-side permission rejections are not.* Those are listed as BLOCKED, never as passes.
- All harness code was deleted after capture; `CHANGE_MANIFEST.md` records exactly what was removed.

## 10. Acceptance gate

1. **Is the composition bespoke rather than a restyled template?** Yes — an editorial masthead with
   a ledger, a proportional composition band and a three-region atlas; no card grid, no table.
2. **Does it implement the three required layers (overview, discovery, contextual profile)?** Yes —
   ledger + band (A), rail + numbered index + search/filters (B), shared profile renderer with
   governance actions (C).
3. **Are the forbidden patterns absent?** Yes — no six-card grid, no conventional table, no repeated
   stat cards, no gradients/glass/blobs, no ornamental badges, no copied OT Rooms layout.
4. **Does each viewport have a deliberate composition?** Yes — three columns at 1440 and 1024,
   stacked with a bottom sheet at 390; 0 px overflow measured at all three.
5. **Are admin actions functional, not decorative?** Yes — approve, suspend, edit and create were
   executed and produced the correct request bodies plus the expected UI state changes.
6. **Are authentication and authorization untouched?** Yes — `requirePermission('doctors:read')`,
   `authorizeApiPermission('doctors:manage')` and the `isAdmin` UI gate are unchanged; no server
   code was modified for the harness.
7. **Are API contracts, Prisma models and business logic intact?** Yes — same endpoints, same
   bodies, same envelope, same service/repository calls.
8. **Was any medical data invented?** No — every field rendered comes from the `Doctor`/`User`
   shape; the fixtures and harness rows are clearly labelled synthetic test data.
9. **Is the evidence honest about its own limits?** Yes — each interaction records before/after DOM
   state, and DB-dependent checks are marked BLOCKED rather than inferred.
10. **Was the change contained to this module?** Yes — one component plus two keyframe classes; no
    other module, route, schema or dependency was modified.
