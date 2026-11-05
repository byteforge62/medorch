# Stage 2 — Auth.js Production Verification

## Summary

The production landing itself rendered, but every Auth.js API request returned HTTP 500 with `UntrustedHost`. The cause was missing production origin configuration, not a defect in the credentials provider or authorization rules.

Fix: set the canonical production origin in the gitignored local environment:

```dotenv
AUTH_URL="http://localhost:5274"
```

No authentication or authorization code changed. No callback, provider, session, permission or redirect was bypassed or weakened.

## Versions

| Package | Version |
| --- | --- |
| `next-auth` | 5.0.0-beta.32 |
| `@auth/core` | 0.41.3 |
| `next` | 16.3.6 |

## Original failure

With the production server (`next start`, `NODE_ENV=production`) on port 5274:

- `GET /` → 200
- `GET /api/auth/session` → 500
- Server log:

```text
[auth][error] UntrustedHost: Host must be trusted.
URL was: http://localhost:5274/api/auth/session.
```

The page HTML loaded, but session resolution failed, so the application could not authenticate or authorize in production.

## Root cause

The project’s environment used the legacy `NEXTAUTH_URL`, which Auth.js v5 does not read for host trust. Installed `@auth/core` resolves trust in `lib/utils/env.js`:

```js
config.trustHost ?? (config.trustHost = !!(envObject.AUTH_URL ??
  envObject.AUTH_TRUST_HOST ??
  envObject.VERCEL ??
  envObject.CF_PAGES ??
  envObject.NODE_ENV !== "production"));
```

`NEXTAUTH_URL` is absent from that expression. In development, `NODE_ENV !== "production"` is true, which is why `next dev` worked while `next start` failed. In production, with no `AUTH_URL` or `AUTH_TRUST_HOST`, `assertConfig` returns `UntrustedHost`.

`NEXTAUTH_URL` is still used elsewhere in the project for links in verification and password-reset emails, so it was retained alongside the new value.

## Fix and trust model

`AUTH_URL` now declares the canonical origin that Auth.js uses in production. `@auth/core` derives `trustHost` from that value; the `UntrustedHost` guard is not patched, removed or bypassed in application code, and host trust is not hard-coded in `src/auth.ts`.

Security note: Auth.js does not maintain a per-host allowlist when `trustHost` is derived. The production deployment must therefore terminate TLS at a proxy that forwards only its canonical host, and `AUTH_URL` must match the public HTTPS origin exactly. Do not allow arbitrary `Host`/`X-Forwarded-Host` values through to the application.

`AUTH_SECRET` remains sourced from the existing `.env` file. No secret was copied into this report, the screenshots or the evidence files.

## Verification performed

All checks below ran against the production server and the real database, with real seeded accounts. Passwords were passed through environment variables to the temporary test process and are not recorded.

### Signed out

| Check | Result |
| --- | --- |
| `GET /api/auth/session` | 200, `null` |
| `GET /api/auth/csrf` | 200 |
| `GET /dashboard` in a browser | lands on `/login` |
| `GET /api/users` with no session | 401 |

The signed-out `/dashboard` response is a Next.js streaming shell: HTTP 200 containing `NEXT_REDIRECT;replace;/login;307;` and no dashboard content. A browser resolves it to `/login`.

### Seeded administrator

| Check | Result |
| --- | --- |
| Credentials sign-in | Session created |
| Session role | `ADMIN` |
| `/dashboard` | Renders “Hospital operations” |
| `/users` | 200 |
| `/audit` | 200 |
| `GET /api/users` | 200 |
| Sign-out | Session cookie removed; `/api/auth/session` returns `null` |

### Seeded doctor

| Check | Result |
| --- | --- |
| Credentials sign-in | Session created |
| Session role | `DOCTOR` |
| `/dashboard` | Renders “Day plan” |
| `/users` (ADMIN-only) | Redirected to `/unauthorized` |
| `GET /api/users` | 403 |
| `/schedules` (role-permitted) | 200, Schedules heading rendered |
| Sign-out | Session cookie removed; `/api/auth/session` returns `null` |

This verifies both page-level `requireRole` redirects and API-level permission enforcement without altering authorization code. The audit trail recorded the sign-in and sign-out events as designed.

## Database outage encountered

The first sign-in attempt after resuming produced an Auth.js `CallbackRouteError`:

```text
[auth][cause]: AggregateError
  at pg-pool/index.js
  ...
  at Object.authorize
  ...
[auth][details]: { "provider": "credentials" }
```

The cause was that the local `medorch-postgres` container was stopped, so `authorize()` could not start a Prisma transaction. Restarting the existing container restored the database with its existing volume. No schema change, migration, reseed or manual record edit was performed. After restart, both real sign-ins succeeded.

This was an environment failure and is distinct from the `UntrustedHost` configuration fix.

## Deployment configuration

Required production environment is documented separately in `DEPLOYMENT_ENV.md`. In short:

- `AUTH_URL` must be the exact public HTTPS origin.
- `AUTH_SECRET` must be set.
- `NEXTAUTH_URL` should match the same origin for existing email links.
- SMTP variables are required for verification and password-reset email.
- `DATABASE_URL` must point at the production database.
- Do not set `AUTH_TRUST_HOST` in addition to `AUTH_URL`; keep a single canonical origin.

## Not tested

- HTTPS or a real reverse proxy; local verification used `http://localhost:5274`.
- Email delivery, verification and password reset.
- Rate limiting under load.
- Session invalidation across multiple devices.
