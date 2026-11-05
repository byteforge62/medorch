# Stage 3A — Authorization Tests

## Policy under test

- `/alerts` requires an authenticated session with `alerts:read`.
- All four application roles currently hold `alerts:read`.
- `GET /api/alerts` returns all alerts for ADMIN and only the requesting user’s alerts for DOCTOR, OT_STAFF and PATIENT.
- Individual read, update and delete operations enforce ownership again in the service.
- Cross-user `read-all` is rejected unless the requester is ADMIN.

No authorization code was modified in this stage. The page relies on the existing server guard and API/service policy.

## Environment

| Item | Value |
| --- | --- |
| Production server | `http://localhost:5274`, `next start` |
| Full suite build | `D0kniwlbkTvI_Kp8b6xn7` |
| Final rebuild | `j_HBmc_QkUtn6fZrYyg79` |
| Browser | Playwright Chromium |
| Seed data | Existing local database; four alert records total |
| Accounts | Seeded ADMIN, DOCTOR, OT_STAFF and PATIENT accounts |

Passwords were passed to the test process through environment variables and are not recorded.

## Results

### Signed out

| Check | Result |
| --- | --- |
| Browser `GET /alerts` | Redirects to `/login` |
| `GET /alerts` HTTP response | 200 streaming shell containing `NEXT_REDIRECT;replace;/login;307;` |
| `GET /api/alerts` | 401 `{"success":false,"message":"Unauthorized"...}` |

The server does not render alert rows to an unauthenticated request. The streaming response contains the redirect instruction, and the browser lands on `/login`.

### Administrator

| Check | Result |
| --- | --- |
| Page access | 200 |
| `GET /api/alerts` | 200 |
| Records | 4 of 4 |
| Scope label | “All recipients” |
| Cross-recipient visibility | Sees admin-, doctor- and OT-owned alerts |
| Actions exposed | 3 Mark read, 4 Dismiss, Mark all read |

Admin visibility across recipients is the documented service policy (`role !== "ADMIN"` is the only branch that forces `userId`).

### Doctor

Account with no alerts:

| Check | Result |
| --- | --- |
| Page access | 200 |
| `GET /api/alerts` | 200, 0 records |
| Empty state | “No alerts on file” |
| Scope label | “Assigned to you” |
| Admin alert title visible | No |
| Mark-read controls | 0 |

This is a real empty state from the database, not a mocked response.

### OT staff

Account with one alert:

| Check | Result |
| --- | --- |
| Page access | 200 |
| `GET /api/alerts` | 200, 1 record |
| Owned alert visible | “Resource coordination” |
| Admin alert visible | No |
| Doctor alert visible | No |
| Mark-read controls | 1 |
| `PATCH /api/alerts/{admin-alert}/read` | 403 |

The forbidden mutation targeted another user’s alert and was rejected without changing the record.

### Patient

| Check | Result |
| --- | --- |
| Page access | 200 |
| `GET /api/alerts` | 200, 0 records |
| Empty state | “No alerts on file” |
| Admin alert visible | No |
| `PATCH /api/alerts/read-all` with the admin user ID | 403 |

The cross-user read-all attempt was rejected by `markAllAlertsAsRead` before any update.

## Authorization matrix

| Principal | Page | List API | Reads own | Reads others | Mutates own | Mutates others |
| --- | --- | --- | --- | --- | --- | --- |
| Signed out | Redirect `/login` | 401 | No | No | No | No |
| ADMIN | 200 | 200 | Yes | Yes, by policy | Yes | Yes, by policy |
| DOCTOR | 200 | 200 | Yes | No | Yes | 403 |
| OT_STAFF | 200 | 200 | Yes | No | Yes | 403 |
| PATIENT | 200 | 200 | Yes | No | Yes | 403 |

There is no authenticated role that is denied `/alerts`, because every role is granted `alerts:read`. Adding a page-level role restriction would contradict the existing permission matrix.

## Page and API enforcement

- The page calls `requirePermission('alerts:read')` on the server, so the route itself cannot render without a session and permission.
- The client workspace only receives what `GET /api/alerts` returns; it does not request a user ID or override scope.
- The API independently authorizes the request and the service independently applies ownership.
- No client-supplied user ID is used by the page.

## Evidence

- `evidence/browser-run.log` — 48/48 checks, including the authorization matrix
- `evidence/browser-checks.json` — full check list, HTTP errors, console events and network data
- `evidence/post-build-smoke.log` — 8/8 checks on the final build
- `evidence/http-endpoints.txt` — signed-out endpoint behavior
- `evidence/mutations-after-auth.json` — cross-user mutation state after 403 responses
- `evidence/mutations-requests.json` — actual 403/401 request and response bodies
- `MUTATION_VERIFICATION.md` — disposable-record authorization and mutation run
- `screenshots/alerts-admin-1440.png`
- `screenshots/alerts-doctor-empty-1440.png`
- `screenshots/alerts-ot-1440.png`

## Limitations

- Cross-user mutation rejection was confirmed in this suite and re-confirmed after provisional acceptance with a disposable owner and intruder account; the owner’s database state was unchanged after all 403 responses. See `MUTATION_VERIFICATION.md`.
- Successful own-record mutations were verified with disposable records rather than seeded alerts, so no seeded alert was altered.
- Pending or suspended accounts were not tested; they cannot establish a normal session through the credentials flow.
- No Firefox/Safari run.
