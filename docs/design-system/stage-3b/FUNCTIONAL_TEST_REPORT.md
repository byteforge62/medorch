# Stage 3B — Functional Test Report

**Tested:** 5 November 2026, 22:20–23:02 IST  
**Server:** production build served by `next start` at `http://localhost:5274`  
**Browser:** Chrome 156.0.8078.80 (installed desktop Chrome, headless DevTools session)  
**Database:** live local PostgreSQL container (`medorch` / `medorch`)  
**Result:** 23/23 browser checks passed; TypeScript, scoped ESLint and production build passed.

## 1. Verification layers

| Layer | What it establishes |
| --- | --- |
| Source inspection | Exact endpoints, Prisma fields, authorization boundaries, state branches and interaction handlers. |
| Automated checks | TypeScript, scoped ESLint, Next.js production build. |
| Browser execution | Real authenticated sessions, real rendered DOM, real API requests, real click/selection behaviour, real alert PATCH. |
| Database-backed checks | API counts compared with PostgreSQL; final alert state and audit count restored and re-read with `psql`. |
| Visual inspection | Full-page captures at all three required viewports and state captures. |
| Simulated failure checks | Loading/empty/partial states forced through Chrome DevTools Fetch interception; explicitly not represented as live-data states. |

## 2. Exact commands and results

```text
npx tsc --noEmit
→ exit 0, no diagnostics

npx eslint src/app/dashboard/page.tsx "src/app/preview/[module]/PreviewClient.tsx" src/components/dashboard/admin --max-warnings=0
→ exit 0, no warnings

npm run build
→ exit 0
→ Next.js 16.3.6 (Turbopack)
→ 49/49 static pages generated
→ all routes compiled

npm start -- -p 5274
→ ready at http://localhost:5274

node .tmp-stage3b-browser.mjs
→ 23/23 PASS (temporary harness; removed after evidence capture)
```

Evidence logs:

- `evidence/typecheck.log` (empty output because there were no diagnostics)
- `evidence/eslint.log` (empty output because there were no findings)
- `evidence/production-build.log`
- `evidence/browser-run.log`
- `evidence/browser-checks.json`
- `evidence/unauthenticated-redirect.json`
- `evidence/database-state.txt`

## 3. Browser test matrix

All checks below were executed in the production build.

| # | Check | Result | Executed evidence |
| --- | --- | --- | --- |
| 1 | Admin dashboard access | PASS | Admin session reached `/dashboard`; “Operations control” and “Operational attention” present. |
| 2 | All requested areas rendered | PASS | Operational attention, theatre operations, surgical schedule, clinical workforce, equipment readiness, alerts and activity all present. |
| 3 | Actual API data rendered | PASS | 7 rooms, 10 schedules, 10 equipment, 4 alerts, 5 doctors, 14 users; audit total 170 during authenticated session (baseline 169 + login). |
| 4 | Theatre selection | PASS | Clicking DEMO-GEN-02 updated the selected detail to General OT 02, General Surgery, and Urgent Abdominal Procedure. |
| 5 | Schedule scope filter | PASS | “All open” exposed the Sunday 8 Nov case beyond the seven-day window. |
| 6 | Schedule selection | PASS | Selecting Cardiac Assessment showed `DELAYED`, Dr. Meera Joshi and the full-record link. |
| 7 | Equipment filter | PASS | “Attention” reduced the visible register to the overdue Defibrillator Unit. |
| 8 | Navigation destinations | PASS | Rendered `/schedules`, `/equipment`, `/ot-rooms`, `/users` and `/alerts` links. |
| 9 | Alert navigation | PASS | The linked Appendectomy alert points to `/schedules/c50a625a-a0d6-50cc-a4e8-0e6ed6d52c45`. |
| 10 | Desktop overflow | PASS | 1440 layout scroll width = 1440; rail 68 px. |
| 11 | Loading state | PASS | API delay exposed the `aria-busy` dashboard skeleton. |
| 12 | Partial-data state | PASS | Equipment 503 produced “Partial operational picture” plus the panel error; other feeds remained. |
| 13 | Empty state | PASS | Empty API collections produced explicit theatre, schedule, equipment, attention and activity empty states. |
| 14 | Keyboard focus visibility | PASS | 8/8 Tab stops had `:focus-visible` and a 2 px outline or ring. First stop: Dashboard link. |
| 15 | Responsive 1440×900 | PASS | innerWidth 1440, scrollWidth 1440, main 1300, no horizontal overflow. |
| 16 | Responsive 1024×768 | PASS | innerWidth 1024, scrollWidth 1024, main 884, no horizontal overflow. |
| 17 | Responsive 390×844 | PASS | innerWidth 390, scrollWidth 390, main 358, no horizontal overflow. |
| 18 | Alert mutation target | PASS | Unread “Upcoming procedure” alert found. |
| 19 | Alert mark read | PASS | Existing PATCH persisted `isRead=true`; the alert disappeared from the review queue. |
| 20 | Responsive measurement set | PASS | All three viewports had equal inner and scroll widths. |
| 21 | Priority recomposition | PASS | Desktop theatre/alerts same top (621); mobile alerts top 967 precedes theatre top 1526. |
| 22 | Doctor isolation | PASS | Doctor session rendered Doctor dashboard, not Operations control; `/api/users` 403, `/api/audit` 403. |
| 23 | Doctor blocked from `/users` | PASS | Direct `/users` navigation ended at `/unauthorized` with Access denied. |

