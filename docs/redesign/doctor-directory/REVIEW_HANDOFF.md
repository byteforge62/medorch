# Doctor Directory — Final Review Handoff

Status: **provisionally accepted**. This document is an index for independent review. It makes no
code or design changes and asserts nothing that was not observed. Everything below points at
artifacts in this directory or at unmodified files in the repository.

Reviewer entry points:

| Question | Read |
| --- | --- |
| What was built and why | `IMPLEMENTATION_REPORT.md` |
| Exactly what was executed | `FUNCTIONAL_TEST_REPORT.md`, §4 here |
| What the result looks like | `VISUAL_REVIEW.md`, §3 here |
| Exactly what changed in the tree | `CHANGE_MANIFEST.md`, §5 here |
| What is verified vs unverified | §7 here |

Pinned inputs (SHA-256 of the working-tree files reviewed):

```
0d25bbc8d6732d05ddce86157886ff0940b90ec1e83b52b9c40a894125d237be  src/app/doctors/DoctorDirectory.tsx  (1283 lines)
ee2c97d51300d3f977d3e0f991d809cfccf5073664033c669263120c5b645c9d  src/app/globals.css                  (803 lines)
c3dd6ff17a5aff384102199a08eb52865153160c6e8f875433c3109ed2671b4f  src/app/doctors/page.tsx             (unchanged semantics; quote-style only, pre-existing)
```

---

## 1. Evidence package

All under `docs/redesign/doctor-directory/`.

| File | Contents | Rests on |
| --- | --- | --- |
| `REVIEW_HANDOFF.md` | this document | — |
| `IMPLEMENTATION_REPORT.md` | information architecture, component/state map, Mermaid data flow, interaction rules, design-system adherence, responsive compositions, accessibility notes, preserved contracts, 10-point acceptance gate | source reading |
| `FUNCTIONAL_TEST_REPORT.md` | executed interaction matrix, harness description and limits, BLOCKED rows, engineering-check table | execution |
| `VISUAL_REVIEW.md` | screenshot inventory (viewport/route/state/authenticity), before→after analysis, defects found and fixed, limitations | captures |
| `CHANGE_MANIFEST.md` | files changed, files deliberately untouched, deleted temp files, dependency status, verification table | git + build |
| `screenshots/` | 14 PNGs, listed in §3 | Chromium |
| `evidence/browser-interactions.json` | 17 results with `feature/surface/action/expected/before/after/status`, `generatedAt`, `baseUrl` | execution |
| `evidence/browser-interactions.txt` | the same run as a human-readable log | execution |
| `evidence/component.diff.txt` | full worktree diff of the production component (1352 lines) | git |
| `evidence/globals-css-phase2.diff.txt` | the only CSS change belonging to this phase (31 added lines) | git |
| `evidence/globals-css.full.diff.txt` | full `globals.css` worktree diff (947 lines), for transparency — includes unrelated earlier-phase changes | git |
| `evidence/keyframes-context.txt` | `globals.css` lines 745–785 for local context | git |
| `evidence/typecheck.txt` | `npx tsc --noEmit` output + exit code | execution |
| `evidence/lint.txt` | `npm run lint` output + exit code | execution |
| `evidence/build.txt` | `npm run build` output + exit code | execution |
| `evidence/accessibility.txt` | `npm run test:accessibility` TAP output + exit code | execution |
| `evidence/permissions.txt` | `npm run test:permissions` TAP output + exit code | execution |
| `evidence/runtime.txt` | `npm run test:runtime` failure, kept as evidence of the BLOCKED state | execution |

Nothing in this package was regenerated for the handoff; the logs are the run artifacts.

## 2. What this phase changed, in one paragraph

`src/app/doctors/DoctorDirectory.tsx` was recomposed from four statistic cards + a search/status card
+ a six-column table into a masthead with an approval ledger, a proportional specialty composition
band with an interactive legend, and a three-region discovery workspace (specialty rail, numbered
clinician index, contextual profile) that becomes a bottom sheet below `lg`. Plus 31 lines of
scoped keyframe CSS in `src/app/globals.css`. Every request shape, handler, permission check and
error path is unchanged; no API, service, repository, Prisma, auth or permission file was touched.

## 3. Screenshots (actual captures)

Captured with Playwright/Chromium at device scale factor 1. Full-page unless noted, so the height
varies while the width is the real viewport width. Click any file name to open it.

