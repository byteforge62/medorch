# MedOrch Architecture Decisions and Open Questions

This file records current implementation facts and decisions that must be made explicitly. It does not invent historical rationale.

## Confirmed implementation facts

1. **Single Next.js application:** UI and JSON API live in the same App Router application; there is no separate API service in this repository.
2. **PostgreSQL + Prisma 7:** PostgreSQL is the persistence layer; Prisma uses `@prisma/adapter-pg`.
3. **Auth.js credentials + JWT:** credentials provider verifies bcrypt hashes; JWT callbacks check account state and `sessionVersion`.
4. **Domain layering:** most features have validation, service and repository files under `src/modules/<domain>/`.
5. **Shared API envelope:** success and error envelopes are centralized in `src/lib/api/response.ts`.
6. **Database schedule constraints:** migration `20261010224215_schedule_overlap_constraints` adds GiST exclusion constraints for overlapping patient, room and surgeon intervals; cancelled/completed schedules are excluded.
7. **Half-open schedule intervals:** database range uses `[startTime, endTime)`, allowing adjacent bookings with no overlap.
8. **Generated Prisma code:** `src/generated/prisma/` is generated output, not a source of manual edits.
9. **Synthetic-data boundary:** do not use real patient/clinical data for development, screenshots, demos or testing.

## Open decisions (do not silently choose)

1. **Sign-in and registration rate limits:** determine acceptable per-IP/per-account policy and storage mechanism before implementing broad throttling.
2. **Audit transactionality and event coverage:** define which business mutations must fail/roll back if audit persistence fails, and which events are mandatory.
3. **OT staff clinical data:** confirm the minimum patient fields and schedule details OT staff need. Current helper redacts clinical notes, schedule notes, email, DOB and gender from relevant responses.
4. **Doctor schedule mutation scope:** define whether doctors may manage any schedule or only schedules assigned to them/created by them. Current permission map grants `schedules:manage` to DOCTOR; do not impose a different rule without product confirmation.
5. **Patient access policy:** document whether patients can see only appointments or any other schedule metadata; preserve own-record scoping.
6. **Account provisioning:** define which roles can register publicly and which roles must be created/approved by administrators. Current public registration is for patients.
7. **Production deployment/security baseline:** decide hosting, secrets management, backup/restore, monitoring, incident response, data retention and applicable healthcare/legal compliance requirements before production use.

## Change log discipline

When a decision is made, record date, decision, reason, alternatives considered, affected files/migrations and any migration/rollout risk. Link to the implementing PR/commit when available.
