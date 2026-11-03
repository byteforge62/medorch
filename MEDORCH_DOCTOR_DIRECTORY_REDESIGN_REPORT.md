# Doctor Directory — Bespoke Redesign Report

Scope: `src/app/doctors/DoctorDirectory.tsx` only, plus two scoped motion keyframes in `globals.css`.
Phase 2 of the MedOrch redesign. Admin Dashboard and OT Rooms were not modified in this phase.

---

## 1. Previous composition and its problems

The module rendered, top to bottom:

1. a header (eyebrow "Clinical Operations", `<h1>` "Doctor Directory", one descriptive sentence);
2. four white statistic cards in a `sm:grid-cols-2 xl:grid-cols-4` grid — Total doctors, Active,
   Pending approval, Suspended or rejected;
3. a filter card holding a search `<input>` and a status `<select>`;
4. a card containing the heading "Doctor profiles", a "N records" count and a conventional
   `<table class="min-w-[820px]">` with six columns (Doctor, Specialization, Department, License
   number, Status, Profile created) plus an Actions column whose only action was a "View details"
   link.

Problems:

- **Repeated statistic cards.** Four identical boxes were the entire overview; the only concept
  they expressed was account status.
- **A conventional table as the primary experience.** Every clinician reduced to a row of six
  undifferentiated cell values, and the whole thing needed horizontal scrolling below 820 px.
- **No context, only navigation.** Learning anything more about a clinician meant leaving the
  screen via "View details", so comparison was impossible.
- **No specialty organisation.** Specialization was one column among six, although it is the
  organising concept of a medical workforce, and there was no way to filter by it.
- **Duplicated status encoding.** Status appeared as a statistic, again as a table cell chip, and
  again inside the profile form.
- **The header restated the data** in a sentence while the cards beside it showed the same counts.

> Correction: an earlier draft of this section described "six identical profile cards". The
> authoritative before-state is the one above — statistic cards plus a table — as captured in
> `docs/redesign/doctor-directory/screenshots/00-before-1440.png`.

## 2. New information architecture

**A. Masthead with an approval ledger.** "Clinical Workforce" as an editorial title with a ruled
ledger of four figures (Profiles, Approved, Awaiting review, Restricted). This replaces the
count-sentence and is deliberately *not* four statistic cards: the values are hairline-separated
columns aligned to the baseline of the description.

**B. Specialty composition band.** A proportional bar whose segments are sized from real
specialization values, with an interactive legend beneath it. Both the band segments and the
legend filter the index, and non-matching segments dim. This is the only visualisation above the
workspace; there is no second status band, because status is already legible per clinician.

**C. Clinical Workforce Atlas (the discovery workspace).** One bounded surface divided by rules
into three regions, rather than a grid of free-floating cards:

- **Specialty rail** (left): vertical index of specialties with counts; horizontal scrolling chips
  on narrow viewports.
- **Clinician index** (centre): a numbered editorial roster. Each row is a hairline-separated
  ledger entry — ordinal, name, `specialty / department`, licence in mono, status chip — with a
  left two-pixel selection rule. Not a card, not a table: no column headers, no zebra striping.
- **Clinician profile** (right): the selected clinician's record — monogram, name, specialty,
  status, department, licence, email, profile date, explicit profile-completeness checklist, and
  the account-governance controls.

Selecting a row never navigates. On desktop the profile is a sticky pane; below the `lg`
breakpoint the same markup becomes a bottom sheet over a dimmed backdrop, opened only by an
explicit selection.

Typography: Sora for the display title, Inter for data, JetBrains Mono for licence numbers,
ordinals and counts — no new fonts, no decorative serif in operational data. Colour is unchanged
token-wise; status hue is the only saturated colour on the surface, and the composition band uses
one hue at stepped strengths rather than a categorical rainbow.

## 3. Files modified

| File | Change |
| --- | --- |
| `src/app/doctors/DoctorDirectory.tsx` | Render replaced; specialty filter, selection state, derived specialty/department composition, Escape handling, accessible names on the index. All handlers and API calls unchanged. |
| `src/app/globals.css` | Two scoped keyframes (`workforce-panel-in`, `workforce-sheet-in`) and their classes, appended before the existing global `prefers-reduced-motion` block. No token changes. |
| `MEDORCH_DOCTOR_DIRECTORY_REDESIGN_REPORT.md` | This report. |

No Prisma schema, route handler, auth, permission helper or unrelated module was touched.

## 4. Data fields and API contracts used

Read (unchanged contracts):

- `GET /api/doctors` → `Doctor[]`:
  `id`, `userId`, `departmentId`, `specialization`, `licenseNumber`, `createdAt`,
  `user { id, name, email, phone, status }`, `department { id, name } | null`.
- `GET /api/users` and `GET /api/departments` — admin-only, loaded for the create form.

Write (unchanged, and only reachable for admins):

- `PATCH /api/doctors/:id/status` with `{ status }` — governance controls.
- `PATCH /api/doctors/:id` with `{ departmentId, specialization, licenseNumber }` — edit form.
- `POST /api/doctors` with `{ userId, departmentId?, specialization?, licenseNumber? }` — create form.

Every value shown is a real field. Derived values are arithmetic over those fields only: specialty
group counts, department count, profile-completeness flags (department present, specialty present,
licence present, email present), and the four ledger figures.