| File | Viewport | Route | State | Authenticity |
| --- | --- | --- | --- | --- |
| [00-before-1440.png](screenshots/00-before-1440.png) | 1440×900 | `/preview/doctors-before` (temp route, removed) | Before state: stat cards + search card + six-column table | Real HEAD source rendered over preview fixtures |
| [01-desktop-default-1440.png](screenshots/01-desktop-default-1440.png) | 1440×900 | `/preview/doctors` | Default, no selection, no session | Real component + fixtures |
| [02-desktop-overview-1440.png](screenshots/02-desktop-overview-1440.png) | 1300×266 region crop of the 1440 viewport | `/preview/doctors` | Masthead + ledger + composition band | Same page as 01 |
| [03-desktop-search-1440.png](screenshots/03-desktop-search-1440.png) | 1440×900 | `/preview/doctors` | Search `Vaz` → 1 row | Executed interaction |
| [04-desktop-specialty-filter-1440.png](screenshots/04-desktop-specialty-filter-1440.png) | 1440×900 | `/preview/doctors` | Specialty *Adult cardiac surgery* active | Executed interaction |
| [05-desktop-selected-1440.png](screenshots/05-desktop-selected-1440.png) | 1440×900 | `/preview/doctors` | Kabir Nair selected | Executed interaction |
| [06-desktop-admin-approve-1440.png](screenshots/06-desktop-admin-approve-1440.png) | 1440×900 | `/preview/doctors-admin` (temp harness, removed) | Ivan Petrov approved; ledger Awaiting 0 | **Synthetic** ADMIN session + stubbed transport, banner on screen |
| [07-desktop-admin-edit-panel-1440.png](screenshots/07-desktop-admin-edit-panel-1440.png) | 1440×900 | `/preview/doctors-admin` | Edit panel open and prefilled, unsaved | **Synthetic** (as above) |
| [08-laptop-default-1024.png](screenshots/08-laptop-default-1024.png) | 1024×768 | `/preview/doctors` | Default three-column workspace at `lg` | Real component + fixtures |
| [09-mobile-default-390.png](screenshots/09-mobile-default-390.png) | 390×844 | `/preview/doctors` | Default mobile composition, no sheet | Real component + fixtures |
| [10-mobile-sheet-390.png](screenshots/10-mobile-sheet-390.png) | 390×844 (viewport only) | `/preview/doctors` | Bottom sheet open, focus on Close | Executed interaction |
| [11-desktop-readonly-1440.png](screenshots/11-desktop-readonly-1440.png) | 1440×900 | `/preview/doctors` | Read-only notice, no governance controls | Real component, no session |
| [12-desktop-admin-after-actions-1440.png](screenshots/12-desktop-admin-after-actions-1440.png) | 1440×900 | `/preview/doctors-admin` | After approve + suspend + edit + create: 5 rows, edited specialty | **Synthetic** (as above) |
| [13-desktop-admin-suspend-1440.png](screenshots/13-desktop-admin-suspend-1440.png) | 1440×900 | `/preview/doctors-admin` | Ivan Petrov suspended; Restricted 2 | **Synthetic** (as above) |

Coverage required by the brief: default (01, 08, 09), filtered (03, 04), selected profile (05, 10),
admin states (06, 07, 12, 13), plus before (00) and read-only (11).

Environmental overlays present in some images and **not** part of the design: the Next.js dev "N"
badge, and the preview/harness banner. No capture was retouched or composited.

## 4. The 17 browser assertions and their logs

Source of truth: `evidence/browser-interactions.json` (17 records, `passed: 17, total: 17`,
`generatedAt 2026-11-03T06:57:22.475Z`, `baseUrl http://localhost:3100`). Human-readable run:
`evidence/browser-interactions.txt`.

Surface legend — **P** = real component on `/preview/doctors` with the project's preview fixtures
and no session; **H** = temporary harness `/preview/doctors-admin` with a synthetic ADMIN session
and an in-memory transport stub. Harness routes were deleted after the run; assertions #12–#16 are
reviewable from these logs and screenshots, not re-runnable from the current tree.

