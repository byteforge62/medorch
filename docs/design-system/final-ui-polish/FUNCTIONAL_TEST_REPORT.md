# Functional Test Report

## Result

The recovered UI passes the executed browser, type, lint, unit/component and production
build checks. One real responsive defect found during the first full capture was fixed
and rechecked.

- Final screenshots: **90**
- Route/viewport captures with horizontal overflow: **0**
- Broken images: **0**
- Images without an `alt` attribute: **0**
- Unexpected console errors: **0**
- Deliberate 404 network entries: **3** (one per viewport)

---

## Environment

| Item | Value |
| --- | --- |
| Repository | `C:\Users\patel\Desktop\medorch` |
| Branch | `master` |
| HEAD | `5c01eb0` |
| Application | Next.js 16.3.6, Turbopack |
| Development server | `http://localhost:5274` |
| Database | Existing local `medorch-postgres` PostgreSQL 17 container |
| Browser | Chrome headless, DevTools Protocol, exact viewport emulation |
| Viewports | 1440×900, 1024×768, 390×844 |

The local database container was stopped when the interrupted run ended. Docker
Desktop and the existing `medorch-postgres` container were started to restore the
application. No container was recreated and no volume was removed.

The project's `npm run dev` includes a `predev` step that runs `prisma db seed`
against the local development database. Starting the dev server therefore ran that
existing idempotent seed. It is normal startup behavior, not a production operation,
and no migration or destructive SQL was run. The seed log records
“MedOrch demo data seeded successfully.”

The tracked `dev-server.log` changed because the dev server was restarted with output
appended to it. It is a runtime log, not application source.

---

## Browser matrix

The capture harness is `scripts/final-ui-polish-verify.mjs`. It signs in through the
real Auth.js credentials callback using the seeded demo accounts and writes exact
viewport PNGs to `screenshots/`.

### Public / access surfaces — 27 captures

Nine routes at three widths:

- `/`
- `/login`
- `/forgot-password`
- `/register`
- `/resend-verification`
- `/reset-password`
- `/verify-email`
- `/unauthorized`
- `/route-that-does-not-exist` (deliberate 404)

The 404 route produces a genuine HTTP 404 and one console “failed to load resource”
entry per viewport. These are expected and are the only console-error entries in the
final audit.

### ADMIN — 39 captures

Thirteen routes at three widths:

- `/dashboard`
- `/schedules`
- `/departments`
- `/patients`
- `/doctors`
- `/equipment`
- `/ot-rooms`
- `/alerts`
- `/users`
- `/audit`
- `/doctors/{id}` (real seeded clinician)
- `/patients/{id}` (real seeded patient)
- `/schedules/{id}` (real seeded case)

### DOCTOR — 9 captures

Three routes at three widths:

- `/dashboard`
- `/schedules`
- `/doctors`

### OT_STAFF — 6 captures

Two routes at three widths:

- `/dashboard`
- `/ot-rooms`

### PATIENT — 9 captures

Three routes at three widths:

- `/dashboard`
- `/patients/appointments`
- `/patients/appointments/{id}`

Detail IDs were read from the authenticated APIs, not hard-coded fixture URLs.

---

## Browser checks

Every capture evaluated the live DOM after fonts settled and skeletons disappeared:

| Check | Result |
| --- | --- |
| Page has an `h1` | Pass on all captured routes |
| `documentElement.scrollWidth` exceeds `clientWidth` | 0 pages |
| Broken images (`complete && naturalWidth === 0`) | 0 |
| Images missing `alt` | 0 |
| Console `error` / `Log.entryAdded` errors | 0 unexpected |
| Role can open the captured route | Pass for all four seeded roles |

### Responsive defect found and fixed

First full run:

```text
admin schedule-record 390x844 overflow=true
```

Direct DOM inspection showed two assignment cards at 419px inside a 374px content
width. The staff card contained a `<select>` whose long option set its min-content
width. The fix was limited to:

- `min-w-0` on both assignment cards;
- `w-full min-w-0` on both staff selects.

Recheck on the same live route:

```text
clientWidth: 374
scrollWidth: 374
bodyScrollWidth: 374
offending elements: []
```

The final full run reports 0 overflow pages.

### Image loading and fallback

