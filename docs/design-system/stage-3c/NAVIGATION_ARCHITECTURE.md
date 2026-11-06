# Stage 3C — Navigation Architecture

**Date:** 6 November 2026  
**Baseline commit:** `2fac5ac`  
**Scope:** authenticated application shell only; public landing, auth and unauthorized plates remain independent.

## 1. Route boundary

All authenticated product routes now live under one App Router route group:

```
src/app/
├── (workspace)/
│   ├── layout.tsx              server boundary: requireAuth + AppShell
│   ├── loading.tsx             content-only section skeleton
│   ├── dashboard/page.tsx
│   ├── schedules/page.tsx
│   ├── schedules/[id]/page.tsx
│   ├── equipment/page.tsx
│   ├── ot-rooms/page.tsx
│   ├── departments/page.tsx
│   ├── doctors/page.tsx
│   ├── doctors/[id]/page.tsx
│   ├── patients/page.tsx
│   ├── patients/[id]/page.tsx
│   ├── patients/appointments/page.tsx
│   ├── patients/appointments/[id]/page.tsx
│   ├── alerts/page.tsx
│   ├── users/page.tsx
│   ├── audit/page.tsx
│   └── admin/page.tsx
├── page.tsx                    public landing (outside the shell)
├── login/, register/, …        public auth (outside the shell)
├── unauthorized/               public boundary plate
├── preview/[module]/           internal visual harness
├── design-system/              internal reference
└── api/                        unchanged APIs
```

The group name is parenthetical, so it does not appear in any URL. Every existing path — `/dashboard`, `/schedules/…`, `/patients/appointments/…`, `/ot-rooms`, `/audit` and the rest — is unchanged. Bookmarks, direct links and the browser history stack continue to target the same addresses.

## 2. One shell, mounted once

`src/app/(workspace)/layout.tsx` is a server component. It awaits `requireAuth()` and then renders:

```tsx
<AppShell>{children}</AppShell>
```

`AppShell` remains a client component because it owns:

- the mobile navigation drawer's open state;
- the current pathname used for page-enter animation and active navigation state.

Those are the only reasons it is client-side. It does not perform another redirect and it does not replace page-level authorization.

There is no `AppShell` call in any authenticated page. A source check for `AppShell` finds exactly three places:

1. `(workspace)/layout.tsx` — the real application.
2. `preview/[module]/PreviewClient.tsx` — the internal visual harness.
3. `components/layout/AppShell.tsx` — the component itself.

Because the shell is above the route segment, client-side navigation keeps the same React subtree mounted. The sidebar, header, session consumers, alert polling and drawer state are not recreated. Only the working sheet inside the layout changes.

The content container is intentionally keyed by pathname:

```tsx
<div key={pathname} data-page-content className="page-enter …">
  {children}
</div>
```

This remounts the page content so its 450 ms entrance animation runs, but it does **not** remount the shell, sidebar or header. The transition is content-only and does not delay navigation.

## 3. Stable test markers

The shell exposes four stable, non-visual markers:

| Marker | Owner | Purpose |
| --- | --- | --- |
| `[data-app-shell="clinical"]` | `AppShell` | Identifies the single persistent frame |
| `[data-app-sidebar]` | `Sidebar` | Identifies the navigation rail |
| `[data-app-header]` | `Header` | Identifies the command bar |
| `[data-page-content]` | `AppShell` | Identifies the section area that may change |

They are used by the Stage 3C browser checks to prove DOM identity across navigation. They carry no behaviour and no styling.

## 4. Navigation and active state

`Sidebar` renders every destination from one role-filtered `navItems` list. It uses `next/link` for all product destinations, so clicks are client-side transitions and the browser history remains a normal push/replace stack.

Active state is derived from the pathname:

```ts
const isActive = (href) =>
  pathname === href || pathname.startsWith(`${href}/`);
```

This means a detail page such as `/schedules/[id]` keeps `/schedules` active, and `/patients/appointments` does not accidentally activate `/patients` because the navbar has explicit destinations and the prefix check is path-segment aware.

Visible role navigation:

| Role | Primary destinations | Control destinations |
| --- | --- | --- |
| ADMIN | Dashboard, Schedules, Departments, Patients, Doctors, Equipment, Theatres | Accounts, Audit trail |
| DOCTOR | Dashboard, Schedules, Departments, Patients, Doctors, Equipment, Theatres | — |
| OT_STAFF | Dashboard, Schedules, Departments, Doctors, Equipment, Theatres | — |
| PATIENT | Dashboard, My appointments | — |

`/alerts` is not a sidebar item, but remains directly reachable for all roles that hold `alerts:read`, including PATIENT. It is covered by the role route tests.

## 5. Load and error boundaries

- `(workspace)/loading.tsx` renders a content-only skeleton. It sits below the persistent layout, so a route transition can show the rail and command bar while only the section area becomes a loading state.
- `(workspace)/layout.tsx` performs a server-side `requireAuth()` before rendering. A signed-out request is redirected before any private shell markup is sent.
- Each page retains its existing `requireRole` or `requirePermission` guard. The shared layout is an additional boundary, not a replacement.
- The root `error.tsx` recovery link now uses `next/link` instead of a plain `<a>`, so recovering from an error does not force a document reload.
- The schedule detail "Refresh" control still calls `window.location.reload()` by design; this is an explicit refresh action, not a navigation link. It is excluded from the no-document-navigation assertion, which measures sidebar and history navigation.

## 6. Public boundaries

These routes intentionally stay outside `(workspace)` and outside the authenticated shell:

- `/` — public landing page;
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/resend-verification`, `/verify-email`;
- `/unauthorized`;
- `/preview/[module]` — internal visual harness;
- `/design-system/*` — internal design reference.

They use their own layouts and may use inverted plates. The dark `--rail` tokens remain available for these surfaces. No public or auth page was redesigned in Stage 3C.

## 7. Back/forward, refresh and direct links

- **History:** sidebar clicks call `next/link`; the App Router pushes history entries. Browser Back and Forward restore the previous route.
- **Direct URL:** every route is a normal App Router page. A fresh request runs the workspace layout's server auth check, then renders the shell and page.
- **Refresh:** a document refresh re-runs the server boundary and rehydrates the same page. The authenticated shell is expected to be recreated on refresh; the no-remount guarantee applies to client-side navigation.
- **Sign-out:** clears the session, returns to `/login`, and a subsequent private request is denied or redirected by the server boundary.

## 8. Why this shape

The previous implementation mounted `AppShell` inside every page. The URL changed through links, but React saw a new page-level shell instance on each route, so the sidebar and header were recreated and looked like a reload. A conditional shell in the root layout would have put the shell above public pages and required it to infer the current boundary on the client. The route-group layout is the smallest server-correct boundary: one shell, one auth check, unchanged URLs and unchanged page-level permissions.
