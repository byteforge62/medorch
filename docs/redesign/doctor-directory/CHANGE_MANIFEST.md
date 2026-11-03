# Doctor Directory — Change Manifest

Phase 2 of the MedOrch redesign. Nothing was committed, staged, stashed, pushed, or reset. No
database command was executed.

---

## 1. Source changes attributable to this phase

| File | Change | Size |
| --- | --- | --- |
| `src/app/doctors/DoctorDirectory.tsx` | Full recomposition: masthead + approval ledger, specialty composition band, three-region workforce atlas (rail / numbered index / profile), create + edit panels, mobile bottom sheet, Escape handling. All handlers, request shapes, permission checks and error handling preserved. | 929 → 1283 lines; `+787 / −433` |
| `src/app/globals.css` | Appended one scoped motion block: `@keyframes workforce-panel-in`, `@keyframes workforce-sheet-in`, `.workforce-panel-enter`, `.workforce-sheet-enter` (lines 751–781). Neutralised by the existing global `prefers-reduced-motion` rule. | +30 lines |

`globals.css` also carries unrelated modifications from earlier phases: the file shows a much larger
diff (`885` changed lines) that is **not** part of this phase. Only the four declarations above are
attributable to the Doctor Directory work.

## 2. Files deliberately NOT changed

| Area | Files | Confirmation |
| --- | --- | --- |
| Page shell / server gate | `src/app/doctors/page.tsx` | `requirePermission('doctors:read')` and `AppShell` unchanged. The file appears modified only because of an earlier quote-style reformatting (same code, no semantic change). |
| API routes | `src/app/api/doctors/route.ts`, `src/app/api/doctors/[id]/route.ts`, `src/app/api/doctors/[id]/status/route.ts` | untouched |
| Validation | `src/modules/doctors/doctor.validation.ts` | untouched |
| Service / repository | `src/modules/doctors/doctor.service.ts`, `doctor.repository.ts` | untouched |
| Prisma | `prisma/schema.prisma`, `src/generated/prisma/*` | untouched |
| API plumbing | `src/lib/api/{client,response,auth,validation,request-id}.ts` | untouched |
| Auth / authorization | `src/lib/auth/*`, middleware | untouched — no permission, session or policy change for the harness |
| Other modules | dashboard, patients, OT rooms, equipment, schedules, audit, users | untouched |
| Dependencies | `package.json`, lockfile | no package added, removed or upgraded. No Framer Motion, no new UI library. |

## 3. Temporary files created for evidence and removed afterwards

| Path | Purpose | Status |
| --- | --- | --- |
| `src/app/preview/doctors-admin/page.tsx` | Mounted the shipping component with a synthetic ADMIN session and an in-memory transport stub (`window.__ADMIN_CALLS`) so governance actions could be executed without PostgreSQL | **deleted** |
| `src/app/preview/doctors-before/page.tsx` | Rendered the HEAD component extracted with `git show HEAD:…` for the before-state capture | **deleted** |
| `src/app/preview/doctors-before/OriginalDoctorDirectory.tsx` | HEAD source copy used by the above | **deleted** |
| `.tmp-evidence.cjs` | Playwright suite that captured the screenshots and interaction log | **deleted** |
| `.tmp-probe*.cjs`, `.tmp-admin.png` | Throwaway probes used to inspect the harness DOM | **deleted** |

The pre-existing preview harness (`src/app/preview/[module]/`, `src/lib/preview/fixtures.ts`) is
project code from an earlier phase and was left as found.

After deletion, `.next` still contained route types for the two removed routes; `next build`
regenerated them, and the final `tsc` run is clean (`evidence/typecheck.txt`).

## 4. Evidence artifacts added

| Path | Contents |
| --- | --- |
| `docs/redesign/doctor-directory/IMPLEMENTATION_REPORT.md` | architecture, state/line map, data flow, interaction rules, design-system adherence, responsive compositions, accessibility, acceptance gate |
| `docs/redesign/doctor-directory/FUNCTIONAL_TEST_REPORT.md` | 17-row executed interaction matrix, authorization observations, BLOCKED rows, engineering-check results |
| `docs/redesign/doctor-directory/VISUAL_REVIEW.md` | screenshot inventory with viewport/route/state/authenticity, before→after analysis, defects found and fixed, limitations |
| `docs/redesign/doctor-directory/CHANGE_MANIFEST.md` | this file |
| `docs/redesign/doctor-directory/screenshots/` | 14 PNGs: 1 before, 9 production-surface states, 4 harness admin states |
| `docs/redesign/doctor-directory/evidence/browser-interactions.txt` / `.json` | executed checks with before/after DOM snapshots, console and network capture |
| `docs/redesign/doctor-directory/evidence/{typecheck,lint,build,accessibility,permissions,runtime}.txt` | raw command output with exit codes |

## 5. Verification of the final tree

| Command | Exit | Result |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 | clean |
| `npm run lint` | 0 | 0 errors, 20 warnings — 19 pre-existing in unrelated files, 1 introduced here (unused `formatStatus` helper at line 65, dead code, intentionally not removed during a review handoff) |
| `npm run build` | 0 | production build succeeds |
| `npm run test:accessibility` | 0 | 5/5 |
| `npm run test:permissions` | 0 | 5/5 |
| `npm run test:runtime` | 1 | BLOCKED: `DATABASE_URL` unset (`TypeError: Invalid URL`) |

## 6. Known uncommitted context

The worktree already contained many modified files from earlier redesign phases (docs, other
modules, `globals.css`). They were left untouched. This phase's own surface is the two files in §1
plus the four documents, 14 screenshots and six evidence logs listed in §4.
