# Security and project boundaries

## Intended use

MedOrch is a portfolio and development prototype. It is not an electronic health record, a medical device, a clinical decision-support tool, or an approved system for storing protected health information. Use synthetic data only. The schema includes patient and clinical-note fields, but their presence does not establish that the application meets healthcare privacy, security, availability, or regulatory requirements.

No production deployment or compliance assessment is documented in this repository. Do not use this project to make clinical decisions or to coordinate real patient care.

## Controls implemented in the code

- **Credential sign-in:** Auth.js credentials authenticate against a stored password hash. Email input is trimmed and normalized to lowercase. Only users in `ACTIVE` status can sign in.
- **Password hashing:** Password hashes use bcryptjs with 12 salt rounds.
- **Session shape:** Auth.js uses JWT sessions and places user ID, role, and status on the session user object.
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
2. **Declared permission versus effective access.** `src/lib/auth/permissions.ts` expresses broader role permissions than every Route Handler currently grants. For example, the schedule read API permits administrators, doctors, and OT staff, but not patients—even though the permission map declares a patient-owned schedule-read permission. Treat handler guards as the effective API behavior.
3. **Schedule conflict concurrency.** Room and surgeon overlaps are checked in application service logic before the write. The database schema does not define an exclusion constraint or equivalent concurrency-safe interval reservation. Concurrent requests could therefore require stronger transactional/database enforcement in a production design.
4. **Audit scope.** Audit events are written for selected mutations, not every read or every conceivable state change. The table is not demonstrated as immutable, tamper-evident, retention-controlled, or compliance-grade.
5. **Operational freshness.** Dashboard values are fetched on page load and summarized in the client. There is no push-based real-time feed.
6. **Automated verification.** The package currently has lint and build scripts but no dedicated test script. Authentication, authorization, schedule conflict, and ownership behavior need an automated test strategy before production adaptation.

## Before any production adaptation

Treat deployment as a separate engineering project. At minimum, define and validate the threat model, authorization policy, secret handling, data classification, encryption and transport requirements, audit/retention requirements, backups and recovery, observability, incident response, and applicable legal/regulatory controls. Add automated tests for access boundaries and schedule concurrency. Obtain qualified security, privacy, and compliance review before introducing real personal or health information.