The recovered interface renders no raster images (`images=0` on every page). The only
visual asset is the inline SVG theatre plan on the access sheet, which has an
accessible description. Therefore:

- there were no image load failures to triage;
- there is no active raster-image fallback path to exercise;
- registered clinical WebPs are retained but inactive (see `ASSET_MANIFEST.md`).

This is a deliberate outcome, not an untested image implementation.

### Dialogs

The Department “New department” region was opened and closed at 1440×900. It was
keyboard/button reachable, exposed labelled fields, and closed without submitting or
changing data. No destructive confirmation was accepted. The equipment add form was
not submitted.

### Routes intentionally excluded from the product matrix

`/design-system/*` and `/preview/[module]` are development-only concept galleries and
module previews, not production product surfaces. `/admin` is a redirect route. They
were not counted in the 90 product screenshots. No production module or access route
is omitted.

### Role visibility

The captured navigation and routes reflect the permission matrix:

- ADMIN: all clinical modules plus Accounts and Audit.
- DOCTOR: Dashboard, Schedules, Doctors.
- OT_STAFF: Dashboard, Theatres.
- PATIENT: Dashboard, Appointments.

Authorization is enforced server-side; the browser check only confirms the rendered
navigation and permitted routes.

---

## Automated checks

All commands were executed from the repository root.

| Command | Result | Evidence |
| --- | --- | --- |
| `npx tsc --noEmit` | **PASS** (exit 0) | `evidence/typescript.log` |
| Changed-file `npx eslint --max-warnings=0 …` | **PASS** (exit 0) | `evidence/eslint.log` |
| `npm run test:permissions` | **PASS**, 5/5 | `evidence/test-permissions.log` |
| `npm run test:accessibility` | **PASS**, 5/5 | `evidence/test-accessibility.log` |
| `node --import tsx --test tests/schedule-workspace.test.ts tests/schedule-workspace-states.test.tsx` | **PASS**, 10/10 | `evidence/test-schedule-workspace.log` |
| `node --import tsx --test tests/schedule-access.test.ts` | **PASS**, 6/6 | `evidence/test-schedule-access.log` |
| `npm run test:me-read-handlers` | **PASS**, 9/9 | `evidence/test-me-read-handlers.log` |
| `npm run build` | **PASS**, 49/49 static pages | `evidence/build.log` |

Total executed unit/component checks: **35 passing**.

The changed-file ESLint command covered the modified UI files, the audit viewer, the
schedule detail page and the capture harness. `globals.css` was excluded because this
project’s ESLint configuration does not lint CSS.

---

## Production build

```text
✓ Compiled successfully in 27.8s
✓ Finished TypeScript in 55s
✓ Generating static pages using 7 workers (49/49) in 3.3s
```

The build was run after the dev server was stopped. The dev listener was confirmed
dead before the build. The build completed with exit 0.

---

## Not executed

| Check | Reason |
| --- | --- |
| `npm run test:database` | PostgreSQL-backed destructive/integration suite requiring a confirmed disposable database. Not a visual verification and not necessary to validate this UI-only change. |
| `npm run test:runtime` | Spawns a production server and provisions disposable runtime data. Not run; no result is claimed. |

No schema, API, permission or business-rule change was made, so these suites were not
required to validate the visual recovery. Their results must not be inferred from this
report.

---

## Database and side effects

- The UI checks themselves submitted no forms and created or edited no domain record.
- The existing local `predev` seed ran once successfully when the dev server was
  started. It is idempotent and local only; no migration, reset or destructive SQL was
  run and no production database was involved.
- Sign-in created the append-only login audit events that normal authentication writes.
  This is expected and does not change clinical data.
- The Department create region was opened and closed without submission.
- No production database is configured or used by this workspace.

---

## Evidence index

| File | Contents |
| --- | --- |
| `evidence/browser-audit.json` | Final 90-page audit: route, viewport, h1, width/overflow, image count, broken images, missing alt, console errors |
| `evidence/browser-audit-public.json` | Public-only pass used while adding the recovery/auth routes |
| `evidence/capture.log` | Final capture console output |
| `evidence/typescript.log` | `tsc --noEmit` |
| `evidence/eslint.log` | Changed-file ESLint |
| `evidence/test-*.log` | Five relevant test suites |
| `evidence/build.log` | Production build |
| `screenshots/` | 90 PNGs at the three required viewports |
