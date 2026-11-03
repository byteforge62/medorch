# Doctor Directory — Functional Test Report

Component: `src/app/doctors/DoctorDirectory.tsx` (final, 1283 lines).
Evidence: `evidence/browser-interactions.txt` (human-readable log) and
`evidence/browser-interactions.json` (machine-readable, includes every before/after snapshot).

Interaction tests were executed with Playwright (Chromium) against a real `next dev` server on
`http://localhost:3100`. This report contains only results that were observed. Nothing here is
inferred from source reading.

---

## 1. Summary

| Suite | Result |
| --- | --- |
| Browser interaction suite | **17 / 17 executed checks passed** |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 — 0 errors, 20 warnings (19 pre-existing in unrelated files; 1 new: unused `formatStatus` helper in this component) |
| `npm run build` | exit 0 |
| `npm run test:accessibility` | 5 / 5 pass |
| `npm run test:permissions` | 5 / 5 pass |
| `npm run test:runtime` | **BLOCKED** — requires `DATABASE_URL` (no PostgreSQL here) |
| `npm run test:database` | **BLOCKED** — requires PostgreSQL |
| Database-backed verification (persistence, audit rows, server 403s) | **BLOCKED** |

## 2. Two surfaces, and exactly what each proves

The environment has no PostgreSQL instance (`ECONNREFUSED`), so every request in this package has
its transport answered locally. That is stated per test below.

**Surface 1 — `/preview/doctors` (real read-only surface).**
The shipping `DoctorDirectory` component, mounted by the project's existing preview harness
(`src/app/preview/[module]/PreviewClient.tsx`) with the project's existing fixtures
(`src/lib/preview/fixtures.ts`). `useSession()` resolves to no session, so `isAdmin` is false —
this is the genuine non-admin rendering. No harness code was written for this surface.

**Surface 2 — temporary `/preview/doctors-admin` harness (admin states only).**
Mounted the same shipping component with a synthetic ADMIN session and a transport-level stub that
answered `/api/doctors*`, `/api/users` and `/api/departments` in memory, recording every call on
`window.__ADMIN_CALLS`. The stub also answered `/api/auth/session` with the standard next-auth v5
session payload (`{ user: { id, name, email, role, status }, expires }`) so that `useSession()`
resolved to the synthetic ADMIN identity instead of the unauthenticated server response.

That session answer is a **harness-only fix**: it changes what the browser preview sees, not how
the application authenticates. No production auth module, middleware, route handler, permission
map or Prisma access path was modified. The harness route and its stub were deleted after capture
(see `CHANGE_MANIFEST.md`), and screenshots taken on this surface carry an on-screen banner that
reads "Evidence harness · synthetic ADMIN session · stubbed transport · nothing persisted".

**What surface 2 does and does not prove.** It proves the component issues the correct request for
each governance action and applies the correct UI transition to the response. It does not prove
that the request would be persisted, audited, or authorized by the server — those remain BLOCKED.

## 3. Executed interaction matrix

All 17 rows below are executed interactions with observed before/after DOM state. A control
existing on the page was never sufficient to pass a row.

| # | Feature | Action executed | Expected | Observed (before → after) | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | Render + ledger | Load `/preview/doctors` at 1440×900 | four ledger figures; read-only notice; no governance controls without ADMIN | ledger `{Profiles:6, Approved:4, Awaiting review:1, Restricted:1}`, read-only notice present, 0 governance blocks | PASS |
| 2 | Search | type `Vaz` in `#doctor-search` | index and profile narrow to one clinician | 6 rows → 1 row (`Dr. Meera Vaz`), profile pane `Dr. Meera Vaz` | PASS |
| 3 | Empty state + reset | search `zzz-no-match`, press **Clear filters** | empty state replaces index; reset restores rows and empties field | 0 rows with empty state → 6 rows, field `""` | PASS |
| 4 | Specialty filter | press **Adult cardiac surgery** in the specialty rail | only that specialty; `aria-pressed=true`; profile follows | 6 rows → 1 row (`Meera Vaz`, Adult cardiac surgery), `aria-pressed=true` | PASS |
| 5 | Status filter | select `Suspended` in `#doctor-status` | only suspended clinicians | 6 rows → 1 row (`Dr. Hana Ito`, Suspended) | PASS |
| 6 | Clinician selection | click the Kabir Nair row | row marked selected; profile shows that clinician | profile `Dr. Kabir Nair`, selected row `aria-pressed=true` | PASS |
| 7 | Keyboard | Tab from search field, focus Meera Vaz row, press Enter | focus reaches status control; Enter selects the focused row | focus after Tab = `doctor-status`; profile changes to `Dr. Meera Vaz`; row `aria-pressed=true` | PASS |
| 8 | Sheet open / Close / Escape | open profile sheet at 390×844, press **Close**, reopen, press **Escape** | dialog opens with focus on Close; both affordances dismiss it | opened (`Profile for Dr. Ivan Petrov`), focus `Close`, after Close 0 dialogs, reopened, after Escape 0 dialogs | PASS |
| 9 | Overflow @1440 | measure `scrollWidth − clientWidth` | no horizontal overflow | 0 px | PASS |
| 10 | Overflow @1024 | same | no horizontal overflow | 0 px | PASS |
| 11 | Overflow @390 | same | no horizontal overflow | 0 px | PASS |
| 12 | Session resolution (harness) | read `/api/auth/session` in the harness page | synthetic session resolves as ADMIN | `role=ADMIN`, governance region 1, Edit control 1, read-only notice 0 | PASS |
| 13 | Approval | select pending Ivan Petrov, press **Approve** | `PATCH /api/doctors/doc-2/status {status:"ACTIVE"}`; chip + ledger update | 1 PATCH with that path/body; row `Pending → Active`; ledger `Awaiting review 1→0`, `Approved 2→3` | PASS |
| 14 | Suspension | press **Suspend** | `PATCH .../status {status:"SUSPENDED"}`; chip + Restricted update | 1 PATCH with that body; row `Active → Suspended`; ledger `Restricted 1→2`, `Approved 3→2` | PASS |
| 15 | Profile editing | open edit panel on Anaya Sharma, change department/specialty/licence, **Save changes** | form prefilled; `PATCH /api/doctors/doc-1` carries new values; index updates; panel closes | prefilled `{dept-1, Hepatobiliary surgery, MCI-88214}`; 1 PATCH `{departmentId:'dept-2', specialization:'Hepatobiliary oncology', licenseNumber:'MCI-99001'}`; row updates; panel closed | PASS |
| 16 | Profile creation | open create panel, pick eligible account, fill fields, **Create profile** | `POST /api/doctors` with account + fields; new clinician appears | candidate option `Dr. Leena Mathew — leena.mathew@medorch.test`; 1 POST `{userId:'usr-8', departmentId:'dept-2', specialization:'Paediatric surgery', licenseNumber:'MCI-77001'}`; new row present; index 4 → 5 | PASS |
| 17 | Console + network health | collect console errors, page errors, failed requests, ≥400 responses on every page | none | `console=[]`, `network=[]` | PASS |

