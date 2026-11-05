# Stage 3A — Change Manifest

No commit, push, reset, stash, clean or discard was performed. The working tree remains uncommitted.

## Source changes

Both source files are new. No existing Dashboard, landing, auth, API, service, repository, Prisma or shared design-token file was modified.

| File | Change |
| --- | --- |
| `src/app/alerts/page.tsx` | New server route. Requires `alerts:read`, renders `AppShell` and `AlertsWorkspace`. |
| `src/app/alerts/AlertsWorkspace.tsx` | New client workspace. Loads `/api/alerts`, renders All/Unread views, and calls the existing mark-read, mark-all-read and delete endpoints. |

No new dependency, token, image, font or route handler was added.

## Documentation added

| Path | Purpose |
| --- | --- |
| `docs/design-system/stage-3a/IMPLEMENTATION_REPORT.md` | Implementation, design and verification summary |
| `docs/design-system/stage-3a/ROUTE_TRACE.md` | Complete `/alerts` trace and root cause |
| `docs/design-system/stage-3a/AUTHORIZATION_TESTS.md` | Role matrix, API/page enforcement and results |
| `docs/design-system/stage-3a/MUTATION_VERIFICATION.md` | Disposable-record mutation, authorization, failure and cleanup evidence |
| `docs/design-system/stage-3a/CHANGE_MANIFEST.md` | This manifest |

## Screenshots added

`docs/design-system/stage-3a/screenshots/`

| File | State |
| --- | --- |
| `alerts-admin-1440.png` | Admin register, four real alerts |
| `alerts-admin-full-1440.png` | Admin register, full page |
| `alerts-admin-unread-1440.png` | Unread filter, three alerts |
| `alerts-admin-1024.png` | Admin register at 1024×768 |
| `alerts-admin-390.png` | Admin register at 390×844 |
| `alerts-admin-full-390.png` | Admin register at 390, full page |
| `alerts-doctor-empty-1440.png` | Real doctor empty state |
| `alerts-ot-1440.png` | OT staff, one owned alert |
| `alerts-error-1440.png` | Error state from a simulated API 500 |
| `alerts-loading-1440.png` | Loading state from a delayed API response |
| `mutation-01-before-mark-read.png` | Four disposable alerts, all unread |
| `mutation-02-mark-read-success.png` | Single mark-read succeeded; three unread remain |
| `mutation-03-mark-all-success.png` | Zero unread; Mark all control removed |
| `mutation-04-dismiss-success.png` | Dismissed row gone; three on file |
| `mutation-05-failed-mutation.png` | Simulated 500 error; target still unread |

**15 screenshots total.**

## Evidence added

`docs/design-system/stage-3a/evidence/`

| File | Contents |
| --- | --- |
| `browser-run.log` | Final full-suite output, 48/48 checks |
| `browser-checks.json` | Checks, HTTP errors, console events, failed requests, `/alerts` RSC responses |
| `post-build-smoke.log` | Final-build checks, 8/8 |
| `post-build-smoke.json` | Final build ID and check results |
| `http-endpoints.txt` | Signed-out `/alerts`, `/api/alerts`, `/login`, `/dashboard` |
| `typecheck.txt` | `npx tsc --noEmit`, exit 0 |
| `lint.txt` | `npm run lint`, exit 0, 20 pre-existing warnings |
| `build.txt` | Production build, exit 0, `/alerts` dynamic |
| `mutations-before.json` | Disposable baseline and seeded hash |
| `mutations-after-single-read.json` | One read, three unread |
| `mutations-after-mark-all.json` | All read, zero unread |
| `mutations-after-dismiss.json` | Row removed from the register |
| `mutations-dismissed-row.json` | Direct database lookup returns null |
| `mutations-before-failure.json` | Failure target unread before simulation |
| `mutations-after-failure.json` | Failure target still unread and unchanged |
| `mutations-after-auth.json` | Owner state unchanged after three 403 responses |
| `mutations-requests.json` | Actual request/response bodies and statuses |
| `mutations-cleanup.json` | Cleanup counts and seeded hash comparison |
| `mutations-final-state.json` | Zero test records; seeded set unchanged |

## Builds verified

| Build | Purpose | Result |
| --- | --- | --- |
| `D0kniwlbkTvI_Kp8b6xn7` | Full production browser suite | 48/48 passed |
| `j_HBmc_QkUtn6fZrYyg79` | Final rebuild after the error-meta refinement; mutation verification | 8/8 passed; all mutation checks passed |

The only source change after the full suite was the error-state masthead showing “Unavailable” rather than a zero count when no records loaded. The final build re-verified that state, loading, signed-out access, prefetch, and the populated admin register.

## Database and environment

- Seeded alert count before and after testing: **4**, unchanged.
- Five disposable alerts and two disposable users were created for mutation verification. One alert was dismissed through the UI; the remaining four alerts, both users and seven test-related audit rows were removed during cleanup.
- Final test-record count: **0 users, 0 alerts**. Seeded alert hash before and after: `ed89bb4aefd0d7b04dd2f4d29d8a7b1c459d6cebe7f6083c7c171d36bd456155`.
- No seeded alert was created, edited, marked read or deleted.
- Real sign-ins during the original browser suite wrote the normal Auth.js audit entries. Mutation-test sign-ins were tied to the disposable users and removed with them.
- Docker Desktop and the existing `medorch-postgres` container were restarted because they were stopped; no reseed or migration was run.
- No credential file was changed in this stage. `.env.local` was not edited.

## Temporary artifacts removed

- `.tmp-stage3a-verify.cjs` (full browser harness)
- `.tmp-stage3a-smoke.cjs` (final-build smoke harness)
- `.tmp-stage3a-mutations/` (disposable database mutation harness and state)
- `docs/design-system/stage-3a-build.tmp.txt` (moved into evidence as `build.txt`)

Local runtime log `.prod-5274-stage3a.log` remains while the production server is running. It is not a deliverable.

## Explicitly unchanged

- `src/app/dashboard/page.tsx` and all Dashboard components
- `src/components/dashboard/HospitalIntelligence.tsx` (its `/alerts` links now resolve; the code is untouched)
- `src/components/alerts/AlertCenter.tsx`
- `src/components/layout/Header.tsx` and `Sidebar.tsx`
- `src/app/page.tsx` and all landing components
- `src/auth.ts`, `src/lib/auth/*`, API authorization helpers and permissions
- `src/app/api/alerts/**`
- `src/modules/alerts/**`
- `prisma/schema.prisma`, migrations, seed data
- `src/app/globals.css` and shared design tokens
- dependencies and lockfile

## Working tree

The repository already contained uncommitted Stage 1, Stage 2 and design-system work before this stage. Those changes were retained. This stage adds only `src/app/alerts/` and `docs/design-system/stage-3a/`.

No Stage 3B dashboard redesign was started.
