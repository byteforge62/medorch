# Stage 3A — Mutation Verification

**Status: PASS.** All five required mutation checks were executed against the real UI and API. Database before/after states were captured for each step. The seeded alert set was not changed.

- Production server: `http://localhost:5274`
- Build: `j_HBmc_QkUtn6fZrYyg79`
- Date: 5 November 2026
- No API, authorization policy, schema, Dashboard or landing-page source was changed.

## Isolation

Two disposable accounts and five disposable alerts were created for this run:

| Record | Purpose |
| --- | --- |
| `Stage 3A Alert Owner` (`DOCTOR`) | Owned all five test alerts and performed the successful mutations |
| `Stage 3A Alert Intruder` (`OT_STAFF`) | Attempted cross-user mutations |
| Five `[Stage 3A mutation] …` alerts | Four mutation targets and one failure-path target |

The owner account had only these disposable alerts, so “Mark all read” could not alter a seeded record. The test password existed only for the disposable accounts and was removed with them.

A temporary harness performed setup, snapshots and cleanup:

```bash
node --env-file=.env --import tsx .tmp-stage3a-mutations/harness.ts setup
node --env-file=.env --import tsx .tmp-stage3a-mutations/harness.ts snapshot before
node --env-file=.env --import tsx .tmp-stage3a-mutations/harness.ts create-failure
node --env-file=.env --import tsx .tmp-stage3a-mutations/harness.ts dismissed-state
node --env-file=.env --import tsx .tmp-stage3a-mutations/harness.ts cleanup
node --env-file=.env --import tsx .tmp-stage3a-mutations/harness.ts verify-clean
```

The harness was removed after verification. Its JSON output is retained in `evidence/`.

| Command | Result |
| --- | --- |
| `setup` | Created two disposable users and four unread alerts; seeded count 4, hash recorded |
| `snapshot before` | 4 test rows, 4 unread, seeded unchanged |
| `snapshot after-single-read` | 4 test rows, 3 unread, targeted row read |
| `snapshot after-mark-all` | 4 test rows, 0 unread, all read |
| `snapshot after-dismiss` | 3 test rows, 0 unread, dismissed row absent |
| `dismissed-state` | Direct lookup returned `null` for the dismissed ID |
| `create-failure` | Created the fifth test alert, unread |
| `snapshot before-failure` | 4 present test rows, 1 unread, seeded unchanged |
| `snapshot after-failure` | Failure row still unread; seeded unchanged |
| `snapshot after-auth` | Owner rows unchanged after three 403 responses |
| `cleanup` | Deleted 7 audit rows, 4 alerts and 2 users; seeded unchanged |
| `verify-clean` | 0 test users, 0 test alerts; seeded hash matches baseline |

## 1. Mark one unread alert as read

**Action:** Signed in as the disposable owner, opened `/alerts`, and pressed **Mark read** on `[Stage 3A mutation] Mark single read`.

**Request**

