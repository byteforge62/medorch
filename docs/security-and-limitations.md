# Security and project boundaries

## Intended use

MedOrch is a portfolio and development prototype. It is not an electronic health record, a medical device, a clinical decision-support tool, or an approved system for storing protected health information. Use synthetic data only. The schema includes patient and clinical-note fields, but their presence does not establish that the application meets healthcare privacy, security, availability, or regulatory requirements.

No production deployment or compliance assessment is documented in this repository. Do not use this project to make clinical decisions or to coordinate real patient care.

## Controls implemented in the code

- **Credential sign-in:** Auth.js credentials authenticate against a stored password hash. Email input is trimmed and normalized to lowercase. Only users in `ACTIVE` status can sign in.
- **Password hashing:** Password hashes use bcryptjs with 12 salt rounds.
- **Session lifecycle:** Auth.js uses JWT sessions and exposes user ID, role, and status. The JWT callback checks that the account remains active and that its session version still matches; invalid or outdated sessions do not populate `session.user`.
- **Password reset:** Reset tokens are hashed at rest, consumed transactionally, and increment the user session version so existing sessions are invalidated.
- **Page and API guards:** Server-side helpers gate authenticated pages and role-restricted API operations. Endpoint permissions vary by method; consult the [authorization matrix](./api-reference.md#authorization-matrix).
- **Input validation:** Domain Zod schemas validate request bodies, identifiers, enums, and selected cross-field constraints. Services perform persisted-record and operational checks.
- **Alert ownership:** Non-admin alert reads and mutations are checked against the requesting user's ID in alert service logic.
- **Audit records:** The schema supports audit actions and JSON metadata. Domain services write audit records for selected operational mutations.

These are implementation observations, not a security certification or guarantee.

## Local development credentials

The repository includes development credentials in both `docker-compose.yml` and `prisma/seed.ts`:

- PostgreSQL: `medorch` / `medorch_dev_password`
- Seed administrator: `admin@medorch.local` / `MedOrch@Dev123!`

The seed upserts the account and resets its password when run. These values are public development defaults. Do not deploy them, reuse them, or place real data in the local instance. Production use would require replacing the credential and secret-management approach, removing or redesigning the seed account behavior, and reviewing the deployment configuration.

## Known implementation boundaries

1. **Prototype data only.** There is no documented production operations plan for backups, monitoring, incident response, encryption configuration, retention, or recovery.
2. **Declared permission versus effective access.** `src/lib/auth/permission.ts` defines role permissions, while Route Handlers also apply route-specific checks and ownership filters. For example, patients can read only their own appointments through `/api/me/appointments`; they do not receive general schedule-list access. Treat handler and service checks as the effective API behavior.
3. **Schedule conflict concurrency.** Application services check for overlapping room, surgeon, and patient schedules, and the PostgreSQL migration adds exclusion constraints for all three resources. The database constraints provide concurrency-safe enforcement when migrations are applied; deployment state was not verified as part of this repository audit.
4. **Audit scope.** Audit events are written for selected mutations, not every read or every conceivable state change. The table is not demonstrated as immutable, tamper-evident, retention-controlled, or compliance-grade.
5. **Operational freshness.** Dashboard values are fetched on page load and summarized in the client. There is no push-based real-time feed.
6. **Automated verification.** The repository has focused permission and PostgreSQL schedule-constraint tests, but no tests for authentication/session invalidation, endpoint ownership, or password/email token flows. Expand automated coverage for those boundaries before production adaptation.

## Before any production adaptation

Treat deployment as a separate engineering project. At minimum, define and validate the threat model, authorization policy, secret handling, data classification, encryption and transport requirements, audit/retention requirements, backups and recovery, observability, incident response, and applicable legal/regulatory controls. Add automated tests for access boundaries and schedule concurrency. Obtain qualified security, privacy, and compliance review before introducing real personal or health information.