### Unauthenticated check

A separate incognito Chrome tab navigated to `/dashboard` and ended at `/login`, confirming the server-side page guard. Evidence: `evidence/unauthenticated-redirect.json`.

### Authorization details

- Doctor session:
  - `/api/users` → 403
  - `/api/audit` → 403
  - `/api/ot-rooms` → 200
  - `/api/schedules` → 200
  - `/dashboard` → Doctor workspace
  - `/users` → `/unauthorized`
- The ADMIN dashboard never rendered administrative data inside the doctor session.

## 4. Interaction detail

### Theatre selection

- Clicked the card containing `DEMO-GEN-02`.
- Detail panel changed to `DEMO-GEN-02 · General OT 02`.
- Department showed General Surgery; Capacity 8; Booked today 0m; Next case 14:30 Urgent Abdominal Procedure.
- A screenshot was captured: `admin-theatre-selection-1440.png`.

### Schedule selection

- Changed scope to All open.
- Selected Cardiac Assessment in the 6 Nov row.
- Detail panel showed `DELAYED`, `Urgent`, 15:30–17:00, 1h 30m, theatre DEMO-CAR-01, Cardiology, Dr. Meera Joshi, one assigned staff member and Cardiac Patient Monitor.
- Screenshot: `admin-schedule-selection-1440.png`.

### Alert action

- Target: `59ebe4b7-3d6e-5925-8e39-3d925bc0427a`, “Upcoming procedure”, INFO, unread.
- Clicked Mark read.
- API verified `isRead=true`; UI removed the alert and the unread count changed from 3 to 2.
- Screenshot: `admin-alert-marked-read-1440.png`.
- **Restoration:** after evidence capture, the alert was set back to `isRead=false`, `readAt=NULL`; final state verified with psql.

### State simulation

- Loading: every `/api/*` request was paused for 2.2 s; skeleton captured before resolution.
- Partial: only `/api/equipment` was fulfilled with HTTP 503; all other feeds stayed live.
- Empty: read collections were fulfilled with empty arrays and an empty audit page for this render only.
- These checks validate state rendering, not live seed data. They are labelled as simulated in the screenshot names and evidence.

## 5. Visual evidence

| Screenshot | Dimensions | Verified content |
| --- | --- | --- |
| `admin-dashboard-1440.png` | 1440×2863 | Full live dashboard |
| `admin-dashboard-1024.png` | 1024×4809 | Full tablet composition |
| `admin-dashboard-390.png` | 390×6165 | Full mobile composition |
| `admin-theatre-selection-1440.png` | 1440×2857 | Room selection state |
| `admin-schedule-selection-1440.png` | 1440×2857 | Case selection state |
| `admin-alert-marked-read-1440.png` | 1440×2863 | Alert action state |
| `admin-state-loading-1440.png` | 1440×900 | Loading skeleton |
| `admin-state-partial-1440.png` | 1440×2860 | Partial feed failure |
| `admin-state-empty-1440.png` | 1440×1515 | Empty data states |
| `doctor-dashboard-1440.png` | 1440×1132 | Doctor workspace isolation |
| `doctor-unauthorized-users-1440.png` | 1440×900 | Unauthorized route |

All screenshots were captured from the production build in installed Chrome, not from the design-system static pages or the dev preview harness.

## 6. Database verification and cleanup

Baseline captured before implementation (`16:05:09Z`): 7 rooms, 10 schedules, 10 equipment, 4 alerts, 5 doctors, 14 users, 4 departments, 169 audit rows.

Final state after test cleanup (`23:02:37 +05:30`):

| Record | Count |
| --- | ---: |
| OTRoom | 7 |
| Schedule | 10 |
| Equipment | 10 |
| Alert | 4 |
| DoctorProfile | 5 |
| User | 14 |
| Department | 4 |
| AuditLog | 169 |

- Audit rows generated by the verification logins and alert actions were removed after each evidence iteration; the final cleanup removed the last 3 rows and restored the audit count to 169.
- The test alert is unread again with no `readAt`.
- No clinical record, room, schedule, equipment, doctor, user, department or alert content was otherwise modified.
- No migration, seed or destructive schema command was run.

## 7. Pass/fail accounting

- Browser assertions: **23/23 passed**.
- Unauthenticated redirect: **passed**.
- TypeScript: **passed**.
- Scoped ESLint: **passed**.
- Production build: **passed**.
- Database restoration: **passed** (169 audit rows, 3 unread alerts, target alert unread).
- No failed check remains.

## 8. Unverified or not applicable

| Item | Status / reason |
| --- | --- |
| Live CRITICAL alert rendering | Not observed; seeded alerts are INFO/WARNING only. Code handles CRITICAL. |
| Live same-room conflict | Not observed; seeded schedules do not overlap. Conflict logic present but not exercised by seed data. |
| Real empty/error database | Not produced against the live DB; states were simulated at the network layer. |
| Staff/equipment assignment beyond 14 days | Not exercised; details are intentionally fetched only for current and near-term cases, and all seeded cases are inside that horizon. |
| Screen-reader pass | Not run; keyboard/focus pass only. |
| Turnover / utilisation / availability | Not tracked in the domain, therefore not implemented or tested. |
| Alert dismiss | No existing capability; not implemented. |
| Cross-browser visual parity | Chrome only. Firefox/Safari not tested. |
| Deployed hosting | Not deployed; local production build only. |
