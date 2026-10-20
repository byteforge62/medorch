# AI Coding Workflow for MedOrch

This document is for future ChatGPT sessions and coding agents. Its purpose is to prevent repeated audits, guessed code, and endless one-file-at-a-time debugging.

## Before changing code

1. Read `PROJECT_CONTEXT.md`, `PROJECT_STATUS.md`, and the relevant section of `docs/roadmap.md`.
2. Inspect the **current local file**, not just a previous chat or uploaded archive.
3. Trace the full feature path as applicable: page/component → API route → authorization → Zod schema → service → repository → Prisma model/migration → tests.
4. Search for every caller of a changed service/function and every alternate API path exposing the same resource.
5. Confirm existing conventions, error codes, response envelope and role/ownership rules.
6. State the specific change and its acceptance criteria before editing; do not restart a completed phase without new evidence.

## Editing rules

- Prefer a focused diff over rewriting whole files.
- Never invent line numbers. Quote a stable nearby function/statement as the insertion point.
- When the user asks for exact replacement, identify the exact file and exact block to replace; otherwise edit directly only if the coding environment permits it.
- Preserve established architecture and avoid unrelated refactors.
- Do not add dependencies or schema migrations unless the feature genuinely requires them.
- For a schema change: update Prisma schema, generate client as needed, create migration using the project workflow, and test against a disposable DB.
- Server-side authorization is mandatory; hiding a button is not access control.
- Keep sensitive fields out of API responses unless the role and use case require them.
- Treat Prisma/database constraints as authoritative for concurrent integrity; service pre-checks alone are not race-safe.
- Keep permission tests free of accidental imports of `server-only`, Next.js runtime or Prisma modules when they are intended to be pure unit tests.

## Verification rules

Run only relevant checks first, then the full available suite for meaningful changes. Common checks:

```powershell
npx tsc --noEmit
npm run lint
node --import tsx --test tests/api-request-validation.test.ts tests/schedule-access.test.ts tests/permissions.test.ts tests/foundation-validation.test.ts
npm run test:schedule-constraints
npm run build
```

Also use `npx prisma validate` and `npx prisma migrate status` for schema/migration work. DB tests must point to a disposable test database. Never run a seed or destructive test against valuable data.

Report command results honestly: PASS only if run and passed; BLOCKED if prerequisites are missing; NOT RUN if not attempted. Do not infer success from old logs.

## How to finish a task

The final response must include:
1. What changed and why.
2. Exact files changed.
3. Commands run and observed results.
4. Remaining risks/blockers.
5. Whether the task's acceptance criteria are met.
6. The next single task.

Update `PROJECT_STATUS.md` and relevant docs only after implementation and verification. Keep the next task explicit. Do not end by asking the user to paste a file already available in the current working repository/snapshot.

## Context across chats

A chat model may not retain every line of every source file between conversations. These repository documents preserve durable project context; the current source code remains authoritative. When a new chat begins, upload a fresh lightweight archive or provide the current Git diff if local code changed since the last snapshot.