**Deliberately absent**, because the contract does not provide them: photographs, availability or
on-shift state, workload, appointment volume, ratings, years of experience, qualifications beyond
the licence number, and any per-clinician metric. No placeholder was invented for them; where a
field is missing the interface says so ("Specialty not recorded", "Licence not recorded",
"Unassigned") and the completeness list marks it missing.

## 5. Interactions implemented

- **Search** across name, email, phone, specialization, licence and department (existing predicate,
  relocated into the index header).
- **Status filter** (`ALL` + four statuses) — existing behaviour, filters now labelled with the same
  vocabulary as the profile ("Pending approval").
- **Specialty filter** from two places: the rail and the composition legend. Re-pressing the active
  specialty returns to all clinicians.
- **Selection**: row click or keyboard `Enter` changes the profile pane; `aria-pressed` marks the
  active row; selection is cleared when the clinician falls out of the filtered set.
- **Mobile sheet**: opens on selection, closes via the backdrop, the Close button, or `Escape`;
  `role="dialog"`, `aria-modal`, focus moved to Close on open.
- **Empty state** for no-match and no-profiles, with a "Clear filters" action.
- **Create / edit profile** forms preserved verbatim (admin only), including validation messages
  and the eligible-account rule.
- **Account governance** remains wired to the existing status endpoint, with the current status
  disabled rather than hidden.
- **Motion**: 150–260 ms CSS transitions for selection and hover, a 220 ms profile entrance, a
  240 ms sheet entrance, and width/opacity transitions on the composition band. All animation is
  state-driven — no ambient or looping motion — and the global `prefers-reduced-motion` rule
  already collapses durations to 0.01 ms.

## 6. Screenshots

The authoritative capture set for this phase — 14 images covering before/after, search, specialty
filter, selection, read-only, admin approve/suspend/edit and mobile — is in
`docs/redesign/doctor-directory/screenshots/`, indexed in
`docs/redesign/doctor-directory/VISUAL_REVIEW.md`. The three quick views below are the earlier
phase captures.

Desktop — 1440×900

![Doctor Directory 1440](screenshots/v4-doctors-1440.png)

Laptop — 1024×768

![Doctor Directory 1024](screenshots/v4-doctors-1024.png)

Mobile — 390×844

![Doctor Directory 390](screenshots/v4-doctors-390.png)

## 7. Tests actually executed

Full logs and per-check before/after state live in `docs/redesign/doctor-directory/evidence/`;
the canonical record of this phase is `docs/redesign/doctor-directory/FUNCTIONAL_TEST_REPORT.md`.

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0 — 0 errors, 20 warnings (19 pre-existing in unrelated files; 1 new unused helper in this component) |
| Production build | `npm run build` | exit 0 |
| Accessibility unit tests | `npm run test:accessibility` | 5/5 pass |
| Permission unit tests | `npm run test:permissions` | 5/5 pass |
| Runtime authorization suite | `npm run test:runtime` | BLOCKED — `DATABASE_URL` unset, fails in `beforeAll` with `TypeError: Invalid URL` |
| Interaction suite (Playwright, headless Chromium, real component via `/preview/doctors`) | temporary script, removed after the run | 17/17 executed checks pass |
| Admin interaction suite (synthetic ADMIN session + stubbed transport) | same script | included in the 17 |

The interaction run covered: default render with ledger `6 / 4 / 1 / 1` and the read-only notice;
search narrowing to one row; no-match empty state; "Clear filters" restoring six rows and an empty
field; status filter "Suspended" → 1 row; specialty filter from the rail → 1 row with
`aria-pressed=true`; row selection updating the pane and setting `aria-pressed`; tab order from
search to the status `<select>`; keyboard `Enter` on a focused row switching the profile; the
mobile sheet opening with focus on Close, closing via Close, reopening, and closing via `Escape`;
horizontal overflow measured at 0 px at 1440, 1024 and 390; zero console errors and zero failed
requests. On the harness surface: approve (`PATCH .../status {ACTIVE}`, ledger 1→0 pending),
suspend (`PATCH .../status {SUSPENDED}`, Restricted 1→2), edit (`PATCH /api/doctors/doc-1` with the
new department/specialty/licence), and create (`POST /api/doctors {userId:'usr-8', …}` with the new
row appearing).

## 8. Known limitations and unverified behaviour

- **Persistence and server authorization are unverified.** Read paths ran against the project's
  preview fixtures; write paths ran on a temporary harness with a synthetic ADMIN session and a
  stubbed transport, so the requests are correct but nothing was written and no audit row exists.
  No PostgreSQL instance is available (`ECONNREFUSED`). Server-side 403s for non-admins, the
  signed-out redirect, duplicate-licence errors and the `test:runtime`/`test:database` suites are
  therefore BLOCKED, not passed. No backend permission or authentication code was changed to make
  the harness work.
- **Loading and error states were not triggered.** `LoadingState` and `ErrorState` are unchanged
  early returns; the suite exercised only the success and empty paths.
- **`Escape` closes the mobile sheet only**, because the desktop pane is not modal and has no
  open/closed state.
- **No focus trap** in the mobile sheet: Tab can leave the dialog into the page behind it. Focus is
  moved to Close on open but not restored to the originating row on close.
- **Composition band legibility at small counts.** With six specialties of one clinician each, the
  segments are inherently equal in width; the band is honest but visually uniform, and its
  categorical differentiation rests on stepped opacity plus the legend.
- **Fixture data.** All screenshots use the preview harness's synthetic fixtures or the labelled
  admin harness, and carry an on-screen banner saying so. No fixture was written to any database
  and no production data was read.