```http
PATCH /api/alerts/5b29e0c5-c224-42f5-94ed-0c8614117ce3/read
```

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "id": "5b29e0c5-c224-42f5-94ed-0c8614117ce3",
    "title": "[Stage 3A mutation] Mark single read",
    "isRead": true,
    "readAt": "2026-11-05T08:02:34.033Z"
  }
}
```

**Result**

| Check | Before | After |
| --- | --- | --- |
| Masthead | 4 unread · 4 on file | **3 unread · 4 on file** |
| Row | Unread marker + Mark read + Dismiss | No unread marker, no Mark read, Dismiss only |
| Database `isRead` | false | **true** |
| Database `readAt` | null | **`2026-11-05T08:02:34.033Z`** |
| Seeded alert hash | unchanged | **unchanged** |

Screenshot: `screenshots/mutation-02-mark-read-success.png`  
Database evidence: `evidence/mutations-after-single-read.json`

## 2. Mark all alerts as read

**Action:** Pressed **Mark all read** while three alerts remained unread.

**Request**

```http
PATCH /api/alerts/read-all
```

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

The API reported exactly the three eligible unread records. A follow-up `GET /api/alerts` returned all four test rows as read.

**Result**

| Check | Before | After |
| --- | --- | --- |
| Masthead | 3 unread · 4 on file | **0 unread · 4 on file** |
| Register | Unread 3, three Mark read controls | **Unread 0, no Mark read controls** |
| Database unread count | 3 | **0** |
| All test rows `isRead` | mixed | **true** |
| All test rows `readAt` | mixed | **set** |
| Mark all control | visible | **removed when `unreadCount` reached zero** |
| Seeded alert hash | unchanged | **unchanged** |

Screenshot: `screenshots/mutation-03-mark-all-success.png`  
Database evidence: `evidence/mutations-after-mark-all.json`

## 3. Dismiss one alert

**Action:** Pressed **Dismiss** on `[Stage 3A mutation] Mark all read A`.

**Request**

```http
DELETE /api/alerts/c24799dd-3483-4535-b205-12ed68ce5fa1
```

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

**Result**

| Check | Before | After |
| --- | --- | --- |
| Register rows | 4 | **3** |
| Filter counts | All 4 · Unread 0 | **All 3 · Unread 0** |
| Dismissed title visible | yes | **no** |
| Database row | present | **null** |
| Seeded alert hash | unchanged | **unchanged** |

Screenshot: `screenshots/mutation-04-dismiss-success.png`  
Database evidence: `evidence/mutations-after-dismiss.json`, `evidence/mutations-dismissed-row.json`

## 4. Authorization

The disposable intruder signed in separately, then called the real API with the owner’s alert IDs.

| Attempt | Result | API message |
| --- | --- | --- |
| `PATCH /api/alerts/{owner-alert}/read` | **403** | “You do not have permission to modify this alert.” |
| `DELETE /api/alerts/{owner-alert}` | **403** | “You do not have permission to delete this alert.” |
| `PATCH /api/alerts/read-all` with owner’s `userId` | **403** | “You do not have permission to mark alerts as read for this user.” |
| `GET /api/alerts` as intruder | **200, 0 records** | Own scope only |
| `PATCH /api/alerts/{owner-alert}/read` signed out | **401** | “Unauthorized” |

After all rejected attempts, the owner’s database state was unchanged: one read row, one unread row, one read row with an earlier `readAt`. The seeded alert hash was still unchanged.

Request IDs and exact bodies: `evidence/mutations-requests.json`  
Database evidence: `evidence/mutations-after-auth.json`

## 5. Failure handling

The mark-read request for the unread failure target was intercepted for one call and answered with an API-shaped `500`. This request did not reach the API or database.

**Simulated response**

```json
{
  "success": false,
  "message": "Unable to mark this alert as read. Please retry.",
  "requestId": "stage3a-failure-simulation"
}
```

**Observed UI**

| Check | Result |
| --- | --- |
| Error banner | **“Unable to mark this alert as read. Please retry.”** |
| Target row | **Still marked Unread** |
| Mark read control | **Still present** |
| Filter counts | **All 4 · Unread 1** |
| False success | **None; the workspace updates state only after the response succeeds** |
| Database row | **Still `isRead: false`, `readAt: null`** |

Screenshot: `screenshots/mutation-05-failed-mutation.png`  
Database evidence: `evidence/mutations-after-failure.json`

## Cleanup and final state

The five test alerts were removed: one through the UI delete path and four during cleanup. Both disposable users and seven test-related audit entries were removed.

```json
{
  "remainingTestUsers": 0,
  "remainingTestAlerts": 0,
  "seededAlertCount": 4,
  "seededHash": "ed89bb4aefd0d7b04dd2f4d29d8a7b1c459d6cebe7f6083c7c171d36bd456155",
  "seededHashBefore": "ed89bb4aefd0d7b04dd2f4d29d8a7b1c459d6cebe7f6083c7c171d36bd456155",
  "seededUnchanged": true
}
```

Evidence: `evidence/mutations-cleanup.json`, `evidence/mutations-final-state.json`

## Evidence index

| File | Contents |
| --- | --- |
| `evidence/mutations-requests.json` | Actual request/response bodies, statuses and observed UI state |
| `evidence/mutations-before.json` | Four test alerts unread; seeded hash baseline |
| `evidence/mutations-after-single-read.json` | One read; three unread |
| `evidence/mutations-after-mark-all.json` | All four read; zero unread |
| `evidence/mutations-after-dismiss.json` | Three rows remain; dismissed row absent |
| `evidence/mutations-dismissed-row.json` | Direct query for the dismissed ID returns null |
| `evidence/mutations-before-failure.json` | New failure-path alert unread |
| `evidence/mutations-after-failure.json` | Failure target still unread and unchanged |
| `evidence/mutations-after-auth.json` | Owner rows unchanged after three 403 responses |
| `evidence/mutations-cleanup.json` | Deleted counts and seeded hash comparison |
| `evidence/mutations-final-state.json` | Zero test users/alerts; seeded set unchanged |

## Limitations

- The failure case was simulated at the browser network boundary, as requested. The client receives it through the same `ApiClientError` path as a real API 500; no live API 500 was induced.
- Successful mutations were performed by a disposable `DOCTOR`. Cross-user rejection was verified with a disposable `OT_STAFF`. Admin mutation was not executed because it would necessarily touch shared seeded alerts; its policy is unchanged and was not modified.
- Chromium only. No Firefox/Safari or screen-reader run.
- No Stage 3B work was started.