Raw log with the full `before`/`after` strings: `evidence/browser-interactions.txt`.

## 4. Authorization behaviour observed (UI boundary only)

- Row 1 proves the component hides governance controls and shows "Read-only view. Account
  governance requires administrator access." when no ADMIN session resolves.
- Row 12 proves those controls appear when an ADMIN session does resolve.
- This is the **UI gate**. The server boundary (`authorizeApiPermission('doctors:manage')` on
  `POST /api/doctors`, `PATCH /api/doctors/[id]`, `PATCH /api/doctors/[id]/status`) was not
  exercised because it needs a real session and database. No server code was altered to make these
  tests pass.

## 5. BLOCKED rows (not tested — do not read as passes)

| Item | Why blocked | What would be needed |
| --- | --- | --- |
| `GET /api/doctors` against Prisma | no PostgreSQL; `ECONNREFUSED` | running database + seeded `Doctor`/`User` rows |
| Create persistence (`POST /api/doctors`) | transport stubbed | database + ADMIN session |
| Status persistence + audit (`PATCH .../status`) | transport stubbed | database + ADMIN session |
| Edit persistence (`PATCH /api/doctors/:id`) | transport stubbed | database + ADMIN session |
| Server-side rejection for non-admin mutations (403) | no session/DB | signed-in non-admin account |
| Unauthenticated redirect for `/doctors` | preview route bypasses `requirePermission` | real sign-in flow with session cookie |
| Duplicate account / licence validation errors from API | stubbed transport | database |
| `npm run test:runtime` | fails in `beforeAll` with `TypeError: Invalid URL` because `DATABASE_URL` is unset (`tests/runtime-authorization.test.ts:33`) | `DATABASE_URL` pointing at a disposable PostgreSQL database |
| `npm run test:database` | same dependency | disposable PostgreSQL database |

Log for the runtime suite failure: `evidence/runtime.txt`.

## 6. Engineering checks (final tree)

| Command | Exit | Detail | Log |
| --- | --- | --- | --- |
| `npx tsc --noEmit` | 0 | no diagnostics | `evidence/typecheck.txt` |
| `npm run lint` | 0 | 0 errors, 20 warnings: 19 pre-existing elsewhere, 1 new (`DoctorDirectory.tsx:65` unused `formatStatus`, dead code only) | `evidence/lint.txt` |
| `npm run build` | 0 | production build succeeds | `evidence/build.txt` |
| `npm run test:accessibility` | 0 | 5 tests, 5 pass, 0 fail | `evidence/accessibility.txt` |
| `npm run test:permissions` | 0 | 5 tests, 5 pass, 0 fail | `evidence/permissions.txt` |
| `npm run test:runtime` | 1 | BLOCKED, missing `DATABASE_URL` | `evidence/runtime.txt` |

Note on sequencing: after the temporary routes were deleted, `.next/types/validator.ts` still
referenced them, so the first `tsc` run failed with two `TS2307` module-not-found errors. `next
build` regenerated the route types and the subsequent `tsc` run exited 0 — the log in
`evidence/typecheck.txt` is from that final run.

## 7. Defects found by this testing and fixed

| Defect | How it surfaced | Fix |
| --- | --- | --- |
| Mobile profile sheet visible in the desktop/portrait flow | interaction pass at 390 px | aside constrained with `hidden … lg:block`; sheet is the only mobile profile |
| Desktop three-column layout collapsed at 1024 px | viewport capture | `xl:` → `lg:` breakpoints |
| Blank monogram on the profile avatar | visual inspection at 1440 px | `text-primary-foreground` → `text-white` on the tinted square |
| Horizontal overflow on mobile (rail + long names) | measured 390 px before fix | `min-w-0` on grid children, rail `w-full` |
| Flat, colourless composition band | visual inspection | invalid `color-mix(var(--primary))` replaced with six token opacities (`BAND_TONES`) |
| "1 departments" pluralisation | 1440 px admin capture | conditional singular/plural for both nouns |
