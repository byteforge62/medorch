# Stage 2 — Production Landing Integration

## Scope

Stage 2 integrates the already-approved clinical landing composition into the production `/` route and verifies it on the real production server. It does not redesign the landing page, start Stage 3, or change Dashboard modules, design tokens, Prisma schema, migrations, APIs, or authorization rules.

## What changed

### Production route

`src/app/page.tsx` now renders the approved clinical composition:

```tsx
import { ClinicalLanding } from '@/components/landing/clinical/clinical-landing';

export default function HomePage() {
  return <ClinicalLanding production />;
}
```

The previous atlas-style landing composition in this file was replaced. No Dashboard or application module imports changed.

### Production-only route adaptations

`src/components/landing/clinical/clinical-landing.tsx` accepts a new optional `production` prop:

- The header logo links to `/` instead of `/design-system/clinical`.
- The footer line “Direction preview · not the production landing page.” is not rendered.
- The footer “Design system” link is not rendered.

Everything else — layout, type scale, colour, spacing, copy, theatre preview, module index, access panel and engineering section — is unchanged from the approved Stage 1 composition.

`src/components/landing/clinical/clinical-header.tsx` accepts an optional `homeHref` prop, defaulting to `/design-system/clinical`, so the design-system preview route keeps its existing behaviour. The logo’s accessible name remains “MedOrch home”.

### Review route retained

`/design-system/clinical` continues to render `ClinicalLanding` without the `production` prop, including the direction note and Design system footer link.

### Authentication configuration

The only authentication-related change is environment configuration, not code:

- `AUTH_URL="http://localhost:5274"` was added to the gitignored `.env.local`.

No Auth.js callback, provider, session, permission or middleware code was modified. See `AUTH_VERIFICATION.md` for the root cause and verification.

## Preserved constraints

- No landing redesign, new concept, typography change or new UI pattern.
- `/login`, `/register`, navigation and session handling retained.
- No Prisma schema, migration, API, authorization or business-logic changes.
- No shared design-token changes in Stage 2.
- No new dependencies.
- No Dashboard module changes.
- No commit, push, reset, stash, clean or discard was performed.

## Checks executed

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript (`npx tsc --noEmit`) | Pass, exit 0 | `evidence/typecheck.txt` |
| ESLint (`npm run lint`) | Pass, exit 0, 20 pre-existing warnings | `evidence/lint.txt` |
| Production build (`npm run build`) | Pass, exit 0; `/` and `/design-system/clinical` prerendered static | `evidence/build.txt` |
| Production browser suite | 37/37 checks passed | `evidence/browser-run.log`, `evidence/browser-checks.json` |
| Production endpoints | `/`, `/login`, `/register`, `/design-system/clinical`, `/api/auth/session`, `/api/auth/csrf` all 200 | `evidence/http-endpoints.txt` |

The production server used the existing successful build (`BUILD_ID=AaX5xWTUUnzpcGvBNJKII`) on `http://localhost:5274` with `next start`.

## Environment note

The local Postgres container (`medorch-postgres`, existing volume) was stopped after the prior interruption. It was restarted to execute the real sign-in tests. No reseed, migration or manual database write was performed. Authentication produced the audit records it normally writes on sign-in and sign-out.

## Known observation outside Stage 2 scope

The production browser run recorded two 404 responses for a Next.js prefetch of `/alerts?_rsc=…`, originating from the existing dashboard’s `/alerts` links. There is no `/alerts` page route. This is pre-existing Dashboard behaviour, outside the approved Stage 2 scope, and was not changed. It does not affect the landing page or authentication checks. Details are in `PRODUCTION_TEST_REPORT.md`.