| # | Surface | Feature | Action | Expected | Observed |
| --- | --- | --- | --- | --- | --- |
| 1 | P | Render + ledger | Load at 1440×900 | four figures; read-only notice; no governance controls | `ledger={Profiles:6, Approved:4, Awaiting review:1, Restricted:1}, readOnlyNotice=true, governanceBlocks=0` |
| 2 | P | Search | type `Vaz` | index and profile narrow to one | `1 row: 01 Dr. Meera Vaz …, profile="Dr. Meera Vaz"` |
| 3 | P | Empty state + reset | search no-match, press **Clear filters** | empty state; reset restores rows and clears field | `0 rows, emptyState=true` → `6 rows, searchField=""` |
| 4 | P | Specialty filter | press *Adult cardiac surgery* | only that specialty; `aria-pressed=true`; profile follows | `6 rows` → `1 row: 01 Dr. Meera Vaz`, `aria-pressed=true` |
| 5 | P | Status filter | select `Suspended` | only suspended | `1 row: 01 Dr. Hana Ito` |
| 6 | P | Selection | click Kabir Nair row | row selected; profile shows that clinician | `aria-pressed=true, profile="Dr. Kabir Nair"` |
| 7 | P | Keyboard | Tab from search, focus Meera Vaz row, Enter | focus reaches status control; Enter selects | `focused after Tab = doctor-status`, `profile="Dr. Meera Vaz"` |
| 8 | P | Sheet open/close | open, **Close**, reopen, `Escape` | focus on Close; both dismiss | `opened=true (Profile for Dr. Ivan Petrov), focus="Close", afterClose=0, reopened=true, afterEscape=0` |
| 9 | P | Overflow @1440 | `scrollWidth − clientWidth` | none | `0px` |
| 10 | P | Overflow @1024 | same | none | `0px` |
| 11 | P | Overflow @390 | same | none | `0px` |
| 12 | H | Session resolution | read the resolved session | ADMIN ⇒ governance + edit visible, notice absent | `session.role=ADMIN, governanceRegion=1, editButton=1, readOnlyNotice=0` |
| 13 | H | Approval (stubbed) | select Ivan Petrov, **Approve** | `PATCH /api/doctors/doc-2/status {ACTIVE}`, chip and ledger move | `calls=[{PATCH, /api/doctors/doc-2/status, {status:"ACTIVE"}}]`, `ledger 4/2/1/1 → 4/3/0/1`, row `Pending` → `Active` |
| 14 | H | Suspension (stubbed) | **Suspend** | `PATCH ... {SUSPENDED}`, Restricted updates | `calls=[{PATCH, /api/doctors/doc-2/status, {status:"SUSPENDED"}}]`, `ledger → 4/2/0/2`, row → `Suspended` |
| 15 | H | Edit (stubbed) | open edit, change 3 fields, **Save changes** | prefilled; `PATCH /api/doctors/doc-1` carries values; index updates; panel closes | `prefilled={dept-1, Hepatobiliary surgery, MCI-88214}`; `calls=[{PATCH, /api/doctors/doc-1, {departmentId:"dept-2", specialization:"Hepatobiliary oncology", licenseNumber:"MCI-99001"}}]`; row updated; `panelClosed=true` |
| 16 | H | Create (stubbed) | pick eligible account, fill, submit | `POST /api/doctors` with account + fields; new row | `calls=[{POST, /api/doctors, {userId:"usr-8", departmentId:"dept-2", specialization:"Paediatric surgery", licenseNumber:"MCI-77001"}}]`, `Leena rows=1, index rows=5` |
| 17 | P+H | Console/network health | collect across every page above | no errors or failed requests | `console=[], network=[]` |

What #13–#16 establish, precisely: the component issues the correct HTTP request with the correct
path and body, and applies the correct UI transition to the response it receives. They do **not**
establish that any write reached a database, that an audit record exists, or that the server would
authorize the request. See §7.

How the suite was prepared (for reviewers reproducing it): Next dev on port 3100
(`npx next dev -p 3100`); Playwright was not a project dependency, so the CJS scripts were run with
`NODE_PATH="$LOCALAPPDATA/npm-cache/_npx/e41f203b7505f1fb/node_modules"`. The temp scripts and
harness routes were removed as required by the phase rules; they are described in
`CHANGE_MANIFEST.md` §3.

## 5. Production component and its CSS diff

### 5.1 Component

`src/app/doctors/DoctorDirectory.tsx` — 1283 lines (HEAD: 929). Worktree diff size `+787 / −433`
(`evidence/component.diff.txt`, 1352 lines). SHA-256 in the header of this document.

Structure map (line numbers in the reviewed file):

