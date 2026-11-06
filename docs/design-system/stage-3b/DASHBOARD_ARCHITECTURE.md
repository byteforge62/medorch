# Stage 3B — Admin Dashboard Architecture

**Surface:** `/dashboard` for the `ADMIN` role  
**Implementation date:** 5 November 2026  
**Status:** Implemented and verified locally; evidence package submitted for review.

## 1. Purpose

The ADMIN dashboard answers one operational question:

> What is happening across hospital operations, and what requires administrator attention now?

It is a read-first command workspace. Every figure is derived from an existing MedOrch API response. The only mutation exposed in the workspace is the existing alert “Mark read” action.

## 2. Route and shell

`src/app/dashboard/page.tsx` remains the authenticated role router.

| Role | Dashboard |
| --- | --- |
| PATIENT | `PatientDashboard` |
| DOCTOR | `DoctorDashboard` |
| OT_STAFF | `OTStaffDashboard` |
| ADMIN | `AdminDashboard` inside `<AppShell workspace="clinical">` |

- `requireAuth()` runs on the server before any dashboard is selected.
- Unauthenticated requests are redirected to `/login` by the existing guard.
- The ADMIN branch explicitly uses the light clinical workspace instead of the dark operations shell.
- No other role’s dashboard, landing page, or operational module was changed.

The old `src/components/dashboard/HospitalIntelligence.tsx` was removed and replaced by the component tree below. The preview harness now mounts the same `AdminDashboard` used in production.

## 3. Component hierarchy

```text
/dashboard (server)
└── AppShell workspace="clinical"
    └── AdminDashboard (client, single data owner)
        ├── dashboard header and operational summary strip
        ├── OperationalAttention
        ├── grid
        │   ├── TheatreOperationsBoard
        │   └── AlertDecisionQueue
        ├── grid
        │   ├── SurgicalScheduleTimeline
        │   └── WorkforceOverview
        ├── grid
        │   ├── EquipmentReadiness
        │   └── OperationalActivityFeed
        └── source / privacy footer
```

Shared presentation primitives live in `DashboardPrimitives.tsx`:

- `Panel`
- `PanelHeader`
- `PanelError`
- `PanelEmpty`
- `CountTag`
- `InlineMeter`
- `DashboardSkeleton`

Formatting, status labels, durations and overlap checks live in `format.ts`. API response types live in `types.ts`.

## 4. Data flow

```text
AdminDashboard
  ├── GET /api/ot-rooms ───────────────► rooms
  ├── GET /api/schedules ──────────────► schedules
  ├── GET /api/equipment ──────────────► equipment
  ├── GET /api/alerts ─────────────────► alerts
  ├── GET /api/doctors ────────────────► doctors
  ├── GET /api/users ──────────────────► users
  ├── GET /api/audit?limit=12 ─────────► audit + total
  └── GET /api/schedules/{id} ─────────► staff/equipment details
        for current IN_PROGRESS cases and open cases within 14 days
```

### One owner for reads

`AdminDashboard` performs the seven base GETs once with `Promise.allSettled`. It then enriches only the relevant schedules with the existing detail endpoint via another `Promise.allSettled`. Child components receive typed props and issue no API requests. This avoids duplicate requests and gives one refresh control.

`apiClient` coalesces concurrent GETs. The dashboard calls each base endpoint once per load.

### Partial failure

Each source is recorded independently. A failed source does not blank the whole workspace:

- a page-level status banner names the missing feeds;
- each affected panel renders its own error state and Retry;
- summary figures show `—` instead of a fabricated number;
- schedule detail failures are labelled as incomplete staffing/equipment data;
- if every core feed fails, the workspace explicitly states that no operational conclusion can be drawn.

### Refresh

- Initial load: `DashboardSkeleton`.
- Subsequent refresh: the current data remains visible while the Refresh control shows its loading state.
- `now` advances every minute for date/time labels; operational reads refresh only when requested.

## 5. Operational modules

### Operational attention

Derived only from loaded records:

- unread `CRITICAL` alerts;
- schedules with `DELAYED` status;
- active theatres in `MAINTENANCE` or `DISABLED`;
- equipment in `MAINTENANCE`, overdue maintenance, or maintenance due within seven days;
- clinical/admin accounts in `PENDING` status.

Each item is a real link to its source record or register. There is no synthetic severity score and no count not present in the data.

### Theatre operations

