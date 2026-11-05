# Deployment Environment Configuration

This document describes the environment required to run MedOrch in production. No secret values are recorded here.

## Required variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `AUTH_URL` | Canonical public origin used by Auth.js in production. Exact scheme + host, no trailing slash or path. | Yes |
| `AUTH_SECRET` | Auth.js signing/encryption secret. Use a high-entropy value from the platform secret store. | Yes |
| `NEXTAUTH_URL` | Origin used by the existing verification and password-reset email links. Set it to the same origin as `AUTH_URL`. | Yes |
| `DATABASE_URL` | PostgreSQL connection string for the Prisma schema. | Yes |
| `SMTP_USER` | SMTP account for transactional email. | For email flows |
| `SMTP_APP_PASSWORD` | SMTP app password. | For email flows |
| `EMAIL_FROM` | From address used by verification and reset emails. | For email flows |

Example shape (replace every placeholder; never commit the real values):

```dotenv
AUTH_URL="https://medorch.example.com"
NEXTAUTH_URL="https://medorch.example.com"
AUTH_SECRET="<generated-high-entropy-secret>"
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>?schema=public"
SMTP_USER="<smtp-user>"
SMTP_APP_PASSWORD="<smtp-app-password>"
EMAIL_FROM="MedOrch <no-reply@medorch.example.com>"
```

## Auth.js host trust

Auth.js v5 sets `trustHost` from `AUTH_URL` / `AUTH_TRUST_HOST` in production. Provide a single canonical `AUTH_URL`; do not also set `AUTH_TRUST_HOST`.

Because `@auth/core` does not enforce a per-host allowlist once trust is configured, the edge/proxy must:

- only serve the application on the canonical host,
- normalize or reject arbitrary `Host` and `X-Forwarded-Host` values,
- forward `X-Forwarded-Proto: https`,
- keep `AUTH_URL` identical to the public origin.

Setting `AUTH_URL` is not a code-level authentication bypass. It replaces the missing production origin that caused `UntrustedHost`.

## Runtime

- `NODE_ENV=production`
- Build with the project’s package manager and committed lockfile.
- Start with the Next.js production server.
- `AUTH_URL` is read at runtime; changing it requires a restart.
- `.env.local` is gitignored and must not be shipped. Use the hosting platform’s secret/environment store.

## Local production verification values

The local verification used:

```dotenv
AUTH_URL="http://localhost:5274"
NEXTAUTH_URL="http://localhost:5274"
```

These localhost values are for the local production check only and must not be used in a deployed environment.
