# Role Verification

## Method

Each role signed in through the real NextAuth credentials form on a production build. The browser then navigated to allowed and restricted routes, and the resulting pathname and page heading were recorded.

Evidence: `evidence/verification-report.json`, `evidence/verify-final.log`.

---

## Access matrix verified in the browser

| Route | ADMIN | DOCTOR | OT_STAFF | PATIENT |
| --- | --- | --- | --- | --- |
| `/dashboard` | Allowed | Allowed | Allowed | Allowed |
| `/schedules` | Allowed | Allowed | Allowed | Blocked → `/unauthorized` |
| `/departments` | Allowed | Allowed | Allowed | Not navigated |
| `/patients` | Allowed | Allowed | Blocked → `/unauthorized` | Blocked → `/unauthorized` |
| `/doctors` | Allowed | Allowed | Allowed | Not navigated |
| `/equipment` | Allowed | Allowed | Allowed | Not navigated |
| `/ot-rooms` | Allowed | Allowed | Allowed | Not navigated |
| `/users` | Allowed | Blocked → `/unauthorized` | Blocked → `/unauthorized` | Blocked in API tests |
| `/audit` | Allowed | Blocked → `/unauthorized` | Not navigated | Blocked in API tests |
| `/patients/appointments` | Not applicable | Not applicable | Not applicable | Allowed |

“Not navigated” means the route was not part of the recorded browser check; it is not claimed as verified here. Existing permission tests separately cover role capabilities.

---

## ADMIN

Signed in successfully and reached:

- `/dashboard` — “Operations control”.
- `/schedules` and a real schedule detail — “Urgent Abdominal Procedure”.
- `/equipment`.
- `/ot-rooms`.
- `/alerts`.
- `/doctors` and a real clinician record — “Dr. Ananya Shah”.
- `/patients` and a real patient record — “Aarav Mehta”.
- `/departments` — “Clinical divisions”.
- `/users` — “Who can enter MedOrch”.
- `/audit` — “Audit ledger”.
- `/unauthorized` access boundary.

Functional checks performed as ADMIN:

- Department search returned the empty state when no division matched.
- Department create form opened and closed.
- Account search returned the empty state when no identity matched.
- Account create form opened and closed.
- Audit filter was applied server-side.
- Audit event inspection opened.

Business writes were not submitted.

---

## DOCTOR

Signed in successfully and reached:

- `/dashboard` — “Day plan”.
- `/schedules`.
- `/departments`.

Authorization boundary:

- `/users` → `/unauthorized`.
- `/audit` → `/unauthorized`.

The doctor view retained its operational scope: no account administration and no audit history.

---

## OT_STAFF

Signed in successfully and reached:

- `/dashboard` — “Theatre command”.
- `/ot-rooms`.
- `/schedules`.

Authorization boundary:

- `/patients` → `/unauthorized`.
- `/users` → `/unauthorized`.

The theatre view remained assignment-derived. No patient registry access was exposed.

---

## PATIENT

Signed in successfully and reached:

- `/dashboard` — “Hello, Aarav”.
- `/patients/appointments` — “Your theatre visits”.
- A real patient-owned appointment detail — “Laparoscopic Cholecystectomy”.

Authorization boundary:

- `/schedules` → `/unauthorized`.
- `/patients` → `/unauthorized`.

The visit book was checked at 390px and had no page-level horizontal overflow. It showed the patient's own past visit and an explicit empty upcoming section.

---

## Public boundary

The following rendered without authentication:

- Landing at 1440, 1024 and 390.
- Login at 1440 and 390.
- Registration.
- Forgot password.
- Unauthorized / access boundary.

Registration and recovery forms use the same access shell and shared field/label/notice system as sign-in.

---

## Shell and navigation

- The persistent sidebar and header remained across role-specific routes.
- Mobile navigation opened and reported `aria-expanded="true"`.
- The breadcrumb no longer prints raw UUIDs; dynamic records resolve to “Patient record”, “Clinician record”, “Case record”, “Visit record” and similar labels.
- Active navigation remained visible in the rail.
- Alerts remained available in the command bar where the existing permission model allows it.

---

## What was not verified in this run

- No account creation, patient creation, department mutation or schedule transition was submitted through the redesigned forms.
- No manual screen-reader pass was performed.
- The pre-existing runtime authorization harness failed on stale API-response expectations; see `FUNCTIONAL_TEST_REPORT.md`.

These are recorded as limitations, not passes.
