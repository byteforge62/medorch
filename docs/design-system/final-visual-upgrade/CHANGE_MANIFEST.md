# Change Manifest — Final Visual Upgrade

All changes are uncommitted in the working tree. No commit, push, reset, stash, branch switch or discard was performed.

The worktree already contained uncommitted Stage 3A–3D and final-transformation changes before this pass. Files below are the visual-upgrade delta.

## New files

| Path | Purpose |
|---|---|
| `src/lib/clinical-media.ts` | Registers eight local WebP assets, captions, sources and blur placeholders. Only three are still rendered. |
| `src/components/visual/ClinicalPlate.tsx` | `ClinicalPlate`, `ClinicalBackdrop` and the new `AmbientField` blurred photographic layer. |
| `src/components/visual/TheatreSchematic.tsx` | Drawn theatre plan replacing the corridor photograph in the room detail. |
| `src/app/(workspace)/equipment/EquipmentRegister.tsx` | Open register rows, category glyphs and status controls replacing the equipment table. |
| `src/assets/clinical/*` | Eight locally stored Pexels WebP files and `blur.json`; no runtime external image URLs. |
| `scripts/visual-upgrade-verify.mjs` | Dependency-free Chrome CDP harness: 54 exact-viewport captures, audit, reduced-motion and fallback checks. |
| `docs/design-system/final-visual-upgrade/*` | Direction, manifest, implementation, tests, screenshots and evidence. |

## Modified files

| Path | Change |
|---|---|
| `src/app/layout.tsx` | Replace Sora/Inter/JetBrains with Newsreader/Public Sans/IBM Plex Mono. |
| `src/app/globals.css` | New warm-paper/green/rust values under the existing semantic names; 2px geometry; flat sheets; editorial type rules; ambient photo, frost strip, editorial split. Added missing `plate-ink` theme colours. |
| `src/components/layout/Sidebar.tsx` | Deep-green instrument rail, ivory type, rust active edge, numbered active index, square active tab. |
| `src/components/layout/Header.tsx` | Paper command bar, square identity mark, mono role text. |
| `src/components/ui/PageHeader.tsx` | Printed masthead with rust index, large serif subject and double rule; dot/pill removed. |
| `src/components/dashboard/admin/AdminDashboard.tsx` | Editorial header with ambient wash, taller desaturated theatre window, frosted plate strip, serif metric register. |
| `src/components/ui/Badge.tsx` | Rounded status pills replaced with square printed stamps (coloured left rule, mono uppercase, no fill). |
| `src/components/dashboard/DoctorDashboard.tsx` | Card-style header metrics and focus panel flattened into an open day plan; status stamps replace pills. |
| `src/components/dashboard/PatientDashboard.tsx` | Next-appointment and empty-state cards flattened into ruled sheets; status stamps replace pills. |
| `src/app/(workspace)/patients/PatientRegistry.tsx` | Circular monograms squared; contactability pills become stamps; filters become a segmented ruled control. |
| `src/app/(workspace)/doctors/DoctorDirectory.tsx` | Status capsules become border-rule stamps in both the index and the detail pane. |
| `src/app/(workspace)/doctors/[id]/DoctorDetail.tsx`, `src/app/(workspace)/patients/[id]/PatientDetail.tsx` | Circular identity monograms squared; remaining status capsules become stamps. |
| `src/components/dashboard/OTStaffDashboard.tsx` | Photograph removed; inverse typographic shift band; metric strip flattened; theatre cards converted to one ruled register. |
| `src/app/(workspace)/equipment/EquipmentManagement.tsx` | Plant photograph and table removed; readiness board and open register. |
| `src/app/(workspace)/ot-rooms/OtRoomManagement.tsx` | Room cards converted to a ruled two-column register; corridor photo replaced with `TheatreSchematic`; status pills replaced with mono labels. |
| `src/components/schedules/ScheduleDayHeader.tsx` | Floating theatre plate removed; masthead enlarged and ruled. |
| `src/app/(workspace)/doctors/DoctorDirectory.tsx` | Workforce photograph removed; printed no-portrait rule; serif headcount figures. |
| `src/app/(workspace)/patients/PatientRegistry.tsx` | Corridor privacy plate removed; typographic privacy statement. |
| `src/components/departments/DepartmentManagement.tsx` | Specialty photograph removed; glyph frontispiece and record head; duplicate record label removed. |
| `src/app/(workspace)/alerts/AlertsWorkspace.tsx` | Monitor photograph removed; full-width severity board. |
| `src/components/landing/clinical/*` | Hard-coded blue palette remapped to warm/green; images removed or replaced by schematic; rounded surfaces squared; preview image softened. |
| `src/components/auth/AuthShell.tsx` | Treatment-bay image blurred and desaturated; plate/Pexels footer replaced with a plain boundary caption. |

## Not changed

- `prisma/schema.prisma`
- API route handlers, services, repositories and authorization
- Authentication configuration, credentials and session model
- `package.json` and the lockfile — no dependency added or removed
- Route structure and public URLs
- Existing domain data and seed records

## Verification summary

| Gate | Result |
|---|---|
| TypeScript | pass |
| Changed-file ESLint | pass |
| Production build | pass (49/49 static pages) |
| Browser audit (54 page/viewports) | 0 broken images, 0 overflow, 0 missing alt, 0 console errors |
| Accessibility tests | 5/5 |
| Permissions tests | 5/5 |
| Reduced motion | animations disabled under forced preference |
| Domain record counts | unchanged |

One authentication attempt during verification failed with a database transaction timeout (`Unable to start a transaction in the given time`). A retry succeeded and the full sweep completed; this was an environment/database contention event, not an application regression.