| Region | Lines |
| --- | --- |
| imports, types, helpers, `statusMeta` vocabulary | 1–88 |
| component state (`selectedDoctorId`, filters, forms) | 90–117 |
| Escape-to-close effect | 119–129 |
| read fetch (`GET /api/doctors`) | 131–160 |
| admin fetch (`/api/users`, `/api/departments`) | 163–197 |
| `filteredDoctors` (search/status/specialty predicate) | 210–242 |
| `counts` (approval ledger, derived) | 244–258 |
| `handleStatusChange` (`PATCH …/status`) | 260–296 |
| `handleCreateDoctor` (`POST /api/doctors`) | 298–372 |
| `handleUpdateDoctor` (`PATCH /api/doctors/:id`) | 374–424 |
| `specialtyGroups` (composition + rail) | 426–457 |
| `activeDoctor` (explicit selection, else first filtered) | 459–470 |
| `isAdmin` gate | 472 |
| `BAND_TONES`, `statusMeta` presentation tables | 474–518 |
| `resetFilters` | 520–524 |
| `renderProfile` (record, completeness, governance, edit) | 526–706 |
| masthead + approval ledger | 709–735 |
| specialty composition band + legend | 737–780 |
| create panel | 823–935 |
| edit panel | 938–1049 |
| workspace grid | 1051–1219 |
| index `ul[aria-label="Clinician index"]` | 1147–1219 |
| aside `[aria-label="Clinician profile"]` | 1221–1256 |
| mobile sheet `role="dialog"` | 1258–1278 |

### 5.2 CSS

The only CSS change belonging to this phase is the 31-line block at `src/app/globals.css:751–781`
(`evidence/globals-css-phase2.diff.txt`; context in `evidence/keyframes-context.txt`):

```css
/* Workforce atlas — scoped motion for the clinician profile surface */
@keyframes workforce-panel-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}

@keyframes workforce-sheet-in {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
}

.workforce-panel-enter {
  animation: workforce-panel-in 220ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.workforce-sheet-enter {
  animation: workforce-sheet-in 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

Inserted immediately before the pre-existing global `@media (prefers-reduced-motion: reduce)` block,
which collapses those durations; no token, colour or font declaration was changed.

**Important for reviewers:** `git diff -- src/app/globals.css` is 947 lines because the file also
carries unrelated changes from earlier redesign phases. Only the block above is attributable to this
phase — `evidence/globals-css.full.diff.txt` is included so that claim can be checked rather than
trusted.

## 6. Exact commands and outputs

Run on the final working tree, in `C:\Users\patel\Desktop\medorch`, Windows / Git Bash.

| # | Command | Exit | Output summary | Full output |
| --- | --- | --- | --- | --- |
| 1 | `npx tsc --noEmit` | **0** | no diagnostics | `evidence/typecheck.txt` |
| 2 | `npm run lint` | **0** | `✖ 20 problems (0 errors, 20 warnings)` — 19 pre-existing in unrelated files, plus **1 new warning inside this component** (see below) | `evidence/lint.txt` |
| 3 | `npm run build` | **0** | Next.js 16.3.6 (Turbopack); `ƒ /doctors` present in the route table; `○ (Static)` / `ƒ (Dynamic)` legend printed | `evidence/build.txt` |
| 4 | `npm run test:accessibility` | **0** | `# tests 5 / # pass 5 / # fail 0` | `evidence/accessibility.txt` |
| 5 | `npm run test:permissions` | **0** | `# tests 5 / # pass 5 / # fail 0` | `evidence/permissions.txt` |
| 6 | `npm run test:runtime` | **1** | **BLOCKED**: `TypeError: Invalid URL` in `tests/runtime-authorization.test.ts:33` because `DATABASE_URL` is unset | `evidence/runtime.txt` |

Recorded excerpts:

```
$ npx tsc --noEmit
exit=0

$ npm run lint
✖ 20 problems (0 errors, 20 warnings)
exit=0

$ npm run build
▲ Next.js 16.3.6 (Turbopack)
✓ Compiled successfully in 5.6s
├ ƒ /doctors
└ ○ /verify-email
build exit=0

$ npm run test:accessibility
# tests 5
# pass 5
# fail 0
accessibility exit=0
```

**One warning belongs to this component and is new:** `DoctorDirectory.tsx:65:10 'formatStatus' is
defined but never used`. The helper predates this phase and was still called three times at HEAD;
the redesign expresses status vocabulary through the `statusMeta` table instead, which left the
helper unreferenced. It is dead code only — it has no runtime effect — and it was deliberately left
untouched because the handoff must not change production code. The remaining 19 warnings are in
`MyAppointments.tsx`, `DepartmentManagement.tsx`, `EquipmentManagement.tsx` and other unrelated
files, and are pre-existing.