- Room cards represent every room returned by the API, including inactive rooms.
- The selected room detail shows department, capacity, recorded booked minutes today, next case, today’s cases and links to each case.
- The room register state is shown explicitly. If a room is `OCCUPIED` but no loaded case is `IN_PROGRESS`, the UI states that mismatch instead of inferring a case.
- Today’s case rails are positioned by recorded start/end times. Overlaps on the same room and day are flagged.
- No turnover duration is shown because the system does not record it.

### Surgical schedule

- A time-positioned board groups open cases by day and uses recorded start/end times for width and lane placement.
- Scopes: Today, 7 days, All open.
- Selecting a case reveals status, priority, theatre, department, surgeon, staff assignment and equipment assignment.
- Same-room/same-day conflicts are outlined and explained in the detail panel.
- Completed and cancelled cases are excluded from the open-case timeline; they remain visible elsewhere through the existing Schedules module.
- Mobile recomposes this into a day-grouped agenda.

### Clinical workforce

- Active clinician counts come from active `DOCTOR` / `OT_STAFF` accounts and active doctor profiles.
- Department distribution uses doctor profiles and department names.
- Near-term staffing is calculated from schedule detail responses: a case is staffed when at least one staff assignment exists.
- Role counts and surgeon case load are calculated from loaded open cases.
- The panel states that availability is not tracked. No availability value is invented.

### Equipment readiness

- Shows recorded status, category, department and maintenance date.
- Current assignment is resolved from unreleased equipment assignments on loaded open cases.
- Filters: All, Available, Attention.
- Overdue and due-within-seven-days maintenance are distinguished.
- Retired equipment remains visible but is excluded from the readiness totals.
- “In use” is the recorded equipment status, not an inferred live telemetry state.

### Alerts needing review

- Shows unread alerts only, ordered by severity then recency, capped at five.
- Severity, type, relative timestamp, title, message and linked schedule are shown.
- Uses the existing `PATCH /api/alerts/{id}/read` action.
- Failed actions leave the alert unread and show an inline error.
- The full Alerts page remains the register; this panel does not duplicate it.

### Operational activity

- Reads the latest 12 audit records from `GET /api/audit?limit=12`.
- Shows the recorded description, actor, entity, relative time and total audit count.
- No activity is synthesized.

## 6. Responsive composition

| Width | Composition |
| --- | --- |
| 1440×900 | Theatre board (8/12) beside alerts (4/12); schedule beside workforce; equipment beside activity. |
| 1024×768 | Single-column operational flow; alert queue moves ahead of theatre so unresolved signals are encountered first. |
| 390×844 | Same priority order, 2×2 summary, stacked attention items, full-width theatre cards, day-grouped agenda, stacked equipment and activity. |

The priority recomposition was measured in the browser:

- desktop: theatre and alerts share the same top; theatre is the primary column;
- mobile: alerts top = 967 px, theatre top = 1526 px.

No horizontal page overflow was measured at any of the three widths.

## 7. Visual system

- Uses the existing MedOrch clinical tokens: `bg-paper`, `bg-sheet`, `text-ink`, `border-rule`, `primary`, `warning`, `danger`, `success`, `info`.
- Inter remains the body type; monospace is limited to times and numeric values.
- No new font, chart library, icon package or animation dependency was introduced.
- Panels are purposeful operational surfaces, not a repeated generic card grid.
- The summary strip is a single compact command readout, not a series of hero metrics.
- Motion is limited to hover/focus transitions and the existing loading indicator.

## 8. Accessibility

- Sections use `aria-labelledby` with visible headings.
- Buttons use `aria-pressed` for room selection, schedule selection and filters.
- Alert action buttons expose loading labels and are disabled while a mutation is in flight.
- Loading skeleton has `aria-busy` and a screen-reader label.
- Error panels use `role="alert"`.
- Focus-visible outlines are present on interactive elements; eight consecutive Tab stops were checked at 1440×900.
- This was a keyboard/focus check, not a full screen-reader or WCAG audit.

## 9. Privacy and authorization

- The dashboard reads no patient identity, patient contact details or clinical notes.
- Schedule detail responses may contain patient fields, but the dashboard does not render them.
- The footer states that no patient clinical notes are loaded in the workspace.
- All data endpoints continue to authorize server-side. The browser check confirmed `GET /api/users` and `GET /api/audit` return 403 for a DOCTOR session.
- A DOCTOR session renders the Doctor dashboard, not the ADMIN one. `/users` redirects the doctor to `/unauthorized`.
