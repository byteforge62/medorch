# MedOrch — Adaptive Redesign Report

**Direction:** "Anatomical Press" — the operating theatre drawn as a printed technical atlas.
**Passes:** adaptive design foundation → Patient Registry → operational modules.
**Labels:** **VERIFIED** (executed and observed), **FAILED** (executed and failed), **BLOCKED** (cannot execute here), **NOT VERIFIED** (no evidence yet).

---

## 1. Adaptive theme implementation

Two environments, **one** component tree. Nothing in `src` names a colour; `@theme inline` bridges every utility to a variable that `[data-workspace='operations']` re-points, so rail, command bar, sheets, tables, badges and charts flip together.

| | Clinical | Operations |
| --- | --- | --- |
| Ground | `#F2EDE4` paper | `#12100E` graphite |
| Sheet | `#FAF7F1` | `#191614` |
| Type | `#14120F` ink | `#F2EDE4` chalk |
| Rule | `#CFC7B8` | `#332E28` |
| Working colour | `#123A31` pine | `#7FBFA6` mint |
| Signal | `#B8402A` | `#E57A62` |

Eleven aliases that held literal hex were centralised, and `--color-rail` was split off `--ink` — otherwise the instrument spine would have turned white in the dark environment. Grain, scrollbar thumbs, selection and `color-scheme` are scoped with it.

**Theme selection by workflow** (`src/lib/design/workspace.ts`): `/ot-rooms`, `/equipment`, `/schedules*` and `/dashboard` for ADMIN/OT_STAFF are operations; records, directories, departments, administration, auth and the patient portal are clinical. Applied by the shell, so no role can land in the wrong environment by navigation.

---

## 2. Operational modules — composition changes

Each was a **card grid** before. None is now.

**OT Room Management — theatre board.**
Was: 3-up identical cards, each repeating Department / Capacity / a full-width status select.
Now: a single-ruled board, one row per theatre — code in mono, name in serif-scale, then a metadata line (department · capacity · operational state), with the status control and actions trailing on the right. A 3px rail on the leading edge carries the state colour (in use vermilion, available mint, maintenance amber, other rule), so the board scans by colour at a glance; deactivated theatres dim and carry a `deactivated` flag rather than a second "OFFLINE" label. Everything stays admin-editable inline.

**Equipment Management — inventory register.**
Was: 3-up cards with a `dl` of three label/value rows.
Now: a dense register table — item, category, serial (mono), location, **readiness**, state, manage. Readiness is derived from the maintenance date the record already carries: `overdue 3d` in danger, `due in 9d` in warning, `due in 46d` in secondary, `no date` when absent, with the real date printed beneath. Search collapses from a card into a hairline strip with an inline field and a compact mono state filter.

**Schedule Management — calendar-first.**
The calendar is now the default view (`viewMode` initial state `calendar`), so the surface opens on the timeline rather than a table; List remains one click away. The result count is set in mono tabular figures alongside it. The status distribution, filters, list/calendar toggle, form modal, validation, permission checks and API contracts are untouched.

**Alert Center — severity-led rows.**
Was: unread used a left border only, so read and unread Critical looked the same; the category sat as a stray label at the top.
Now: every row carries a severity rail (danger / warning / info) in both states, unread adds a tinted ground plus a mint unread tick, and category + timestamp are grouped into one mono meta line. Severity is legible before the message, without turning the panel red.

**Unchanged by design:** Patient Registry (previous pass) and the `/doctors` + `/ot-rooms` fabricated-board fixes.

**Not yet art-directed:** Doctor Directory, Departments, Users, Audit. They are correct in both environments but still use the shared card/table vocabulary. No claim is made otherwise.

---

## 3. Files changed in this pass

| File | Change |
| --- | --- |
| `src/app/ot-rooms/OtRoomManagement.tsx` | card grid → theatre board rows with state rail; `theatreTone` helper; duplicate offline label fixed; dead `Badge` import removed |
| `src/app/equipment/EquipmentManagement.tsx` | card grid → inventory register table; `readinessFor` helper derived from `maintenanceDueAt`; search card → hairline strip; dead `Badge` import removed |
| `src/components/schedules/SchedulePage.tsx` | calendar becomes the default view; count set in mono tabular figures |
| `src/components/alerts/AlertCenter.tsx` | severity rail in both read states, unread tick, grouped mono category + timestamp |
| `src/app/design-preview/page.tsx` | temporary labelled fixture — **deleted** after capture |

Preserved throughout: every API contract, Prisma model, guard, CRUD path, `handleStatusChange` / `handleActiveChange` / `handleDeleteAlert` / `handleMarkAsRead` behaviour, schedule validation and conflict logic, and equipment assignment rules. No database write of any kind.

---

## 4. Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | **VERIFIED** — 0 errors |
| `npm run lint` | **VERIFIED** — 0 errors, 20 warnings (baseline restored; two dead imports introduced by the rewrites were removed) |
| `npm run test:accessibility` | **VERIFIED** — 5 pass, 0 fail |
| `npm run test:permissions` | **VERIFIED** — 5 pass, 0 fail |
| `npx next build` | **VERIFIED** — compiled successfully, 8.4s |
| `test:database`, `test:runtime`, `test:me-read-handlers` | **NOT RUN** — require PostgreSQL |

**Browser validation:** horizontal overflow `scrollWidth === clientWidth` with no offending elements at 390; rows collapse from the desktop multi-column form into stacked blocks without clipping the rail or the trailing controls.

---

## 5. Screenshots

| File | Viewport | Shows |
| --- | --- | --- |
| `screenshots/medorch-ops-theatres-1440.png` | 1440×1000 | theatre board + inventory register in the operations environment |
| `screenshots/medorch-ops-modules-390.png` | 390×900 | same board, 390px, stacked rows, no overflow |
| `screenshots/medorch-preview-clinical-1440.png` | 1440×1000 | clinical index (previous pass) |
| `screenshots/medorch-preview-ops-1440.png` | 1440×560 | operations theatre cards (previous pass) |
| `screenshots/medorch-preview-mobile-390-v2.png` | 390×844 | clinical at 390 after the register-bar fix |
| `screenshots/medorch-preview-mobile-390.png` | 390×844 | defect capture, kept as the before image |

Fixture data is synthetic and labelled `PREVIEW DATA — SYNTHETIC, NOT A RECORD` on the surface itself. The route was deleted after capture.

**Defects found by this step, and fixed:** the register bar crushed its input at 390px (previous pass); the theatre board printed `OFFLINE` twice when a theatre was both out of service and deactivated.

**Limitations:** the browser surface intermittently lost its capture target mid-load and required a retry. Full-page capture does not complete, so tall pages are captured by viewport. 768px and 1920px were **NOT VERIFIED**.

---

## 6. Remaining blockers

1. **No database** — PostgreSQL unreachable, Docker daemon down. No authenticated route could be exercised, so every module is **BLOCKED** for runtime verification; the compositions were verified through isolated fixtures instead. Nothing was written to the database to work around this.
2. **Four modules remain token-inherited**: Doctor Directory, Departments, Users, Audit.
3. `/admin` still duplicates the control room and holds the last raw hex values in the codebase.
4. `src/components/landing/LandingHero.tsx` remains orphaned.
5. 20 pre-existing lint warnings.

## Next stage

1. Art-direct Doctor Directory (availability-led) and Audit (chronological stream).
2. Reconcile `/admin` with `/dashboard`; delete `LandingHero.tsx`.
3. With a database: capture every authenticated route at 1920/1440/1366/768/390/360 in both environments, and run the database, runtime and handler suites.