Sequencing note for anyone re-running: after the temporary routes were deleted, `.next/types`
still referenced them and `tsc` failed with two `TS2307` errors; `next build` regenerated the route
types and the next `tsc` run exited 0. `evidence/typecheck.txt` is the clean run.

Commands **not** run, and why: `npm run test:database` (needs PostgreSQL), `npm run test:runtime`
(ran, failed at environment setup, see above), `npm run dev` (`predev` runs `prisma db seed`, which
needs a database). No destructive command was executed; no commit, reset, stash or branch change was
made.

## 7. Verified frontend behaviour vs unverified backend behaviour

### 7.1 Verified (executed, observed)

| Behaviour | How it was observed |
| --- | --- |
| Read-only rendering, ledger figures, composition band, three-region layout at 1440 px | page load + DOM read (#1) |
| Search, no-match empty state, filter reset | #2, #3 |
| Specialty and status filtering, `aria-pressed` state | #4, #5 |
| Explicit selection driving the profile pane | #6 |
| Keyboard order and Enter activation on a focused row | #7 |
| Mobile sheet: opens, focus lands on Close, closes via Close and via Escape | #8 |
| No horizontal overflow at 1440 / 1024 / 390 | #9–#11 |
| Read-only notice when no ADMIN session resolves | #1, screenshot 11 |
| Governance + edit controls render when the session resolves as ADMIN | #12 (harness) |
| Frontend sends the correct request path and body for approve, suspend, edit, create | #13–#16 (harness) |
| Frontend applies the correct chip/ledger/row transitions to a success response | #13–#16 (harness) |
| No console errors, page errors, failed requests or ≥400 responses during the run | #17 |
| TypeScript, lint, production build, accessibility and permission suites pass on the final tree | §6 |

### 7.2 Unverified (explicitly not established)

| Item | Why it is not verified |
| --- | --- |
| **Persistence of approve / suspend / edit / create** | transport was stubbed in memory; nothing was written anywhere. Screenshots 06/07/12/13 show UI state produced by the component, not stored records. |
| **Audit records for governance actions** | no database, so no audit row was created or read. |
| **Server-side authorization on mutations** (`authorizeApiPermission('doctors:manage')`) | not exercised; the harness stubs run in the browser and never reach a server. No claim that non-admins receive 403. |
| **Signed-out redirect for `/doctors`** | the preview route does not invoke `requirePermission`; the real sign-in → session → redirect flow was not run. |
| **Server-side 401/403 behaviour generally** | blocked; `npm run test:runtime` fails at setup on missing `DATABASE_URL`. |
| **Duplicate-licence / duplicate-account validation from the API** | validation code untouched but never executed against a server. |
| **Real data shapes and empty-database edge cases** | only the project's preview fixtures were rendered. |
| **Loading and error states of the component** | unchanged early returns; not triggered. |
| **`npm run test:database`** | needs PostgreSQL. |

Nothing in this package should be read as "the write succeeded". The correct summary is: *the
component prepares and sends the documented requests, and updates itself correctly when they
succeed; whether the backend accepts, authorizes, persists and audits them remains untested here.*

### 7.3 Reproduction gaps a reviewer should know about

- The two temporary preview routes (`/preview/doctors-admin`, `/preview/doctors-before`) and the
  Playwright scripts were deleted after capture, as the phase rules required. Assertions #12–#16 and
  screenshot 00 therefore cannot be re-executed from the current tree; they are evidenced by the
  logs and images.
- There is no PostgreSQL instance in this environment, so no reviewer-side re-run of the backend
  paths is possible without provisioning one.
- The dev overlay badge and harness banner in the screenshots are environment chrome.

## 8. Repository state at handoff

- Nothing committed, staged, stashed, pushed, reset, or branched.
- Files whose content belongs to this phase: `src/app/doctors/DoctorDirectory.tsx`,
  `src/app/globals.css` (31 lines), and this documentation set.
- `src/app/doctors/page.tsx` appears modified in `git status` from an earlier quote-style
  reformatting; its `requirePermission('doctors:read')` and `AppShell` usage are unchanged.
- `src/app/api/doctors/**`, `src/modules/doctors/**`, `prisma/**`, `src/lib/auth/**`, `middleware`,
  `package.json` and the lockfile are untouched.
- Other modules (dashboard, patients, OT rooms, equipment, schedules, audit, users) are untouched.
- No dependency was added; Playwright was used from a transient npx cache, not installed into the
  project.
