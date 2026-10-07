# MedOrch Project Status

## Executive Summary

MedOrch is an Operating Theatre (OT) management and surgical resource orchestration platform built with Next.js 16.3.6 (App Router), React 19, NextAuth v5, PostgreSQL, and Prisma ORM.

This document serves as the comprehensive, read-only implementation status baseline for the entire MedOrch repository as of October 2026. The findings herein are verified against active source code, Prisma migrations, and typecheck/build runs.

### Key Metrics & Status Summary
- **Application Build & Types**: Clean. `npm run lint` passes with 0 warnings/errors. `npx tsc --noEmit` and `npm run build` succeed cleanly across 18 static/dynamic routes.
- **Overall Implementation Completeness**: ~68% functional coverage across defined domains.
- **Completed Domains**:
  - **Authentication**: Credentials login, JWT session callbacks, bcrypt password hashing, and server/client session propagation are COMPLETE.
  - **Scheduling Core Engine**: Conflict detection, multi-entity availability validation, strict status lifecycle state machine, staff assignments, equipment assignments, and notes backend are COMPLETE.
- **Partial Domains**:
  - **Users**: Read-only listing and detail APIs/UI exist. User creation, editing, and status approval endpoints are absent. `/users` route lacks the application layout shell (`AppShell`).
  - **Patients**: Full CRUD backend exists (except delete), but there is NO dedicated frontend page or patient management interface.
  - **Doctors**: Full profile and activation status backend exists, but has a catch-block fallthrough defect in `POST /api/doctors` and NO frontend profile management UI.
  - **Departments**: Full CRUD backend exists with soft deletion, but NO frontend management UI.
  - **OT Rooms**: Full CRUD backend and status/active toggles exist; read-only grid on `/dashboard` exists, but NO dedicated `/ot-rooms` page exists (resulting in 404 when clicked from dashboard quick actions).
  - **Equipment**: Full CRUD backend and status lifecycle exist; summary widget on `/dashboard` exists, but NO dedicated `/equipment` page exists (resulting in 404 when clicked from dashboard quick actions).
  - **Scheduling Frontend**: High-quality list, filter, create/edit modal, and admin status lifecycle action dialogs are COMPLETE. However, detailed views (`/schedules/[id]`) and UI interfaces for managing schedule staff, equipment assignments, and clinical notes are genuinely absent.
  - **Alerts**: Full user-scoped notification engine, API, polling header notification drawer, and dashboard summary widget are COMPLETE. Alert creation is manual (no automatic event triggers on schedule lifecycle changes).
- **Missing Domains**:
  - **Audit Log Interface**: Auditing persistence and mutation interceptors exist across almost all domains, but there is NO query/read repository function, NO API endpoint, and NO frontend UI for viewing audit trails.
- **Verified Broken Functionality**:
  1. `POST /api/doctors` missing fallback error response in `catch` block (lines 53–83 of [`src/app/api/doctors/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/doctors/route.ts#L53-L83)).
  2. Request ID header typo `x-requesst-id` in [`src/lib/api/request-id.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/api/request-id.ts#L4).
  3. `updateScheduleNoteById` returns pre-update note object in [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L658).
  4. Broken navigation links in dashboard Quick Actions pointing to non-existent `/ot-rooms` and `/equipment` routes ([`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L32-L43)).
  5. Unstyled/unwrapped `/users` page lacking [`AppShell`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/AppShell.tsx) ([`src/app/(dashboard)/users/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/(dashboard)/users/page.tsx#L1-L22)).
- **Highest-Priority Next Implementation Task**: Fix the response fallthrough bug in [`POST /api/doctors`](file:///c:/Users/patel/Desktop/medorch/src/app/api/doctors/route.ts#L53-L83) to ensure 500/409 errors are correctly handled.

---

## Completion Matrix

| Domain | Feature | Status | Evidence | Remaining Work |
|---|---|---|---|---|
| **App Router** | Root Layout & Providers | COMPLETE | [`src/app/layout.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/layout.tsx), [`src/providers/SessionProvider.tsx`](file:///c:/Users/patel/Desktop/medorch/src/providers/SessionProvider.tsx) | None |
| **App Router** | Global Loading / Error / 404 | COMPLETE | [`src/app/loading.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/loading.tsx), [`src/app/error.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/error.tsx), [`src/app/not-found.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/not-found.tsx) | None |
| **App Router** | Dashboard Page | COMPLETE | [`src/app/dashboard/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/dashboard/page.tsx) | None |
| **App Router** | Schedules Page | COMPLETE | [`src/app/schedules/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/schedules/page.tsx) | None |
| **App Router** | Users Page Layout | PARTIAL | [`src/app/(dashboard)/users/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/(dashboard)/users/page.tsx) | Missing `AppShell` wrapping; missing `(dashboard)/layout.tsx` |
| **App Router** | OT Rooms Page (`/ot-rooms`) | MISSING | Linked in [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L32) | Create route & management page |
| **App Router** | Equipment Page (`/equipment`) | MISSING | Linked in [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L43) | Create route & registry page |
| **App Router** | Schedule Detail Page (`/schedules/[id]`) | MISSING | Backend endpoints exist in `src/app/api/schedules/[id]/**` | Create route for staff, equipment, & notes |
| **Auth** | Credentials Authentication | COMPLETE | [`src/auth.ts`](file:///c:/Users/patel/Desktop/medorch/src/auth.ts), [`src/components/auth/LoginForm.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/auth/LoginForm.tsx) | None |
| **Auth** | Password Hashing & Verification | COMPLETE | [`src/lib/auth/password.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/password.ts) (bcrypt 12 rounds) | None |
| **Auth** | Role & Permission Server Guards | COMPLETE | [`src/lib/auth/authorization.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/authorization.ts) (`requireAuth`, `requireRole`, `requirePermission`) | None |
| **Auth** | API Authentication Helper | COMPLETE | [`src/lib/api/auth.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/api/auth.ts) (`authorizeApiRole`) | None |
| **Users** | User Listing & Filters UI | COMPLETE | [`src/components/users/UserList.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/users/UserList.tsx), [`src/components/users/UserFilters.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/users/UserFilters.tsx) | None |
| **Users** | User API (List & Detail) | COMPLETE | [`src/app/api/users/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/users/route.ts), [`src/app/api/users/[id]/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/users/[id]/route.ts) | None |
| **Users** | User Creation / Modification | MISSING | [`src/modules/users/user.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/users/user.validation.ts) has schema, but no API/UI | Create `POST /api/users`, `PATCH /api/users/[id]` |
| **Patients** | Patient Backend (CRUD) | COMPLETE | [`src/modules/patients/patient.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.service.ts), [`src/app/api/patients/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/patients/route.ts) | Fix direct patient field selection in repository |
| **Patients** | Patient Frontend UI | MISSING | Only fetched in [`src/components/schedules/SchedulePage.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/SchedulePage.tsx#L86) for dropdowns | Patient registry page & modal form |
| **Doctors** | Doctor Profiles Backend | PARTIAL | [`src/modules/doctors/doctor.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.service.ts), [`src/app/api/doctors/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/doctors/route.ts) | Fix unhandled `catch` in `POST /api/doctors` |
| **Doctors** | Doctor Management UI | MISSING | Only fetched in [`src/components/schedules/SchedulePage.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/SchedulePage.tsx#L87) for dropdowns | Doctor roster page & approval UI |
| **Departments** | Department Backend | COMPLETE | [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts), [`src/app/api/departments/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/departments/route.ts) | Fix `headDoctor` parameter type in service |
| **Departments** | Department Management UI | MISSING | Only fetched in [`src/components/schedules/SchedulePage.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/SchedulePage.tsx#L84) | Department settings & directory UI |
| **OT Rooms** | OT Room Backend | COMPLETE | [`src/modules/ot-rooms/ot-room.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.service.ts), [`src/app/api/ot-rooms/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/ot-rooms/route.ts) | None |
| **OT Rooms** | OT Room Status & Active APIs | COMPLETE | [`src/app/api/ot-rooms/[id]/status/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/ot-rooms/[id]/status/route.ts), [`src/app/api/ot-rooms/[id]/active/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/ot-rooms/[id]/active/route.ts) | None |
| **OT Rooms** | Dashboard OT Rooms Grid | COMPLETE | [`src/components/dashboard/OTRoomsGrid.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/OTRoomsGrid.tsx) | None |
| **OT Rooms** | Dedicated OT Room Management Page | MISSING | Link in [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L32) dead-ends | Create `/ot-rooms` page & status toggle UI |
| **Equipment** | Equipment Backend | COMPLETE | [`src/modules/equipment/equipment.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.service.ts), [`src/app/api/equipment/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/equipment/route.ts) | Sync status on schedule assign/release |
| **Equipment** | Dashboard Equipment Counter | COMPLETE | [`src/components/dashboard/OperationalOverview.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/OperationalOverview.tsx) | None |
| **Equipment** | Dedicated Equipment Registry Page | MISSING | Link in [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L43) dead-ends | Create `/equipment` page |
| **Scheduling** | Schedule Creation Backend | COMPLETE | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts) (`createScheduleWithValidation`) | None |
| **Scheduling** | Schedule Conflict Detection | COMPLETE | [`src/modules/schedules/schedule.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.repository.ts) (`findScheduleConflicts`) | None |
| **Scheduling** | Schedule Status State Machine | COMPLETE | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts) (`updateScheduleStatusById`) | None |
| **Scheduling** | Schedule Staff Backend | COMPLETE | [`src/app/api/schedules/[id]/staff/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/schedules/[id]/staff/route.ts), [`src/app/api/schedules/[id]/staff/[staffId]/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/schedules/[id]/staff/[staffId]/route.ts) | UI for staff assignment |
| **Scheduling** | Schedule Equipment Backend | COMPLETE | [`src/app/api/schedules/[id]/equipment/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/schedules/[id]/equipment/route.ts), [`src/app/api/schedules/[id]/equipment/[equipmentId]/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/schedules/[id]/equipment/[equipmentId]/route.ts) | UI for equipment assignment & release |
| **Scheduling** | Schedule Notes Backend | COMPLETE | [`src/app/api/schedules/[id]/notes/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/schedules/[id]/notes/route.ts), [`src/app/api/schedules/[id]/notes/[noteId]/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/schedules/[id]/notes/[noteId]/route.ts) | Fix return in `updateScheduleNoteById`; UI for notes |
| **Scheduling** | Schedule List & Filters UI | COMPLETE | [`src/components/schedules/ScheduleList.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleList.tsx), [`src/components/schedules/ScheduleFilters.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleFilters.tsx) | None |
| **Scheduling** | Schedule Form Modal (Create/Edit) | COMPLETE | [`src/components/schedules/ScheduleForm.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleForm.tsx) | Add staff/equipment steps or link to detail |
| **Scheduling** | Schedule Status Actions UI | COMPLETE | [`src/components/schedules/ScheduleStatusActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleStatusActions.tsx) | None |
| **Scheduling** | Schedule Detail & Assignments UI | MISSING | No UI for staff, equipment release, or notes | Create `/schedules/[id]` page or drawer |
| **Alerts** | Alerts Notification Engine | COMPLETE | [`src/modules/alerts/alerts.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/alerts/alerts.service.ts), [`src/app/api/alerts/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/alerts/route.ts) | None |
| **Alerts** | Alert Center UI (Dropdown) | COMPLETE | [`src/components/alerts/AlertCenter.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/alerts/AlertCenter.tsx) (header bell, 30s polling) | None |
| **Alerts** | Dashboard Alert Summary Widget | COMPLETE | [`src/components/dashboard/AlertsSummaryWidget.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/AlertsSummaryWidget.tsx) | None |
| **Audit** | Audit Logging Mutation Pipeline | COMPLETE | [`src/modules/audit/audit.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/audit/audit.service.ts) (`recordAudit`) invoked across modules | Audit login/logout & alert updates |
| **Audit** | Audit Log Query API & UI | MISSING | No `GET /api/audit` route and no UI component | Build audit log inquiry API & audit trail UI |

---

## Authentication & Authorization

### Authentication Architecture
- **NextAuth Integration**: Configured in [`src/auth.ts`](file:///c:/Users/patel/Desktop/medorch/src/auth.ts) using NextAuth `v5.0.0-beta.32` and credentials provider.
- **Credential Validation**: Trims and lowercases email; looks up `User` via Prisma.
- **Account Status Guard**: Strict rejection if `user.status !== "ACTIVE"`. Users with `PENDING`, `SUSPENDED`, or `REJECTED` are denied authentication before password checking.
- **Password Verification**: Uses `bcryptjs.compare()` against the stored hash in [`src/lib/auth/password.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/password.ts#L9).
- **Session Strategy**: Pure JWT (`session.strategy = "jwt"`). The `jwt` callback attaches `id`, `role`, and `status`. The `session` callback copies these into `session.user`. Type safety is extended in [`src/types/next-auth.d.ts`](file:///c:/Users/patel/Desktop/medorch/src/types/next-auth.d.ts).
- **Client Session Context**: Root layout [`src/app/layout.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/layout.tsx#L18) wraps all children in [`src/providers/SessionProvider.tsx`](file:///c:/Users/patel/Desktop/medorch/src/providers/SessionProvider.tsx), which wraps NextAuth's `NextAuthSessionProvider`.
- **Sign In / Out UX**:
  - [`src/components/auth/LoginForm.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/auth/LoginForm.tsx) handles sign-in with client-side error rendering and redirects to `/dashboard`.
  - [`src/components/layout/Header.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/Header.tsx#L85) provides a sign-out button that calls `signOut({ callbackUrl: '/login' })`.

### Authorization Architecture
- **Roles**: `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT`.
- **Page Guards**: [`src/lib/auth/authorization.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/authorization.ts) provides:
  - `requireAuth()`: Redirects unauthenticated requests to `/login`.
  - `requireRole(roles)`: Calls `requireAuth()`, validates user's role against allowed roles, redirects disallowed roles to `/unauthorized`.
  - `requirePermission(permission)`: Consults [`src/lib/auth/permission.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/permission.ts) and redirects unauthorized users to `/unauthorized`.
- **API Guards**:
  - `requireApiRole(roles)`: Reads session and checks role; returns `session` or `null`.
  - `authorizeApiRole(roles, requestId)` ([`src/lib/api/auth.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/api/auth.ts#L6)): Returns `{ session, response }`. If null, `response` contains a standard `apiError("Unauthorized", 401, undefined, requestId)`.
- **Discrepancy Between Fine-Grained Permissions & API Enforcement**:
  - [`src/lib/auth/permission.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/permission.ts) defines `ROLE_PERMISSIONS` (e.g. `DOCTOR` and `OT_STAFF` have `"schedules:manage"`, `ADMIN` has `"users:manage"`).
  - API routes **do not** consult `ROLE_PERMISSIONS`. They exclusively use hardcoded role arrays in `authorizeApiRole(...)`.
  - For example, `POST /api/schedules` permits only `ADMIN`. `DOCTOR` and `OT_STAFF` are rejected with 401, despite possessing `"schedules:manage"` in `ROLE_PERMISSIONS`.
- **Duplicate Permissions File**:
  - [`src/lib/auth/permissions.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/permissions.ts) contains separate helper functions `hasRole`, `isActiveUser`, and `canAccessRole`. It is largely unreferenced throughout the project.

---

## Users

### Database
- **Prisma Model**: `User` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L86-L111).
- **Fields**: `id` (UUID), `email` (unique), `passwordHash`, `name`, `phone`, `role` (enum: PATIENT default), `status` (enum: PENDING default), `approvedAt`, `createdAt`, `updatedAt`.
- **Relations**: 1:1 `DoctorProfile?`, 1:1 `Patient?`, `createdSchedules`, `surgeonSchedules`, `scheduleStaff`, `scheduleNotes`, `alerts`, `auditLogs`.
- **Indexes**: `@@index([role])`, `@@index([status])`, `@@index([createdAt])`.

### Backend
- **Repository**: [`src/modules/users/user.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/users/user.repository.ts) provides `findUsers`, `findUserById`, `findUserByEmail`. Repositories explicitly project safe fields, omitting `passwordHash`.
- **Service**: [`src/modules/users/user.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/users/user.service.ts) delegates to repository.
- **Validation**: [`src/modules/users/user.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/users/user.validation.ts) provides `userIdSchema` and `createUserSchema`.
- **API Endpoints**:
  - `GET /api/users`: Restricted to `ADMIN`.
  - `GET /api/users/:id`: Restricted to `ADMIN`.
- **Missing Backend Operations**: No `POST /api/users`, `PATCH /api/users/:id`, `PATCH /api/users/:id/status`, or deletion handlers exist.

### Frontend
- **Page Route**: [`src/app/(dashboard)/users/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/(dashboard)/users/page.tsx) protected with `requireRole("ADMIN")`.
- **Components**:
  - [`src/components/users/UserList.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/users/UserList.tsx): Fetches `/api/users`, renders a searchable table with client-side filtering.
  - [`src/components/users/UserFilters.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/users/UserFilters.tsx): Search, role dropdown, status dropdown.
  - [`src/components/users/UserStatusBadge.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/users/UserStatusBadge.tsx): Status badge rendering.
- **Layout Issue**: [`src/app/(dashboard)/users/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/(dashboard)/users/page.tsx) renders naked `<main>` without [`AppShell`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/AppShell.tsx) (unlike `/dashboard` and `/schedules`).

---

## Patients

### Database
- **Prisma Model**: `Patient` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L129-L147).
- **Fields**: `id`, `patientCode` (unique), `userId` (unique optional, `SetNull` onDelete), `name`, `email`, `phone`, `dateOfBirth`, `gender`, `medicalHistory`, timestamps.
- **Relations**: Optional linked `User`, `schedules` relation.
- **Indexes**: `@@index([name])`, `@@index([phone])`.

### Backend
- **Repository**: [`src/modules/patients/patient.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.repository.ts) provides `findPatients`, `findPatientById`, `createPatientRecord`, `updatePatient`.
  - *Repository Limitation*: `findPatients` and `findPatientById` select `patientCode` and `user` fields (`name`, `email`, `phone`), but fail to select `name`, `email`, `phone` directly from the `Patient` row itself if `userId` is unlinked.
- **Service**: [`src/modules/patients/patient.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.service.ts) implements `getPatients`, `getPatientById`, `createPatient`, and `updatePatientById`. Mutations call `recordAudit` for `CREATE` and `UPDATE`.
- **Validation**: [`src/modules/patients/patient.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.validation.ts) provides `patientIdSchema`, `createPatientSchema`, `updatePatientSchema`.
- **API Endpoints**:
  - `GET /api/patients`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `POST /api/patients`: Allowed for `ADMIN`.
  - `GET /api/patients/:id`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `PATCH /api/patients/:id`: Allowed for `ADMIN`.

### Frontend
- **Completeness**: PARTIAL / MISSING UI.
- No dedicated `/patients` route or patient management interface exists. Patients are only loaded via `apiClient.get('/api/patients')` in [`src/components/schedules/SchedulePage.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/SchedulePage.tsx#L86) to populate the patient dropdown in the schedule form.

---

## Doctors

### Database
- **Prisma Model**: `DoctorProfile` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L113-L127).
- **Fields**: `id`, `userId` (unique, `Cascade` onDelete), `departmentId` (optional, `SetNull` onDelete), `specialization`, `licenseNumber` (unique optional), timestamps.
- **Relations**: 1:1 `User`, `Department?` membership, `headedDepartment` relation.
- **Indexes**: `@@index([departmentId])`.

### Backend
- **Repository**: [`src/modules/doctors/doctor.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.repository.ts) provides `findDoctors`, `findDoctorById`, `createDoctorProfile`, `findUserForDoctorCreation`, `updateDoctorProfile`, `updateDoctorUserStatus`.
- **Service**: [`src/modules/doctors/doctor.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.service.ts) implements `getDoctors`, `getDoctorById`, `createDoctor` (validates target user has `DOCTOR` role and lacks existing profile), `updateDoctor`, and `updateDoctorStatus` (updates user status and stamps `approvedAt` on `ACTIVE`). Mutations call `recordAudit`.
- **Validation**: [`src/modules/doctors/doctor.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.validation.ts) provides `doctorIdSchema`, `createDoctorSchema`, `updateDoctorSchema`, `updateDoctorStatusSchema`.
- **API Endpoints**:
  - `GET /api/doctors`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `POST /api/doctors`: Allowed for `ADMIN`. **CRITICAL DEFECT**: The `catch` block on lines 53–83 only handles three known error strings (`USER_NOT_FOUND`, `USER_NOT_DOCTOR`, `DOCTOR_PROFILE_EXISTS`). Any other error (including database unique constraint violations or Prisma errors) falls off the end of the handler without returning any `NextResponse`, violating Next.js App Router route handler contracts.
  - `GET /api/doctors/:id`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `PATCH /api/doctors/:id`: Allowed for `ADMIN`.
  - `PATCH /api/doctors/:id/status`: Allowed for `ADMIN`.

### Frontend
- **Completeness**: PARTIAL / MISSING UI.
- No dedicated `/doctors` page or profile management interface exists. Doctors are only fetched in [`src/components/schedules/SchedulePage.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/SchedulePage.tsx#L87) to populate the surgeon dropdown.

---

## Departments

### Database
- **Prisma Model**: `Department` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L149-L165).
- **Fields**: `id`, `name` (unique), `description`, `headDoctorId` (unique optional, `SetNull` onDelete), `isActive` (boolean, default true), timestamps.
- **Relations**: `headDoctor` (`DoctorProfile?`), `doctors`, `otRooms`, `equipment`, `schedules`.
- **Indexes**: `@@index([isActive])`.

### Backend
- **Repository**: [`src/modules/departments/department.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.repository.ts) provides `findDepartments`, `findDepartmentById`, `createDepartment`, `updateDepartment`. Includes head doctor details and counts of doctors, OT rooms, equipment, schedules.
- **Service**: [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts) implements `getDepartments`, `getDepartmentById`, `createNewDepartment`, `updateExistingDepartment`, and `deactivateDepartment`. Mutations call `recordAudit`.
  - *TypeScript Parameter Typo*: In `createNewDepartment` line 22, the argument is typed `headDoctor?: string` instead of `headDoctorId?: string`.
- **Validation**: [`src/modules/departments/department.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.validation.ts) provides `departmentIdSchema`, `createDepartmentSchema`, `updateDepartmentSchema`.
- **API Endpoints**:
  - `GET /api/departments`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `POST /api/departments`: Allowed for `ADMIN`.
  - `GET /api/departments/:id`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `PATCH /api/departments/:id`: Allowed for `ADMIN`.
  - `DELETE /api/departments/:id`: Allowed for `ADMIN`. Implements soft deactivation (`isActive: false`), returning 409 if already inactive.

### Frontend
- **Completeness**: PARTIAL / MISSING UI.
- No dedicated `/departments` page or department administration UI exists. Department data is fetched only for schedule filtering and form selection.

---

## OT Rooms

### Database
- **Prisma Model**: `OTRoom` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L167-L184).
- **Fields**: `id`, `name`, `code` (unique), `departmentId` (required, `Restrict` onDelete), `capacity` (Int?), `status` (enum `OTRoomStatus`: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `DISABLED`), `isActive` (boolean, default true), timestamps.
- **Indexes**: `@@index([departmentId])`, `@@index([status])`, `@@index([isActive])`.

### Backend
- **Repository**: [`src/modules/ot-rooms/ot-room.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.repository.ts) provides `findOTRooms`, `findOTRoomById`, `createOTRoom`, `updateOTRoom`, `updateOTRoomStatus`, `updateOTRoomActive`.
- **Service**: [`src/modules/ot-rooms/ot-room.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.service.ts) implements `getOTRooms`, `getOTRoomById`, `createOTRoom`, `updateOTRoomById`, `updateOTRoomStatusById`, and `updateOTRoomActiveById`. Mutations call `recordAudit`.
- **Validation**: [`src/modules/ot-rooms/ot-room.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.validation.ts) provides schemas for room ID, create, update, status update, and active toggle.
- **API Endpoints**:
  - `GET /api/ot-rooms`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `POST /api/ot-rooms`: Allowed for `ADMIN`.
  - `GET /api/ot-rooms/:id`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `PATCH /api/ot-rooms/:id`: Allowed for `ADMIN`.
  - `PATCH /api/ot-rooms/:id/status`: Allowed for `ADMIN`.
  - `PATCH /api/ot-rooms/:id/active`: Allowed for `ADMIN`.

### Frontend
- **Completeness**: PARTIAL.
- **Implemented UI**: [`src/components/dashboard/OTRoomsGrid.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/OTRoomsGrid.tsx) displays real-time room status cards, badges, and capacity on `/dashboard`.
- **Missing UI & Broken Link**: [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L32) links to `/ot-rooms` for `ADMIN` and `OT_STAFF`, but no `/ot-rooms` page exists in the App Router, leading to a 404 error.

---

## Equipment

### Database
- **Prisma Model**: `Equipment` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L186-L205).
- **Fields**: `id`, `name`, `category`, `serialNumber` (unique optional), `status` (enum `EquipmentStatus`: `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED`), `departmentId` (optional, `SetNull` onDelete), `maintenanceDueAt`, timestamps.
- **Indexes**: `@@index([category])`, `@@index([status])`, `@@index([departmentId])`, `@@index([maintenanceDueAt])`.

### Backend
- **Repository**: [`src/modules/equipment/equipment.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.repository.ts) provides `findEquipment`, `findEquipmentById`, `createEquipment`, `updateEquipment`, `updateEquipmentStatus`.
- **Service**: [`src/modules/equipment/equipment.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.service.ts) implements `getEquipment`, `getEquipmentById`, `createEquipment`, `updateEquipmentById`, `updateEquipmentStatusById`. Mutations call `recordAudit`.
- **Validation**: [`src/modules/equipment/equipment.validation.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.validation.ts) provides schemas for equipment ID, create, update, and status update.
- **API Endpoints**:
  - `GET /api/equipment`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `POST /api/equipment`: Allowed for `ADMIN`.
  - `GET /api/equipment/:id`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `PATCH /api/equipment/:id`: Allowed for `ADMIN`.
  - `PATCH /api/equipment/:id/status`: Allowed for `ADMIN`.

### Frontend
- **Completeness**: PARTIAL.
- **Implemented UI**: Equipment availability count is rendered in the overview widget on `/dashboard` ([`src/components/dashboard/OperationalOverview.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/OperationalOverview.tsx#L120)).
- **Missing UI & Broken Link**: [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L43) links to `/equipment` for `ADMIN`, `DOCTOR`, and `OT_STAFF`, but no `/equipment` page exists in the App Router, leading to a 404 error.

---

## Scheduling

### Database
- **Prisma Model**: `Schedule` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L206-L243).
- **Fields**: `id`, `patientId`, `departmentId`, `otRoomId`, `surgeonId` (User), `createdById` (User), `procedure`, `scheduledDate`, `startTime`, `endTime`, `status` (`ScheduleStatus`), `priority` (`SchedulePriority`: ELECTIVE default), `clinicalNotes`, timestamps.
- **Relations**: Foreign keys to `Patient`, `Department`, `OTRoom`, `User` (Surgeon), `User` (CreatedBy) all have `onDelete: Restrict`.
- **Child Models**:
  - `ScheduleStaff`: join model with `userId`, `role` (`StaffRole`: `SURGEON`, `NURSE`, `ANESTHETIST`, `TECHNICIAN`, `OTHER`), `assignedAt`. Constraint `@@unique([scheduleId, userId, role])`.
  - `ScheduleEquipment`: join model with `equipmentId`, `assignedAt`, `releasedAt`. Constraint `@@unique([scheduleId, equipmentId])`.
  - `ScheduleNote`: child model with `authorId` (User), `content`, timestamps.
  - Cascade deletion configured on all child records (`onDelete: Cascade` when `Schedule` is deleted).
- **Indexes**: Indexed on `patientId`, `departmentId`, `otRoomId`, `surgeonId`, `createdById`, `scheduledDate`, composite `[startTime, endTime]`, `status`, and `priority`.

### Deep Verification of Scheduling Logic

#### 1. Creation & Update Validation
- Implemented in [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts) (`createScheduleWithValidation`, `updateScheduleWithValidation`).
- **Patient Validation**: Verifies patient exists (`findPatientById`); rejects with `PATIENT_NOT_FOUND` (400).
- **Department Validation**: Verifies department exists (`findDepartmentById`) and `isActive === true`; rejects inactive departments with `DEPARTMENT_INACTIVE` (400).
- **OT Room Validation**: Verifies OT room exists, `isActive === true`, `otRoom.departmentId === data.departmentId` (rejects with `OT_ROOM_DEPARTMENT_MISMATCH`), and room status is not `MAINTENANCE` or `DISABLED` (rejects with `OT_ROOM_MAINTENANCE` or `OT_ROOM_DISABLED`).
- **Surgeon Validation**: Verifies surgeon user exists, `role === "DOCTOR"` (rejects with `INVALID_SURGEON`), and `status === "ACTIVE"` (rejects with `SURGEON_INACTIVE`).
- **Date/Time Handling**: `createScheduleSchema` enforces `endTime > startTime`. Server service verifies `endTime > startTime` on updates (`INVALID_TIME_RANGE`).

#### 2. Conflict Detection
- Implemented in [`src/modules/schedules/schedule.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.repository.ts#L340-L384) (`findScheduleConflicts`).
- Excludes terminal states: `status: { notIn: ["CANCELLED", "COMPLETED"] }`.
- Overlap predicate: `existing.startTime < requested.endTime && existing.endTime > requested.startTime`.
- Checks both the requested `otRoomId` and `surgeonId`.
- On conflict, service distinguishes room vs. surgeon conflict and throws `OT_ROOM_SCHEDULE_CONFLICT` or `SURGEON_SCHEDULE_CONFLICT`.
- On update, `excludeScheduleId: id` prevents false self-conflicts.

#### 3. Status Transitions & State Machine
- Enforced in `updateScheduleStatusById` ([`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L101-L134)).
- Allowed graph:
  - `SCHEDULED` → `CONFIRMED`, `CANCELLED`
  - `CONFIRMED` → `IN_PROGRESS`, `DELAYED`, `CANCELLED`
  - `IN_PROGRESS` → `COMPLETED`, `DELAYED`
  - `DELAYED` → `CONFIRMED`, `IN_PROGRESS`, `CANCELLED`
  - `COMPLETED` → none (terminal)
  - `CANCELLED` → none (terminal)
- Invalid transitions throw `INVALID_STATUS_TRANSITION` (returns HTTP 409).
- Authorization: `PATCH /api/schedules/:id/status` is restricted to `ADMIN`.

#### 4. Staff Assignment
- Routes: `GET /api/schedules/:id/staff` (ADMIN/DOCTOR/OT_STAFF), `POST /api/schedules/:id/staff` (ADMIN), `DELETE /api/schedules/:id/staff/:staffId` (ADMIN).
- Validates user exists and has `status === "ACTIVE"`.
- Records audit logs for assignment (`CREATE`) and removal (`DELETE`).

#### 5. Equipment Assignment & Release
- Routes: `GET /api/schedules/:id/equipment` (ADMIN/DOCTOR/OT_STAFF), `POST /api/schedules/:id/equipment` (ADMIN), `PATCH /api/schedules/:id/equipment/:equipmentId` (ADMIN).
- Assignment verifies equipment exists and `status === "AVAILABLE"`.
- Release sets `releasedAt: new Date()`.
- Audit logs are recorded on assignment (`CREATE`) and release (`UPDATE`).
- *Known Behavior*: Assigning equipment does not update the `status` column on `Equipment` itself; availability is determined by active join rows and explicit equipment status.

#### 6. Schedule Notes
- Routes: `GET /api/schedules/:id/notes` (ADMIN/DOCTOR/OT_STAFF), `POST /api/schedules/:id/notes` (ADMIN/DOCTOR/OT_STAFF), `PATCH /api/schedules/:id/notes/:noteId` (author check), `DELETE /api/schedules/:id/notes/:noteId` (author check).
- Ownership: Updates and deletes enforce `note.authorId === requestingUser.id`. (ADMIN does not override this).
- *Verified Bug*: `updateScheduleNoteById` calls `updateScheduleNote(noteId, content)` but returns the pre-update `note` object on line 658 of [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L658).

#### 7. Frontend Schedule Implementation
- [`src/components/schedules/SchedulePage.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/SchedulePage.tsx): Main authenticated view. Fetches schedules and options concurrently. Implements browser-side filtering by status, priority, date, department, room, and search string.
- [`src/components/schedules/ScheduleList.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleList.tsx): List container with loading, error, and empty states.
- [`src/components/schedules/ScheduleCard.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleCard.tsx): Detailed card showing procedure, badges, patient, surgeon, department, room, timing, and clinical notes.
- [`src/components/schedules/ScheduleStatusActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleStatusActions.tsx): Renders transition buttons (Confirm, Cancel, Start Procedure, Mark Delayed, Mark Complete) with confirmation modal dialogs and optimistic cache updates. Only shown to `ADMIN`.
- [`src/components/schedules/ScheduleForm.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleForm.tsx): Modal form for create and edit. Filters rooms dynamically when department is chosen. Validates dates and time order.
- **Frontend Gaps**:
  - Staff assignment, equipment assignment, and notes are NOT rendered on `ScheduleCard` and cannot be managed anywhere in the UI.
  - No `/schedules/[id]` detail page exists.

---

## Alerts

### Database
- **Prisma Model**: `Alert` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L290-L309).
- **Fields**: `id`, `userId` (cascade delete), `scheduleId` (optional, cascade delete), `type` (`SCHEDULE`, `RESOURCE`, `SYSTEM`, `MAINTENANCE`), `title`, `message`, `severity` (`INFO`, `WARNING`, `CRITICAL`), `isRead` (boolean, default false), `readAt`, `createdAt`.
- **Indexes**: `@@index([userId, isRead])`, `@@index([scheduleId])`, `@@index([severity])`, `@@index([createdAt])`.

### Backend
- **Repository**: [`src/modules/alerts/alerts.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/alerts/alerts.repository.ts) provides `findAlerts`, `findAlertById`, `createAlert`, `updateAlert`, `markAlertAsRead`, `markAllAlertsAsReadForUser`, `deleteAlert`.
- **Service**: [`src/modules/alerts/alerts.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/alerts/alerts.service.ts) implements data ownership:
  - Non-`ADMIN` users are restricted to alerts where `alert.userId === session.user.id`.
  - Validates recipient user existence; validates schedule existence if `scheduleId` is provided.
  - Audit logging recorded on `createAlert` and `deleteAlertById`.
- **API Endpoints**:
  - `GET /api/alerts`: Allowed for all 4 roles. Supports query filters (`userId`, `isRead`, `severity`, `type`).
  - `POST /api/alerts`: Allowed for `ADMIN`, `DOCTOR`, `OT_STAFF`.
  - `GET /api/alerts/:id`: Allowed for all 4 roles (with ownership check).
  - `PATCH /api/alerts/:id`: Allowed for all 4 roles (with ownership check).
  - `DELETE /api/alerts/:id`: Allowed for all 4 roles (with ownership check).
  - `PATCH /api/alerts/:id/read`: Allowed for all 4 roles (with ownership check).
  - `PATCH /api/alerts/read-all`: Allowed for all 4 roles (with ownership check).

### Frontend
- **Header Component**: [`src/components/alerts/AlertCenter.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/alerts/AlertCenter.tsx) mounted in [`src/components/layout/Header.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/Header.tsx#L64).
  - Displays unread counter badge.
  - Dropdown drawer listing recent alerts with severity tags.
  - "Mark read", "Mark all as read", and "Delete" interactive actions.
  - Background polling every 30 seconds.
- **Dashboard Component**: [`src/components/dashboard/AlertsSummaryWidget.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/AlertsSummaryWidget.tsx) displays critical & unread alerts on `/dashboard`.

---

## Audit

### Database
- **Prisma Model**: `AuditLog` in [`prisma/schema.prisma`](file:///c:/Users/patel/Desktop/medorch/prisma/schema.prisma#L311-L327).
- **Fields**: `id`, `userId` (`SetNull` onDelete), `action` (enum `AuditAction`: `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `APPROVE`, `REJECT`, `CANCEL`, `COMPLETE`), `entity` (string), `entityId` (string), `description` (string?), `metadata` (Json?), `createdAt`.
- **Indexes**: `@@index([userId])`, `@@index([entity, entityId])`, `@@index([action])`, `@@index([createdAt])`.

### Mutation Logging Census
| Domain | Action | Logged? | Action Used | File Reference |
|---|---|---|---|---|
| Patients | Create | Yes | `CREATE` | [`src/modules/patients/patient.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.service.ts#L26) |
| Patients | Update | Yes | `UPDATE` | [`src/modules/patients/patient.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.service.ts#L60) |
| Doctors | Create | Yes | `CREATE` | [`src/modules/doctors/doctor.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.service.ts#L45) |
| Doctors | Update | Yes | `UPDATE` | [`src/modules/doctors/doctor.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.service.ts#L73) |
| Doctors | Status Change | Yes | `UPDATE` | [`src/modules/doctors/doctor.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/doctors/doctor.service.ts#L91) |
| Departments | Create | Yes | `CREATE` | [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts#L29) |
| Departments | Update | Yes | `UPDATE` | [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts#L52) |
| Departments | Deactivate | Yes | `UPDATE` | [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts#L71) |
| OT Rooms | Create | Yes | `CREATE` | [`src/modules/ot-rooms/ot-room.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.service.ts#L24) |
| OT Rooms | Update | Yes | `UPDATE` | [`src/modules/ot-rooms/ot-room.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.service.ts#L56) |
| OT Rooms | Status Change | Yes | `UPDATE` | [`src/modules/ot-rooms/ot-room.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.service.ts#L133) |
| OT Rooms | Active Toggle | Yes | `UPDATE` | [`src/modules/ot-rooms/ot-room.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/ot-rooms/ot-room.service.ts#L160) |
| Equipment | Create | Yes | `CREATE` | [`src/modules/equipment/equipment.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.service.ts#L30) |
| Equipment | Update | Yes | `UPDATE` | [`src/modules/equipment/equipment.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.service.ts#L60) |
| Equipment | Status Change | Yes | `UPDATE` | [`src/modules/equipment/equipment.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/equipment/equipment.service.ts#L87) |
| Schedules | Create | Yes | `CREATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L263) |
| Schedules | Update | Yes | `UPDATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L407) |
| Schedules | Status Transition | Yes | `COMPLETE` / `CANCEL` / `UPDATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L145) |
| Schedules | Assign Staff | Yes | `CREATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L470) |
| Schedules | Remove Staff | Yes | `DELETE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L492) |
| Schedules | Assign Equipment | Yes | `CREATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L548) |
| Schedules | Release Equipment | Yes | `UPDATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L571) |
| Schedules | Create Note | Yes | `CREATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L615) |
| Schedules | Update Note | Yes | `UPDATE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L647) |
| Schedules | Delete Note | Yes | `DELETE` | [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L677) |
| Alerts | Create Alert | Yes | `CREATE` | [`src/modules/alerts/alerts.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/alerts/alerts.service.ts#L71) |
| Alerts | Delete Alert | Yes | `DELETE` | [`src/modules/alerts/alerts.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/alerts/alerts.service.ts#L179) |
| Alerts | Update / Mark Read | **No** | None | Not logged |
| Auth | Login / Logout | **No** | None | Enum values `LOGIN` / `LOGOUT` exist, but NextAuth never logs them |

### Audit Module Gaps
- **No Read Operations**: [`src/modules/audit/audit.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/audit/audit.repository.ts) only implements `createAuditLog`. No query or filtering functions exist.
- **No API Endpoint**: No `GET /api/audit` or `GET /api/audit-logs` endpoint exists.
- **No Frontend**: No audit trail page or component exists in the application.

---

## API Inventory

All API endpoints reside under `src/app/api/**/route.ts` and return uniform `{ success, data }` or `{ success: false, message, details?, requestId? }` envelopes.

| Method | Endpoint | Allowed Roles | Service Function | Validation Schema | Notes |
|---|---|---|---|---|---|
| `GET`, `POST` | `/api/auth/[...nextauth]` | Public | NextAuth handler | N/A | NextAuth routes |
| `GET` | `/api/users` | `ADMIN` | `getUsers` | None | Returns user list sans password |
| `GET` | `/api/users/:id` | `ADMIN` | `getUserById` | `userIdSchema` | Returns user detail sans password |
| `GET` | `/api/departments` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getDepartments` | None | Includes doctor & room counts |
| `POST` | `/api/departments` | `ADMIN` | `createNewDepartment` | `createDepartmentSchema` | Rejects duplicate name (409) |
| `GET` | `/api/departments/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getDepartmentById` | `departmentIdSchema` | Full relations |
| `PATCH` | `/api/departments/:id` | `ADMIN` | `updateExistingDepartment` | `updateDepartmentSchema` | Rejects duplicate name (409) |
| `DELETE` | `/api/departments/:id` | `ADMIN` | `deactivateDepartment` | `departmentIdSchema` | Soft delete (`isActive: false`) |
| `GET` | `/api/doctors` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getDoctors` | None | Includes user & department |
| `POST` | `/api/doctors` | `ADMIN` | `createDoctor` | `createDoctorSchema` | **Catch block defect** |
| `GET` | `/api/doctors/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getDoctorById` | `doctorIdSchema` | Includes user & department |
| `PATCH` | `/api/doctors/:id` | `ADMIN` | `updateDoctor` | `updateDoctorSchema` | Modifies license/department |
| `PATCH` | `/api/doctors/:id/status`| `ADMIN` | `updateDoctorStatus` | `updateDoctorStatusSchema` | Sets user status & `approvedAt` |
| `GET` | `/api/patients` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getPatients` | None | Returns patient list |
| `POST` | `/api/patients` | `ADMIN` | `createPatient` | `createPatientSchema` | Rejects duplicate code/user (409) |
| `GET` | `/api/patients/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getPatientById` | `patientIdSchema` | Full patient detail |
| `PATCH` | `/api/patients/:id` | `ADMIN` | `updatePatientById` | `updatePatientSchema` | Updates demographics/history |
| `GET` | `/api/ot-rooms` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getOTRooms` | None | Returns room list with department |
| `POST` | `/api/ot-rooms` | `ADMIN` | `createOTRoom` | `createOTRoomSchema` | Rejects duplicate code (409) |
| `GET` | `/api/ot-rooms/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getOTRoomById` | `otRoomIdSchema` | Room detail |
| `PATCH` | `/api/ot-rooms/:id` | `ADMIN` | `updateOTRoomById` | `updateOTRoomSchema` | Updates name/department/capacity |
| `PATCH` | `/api/ot-rooms/:id/status`| `ADMIN` | `updateOTRoomStatusById` | `updateOTRoomStatusSchema` | Updates enum status |
| `PATCH` | `/api/ot-rooms/:id/active`| `ADMIN` | `updateOTRoomActiveById` | `updateOTRoomActiveSchema` | Sets boolean active |
| `GET` | `/api/equipment` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getEquipment` | None | Equipment list |
| `POST` | `/api/equipment` | `ADMIN` | `createEquipment` | `createEquipmentSchema` | Rejects duplicate serial (409) |
| `GET` | `/api/equipment/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getEquipmentById` | `equipmentIdSchema` | Equipment detail |
| `PATCH` | `/api/equipment/:id` | `ADMIN` | `updateEquipmentById` | `updateEquipmentSchema` | Updates serial/maintenance |
| `PATCH` | `/api/equipment/:id/status`| `ADMIN`| `updateEquipmentStatusById`| `updateEquipmentStatusSchema`| Updates equipment status |
| `GET` | `/api/schedules` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getSchedules` | None | All schedules with relations |
| `POST` | `/api/schedules` | `ADMIN` | `createScheduleWithValidation` | `createScheduleSchema` | Full conflict/overlap engine |
| `GET` | `/api/schedules/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getScheduleById` | `scheduleIdSchema` | Includes staff/equipment/notes |
| `PATCH` | `/api/schedules/:id` | `ADMIN` | `updateScheduleWithValidation` | `updateScheduleSchema` | Re-checks conflicts & rules |
| `PATCH` | `/api/schedules/:id/status`| `ADMIN` | `updateScheduleStatusById` | `updateScheduleStatusSchema`| Strict state machine transitions |
| `GET` | `/api/schedules/:id/staff` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getScheduleStaff` | `scheduleIdSchema` | List assigned staff |
| `POST` | `/api/schedules/:id/staff` | `ADMIN` | `assignScheduleStaffById` | `assignScheduleStaffSchema` | Rejects non-active user |
| `DELETE`| `/api/schedules/:id/staff/:staffId`| `ADMIN`| `removeScheduleStaffById` | `scheduleIdSchema` | Deletes assignment |
| `GET` | `/api/schedules/:id/equipment` | `ADMIN`, `DOCTOR`, `OT_STAFF`| `getScheduleEquipment` | `scheduleIdSchema` | List assigned equipment |
| `POST` | `/api/schedules/:id/equipment` | `ADMIN` | `assignScheduleEquipmentById`| `assignScheduleEquipmentSchema`| Validates equipment is AVAILABLE |
| `PATCH` | `/api/schedules/:id/equipment/:equipmentId`| `ADMIN`| `releaseScheduleEquipmentById`| `scheduleIdSchema` | Sets `releasedAt` timestamp |
| `GET` | `/api/schedules/:id/notes` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `getScheduleNotes` | `scheduleIdSchema` | List notes for schedule |
| `POST` | `/api/schedules/:id/notes` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `createScheduleNoteById` | `createScheduleNoteSchema` | Creates note authored by user |
| `PATCH` | `/api/schedules/:id/notes/:noteId`| `ADMIN`, `DOCTOR`, `OT_STAFF`| `updateScheduleNoteById` | `updateScheduleNoteSchema` | Author check (returns pre-update note) |
| `DELETE`| `/api/schedules/:id/notes/:noteId`| `ADMIN`, `DOCTOR`, `OT_STAFF`| `deleteScheduleNoteById` | `scheduleNoteIdSchema` | Author check |
| `GET` | `/api/alerts` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` | `getAlerts` | `getAlertsQuerySchema` | Filtered to own alerts for non-admin |
| `POST` | `/api/alerts` | `ADMIN`, `DOCTOR`, `OT_STAFF` | `createAlert` | `createAlertSchema` | Validates target recipient & schedule |
| `GET` | `/api/alerts/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` | `getAlertById` | `alertIdSchema` | Ownership checked (403) |
| `PATCH` | `/api/alerts/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` | `updateAlertById` | `updateAlertSchema` | Ownership checked (403) |
| `DELETE`| `/api/alerts/:id` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` | `deleteAlertById` | `alertIdSchema` | Ownership checked (403) |
| `PATCH` | `/api/alerts/:id/read` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` | `markAlertAsReadById` | `alertIdSchema` | Ownership checked (403) |
| `PATCH` | `/api/alerts/read-all` | `ADMIN`, `DOCTOR`, `OT_STAFF`, `PATIENT` | `markAllAlertsAsRead` | Optional `{ userId }` | Ownership checked (403) |

---

## Database / Prisma

### Configuration & Architecture
- **Datasource**: PostgreSQL (`postgresql`).
- **Prisma Client**: Prisma `7.10.0` with `@prisma/adapter-pg`. Generated client output configured to `src/generated/prisma`.
- **Server Singleton**: [`src/lib/db/prisma.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/db/prisma.ts) uses `server-only`, `globalThis` caching in non-production, and passes `PrismaPg` adapter instance.
- **Migrations**:
  1. `20260926140643_init`: Initial database schema with all models, enums, relations, and unique indexes.
  2. `20260926144114_add_audit_logging`: Added `AuditAction` enum and `AuditLog` model with indexes on `userId`, `[entity, entityId]`, `action`, and `createdAt`.
- **Seed Script**: [`prisma/seed.ts`](file:///c:/Users/patel/Desktop/medorch/prisma/seed.ts) upserts default local administrator (`admin@medorch.local`, password `MedOrch@Dev123!`, role `ADMIN`, status `ACTIVE`).
- **Schema & Application Logic Consistency**:
  - Uniqueness constraints in the schema match application-level logic:
    - `ScheduleStaff`: `@@unique([scheduleId, userId, role])` prevents assigning the same user in the same role twice.
    - `ScheduleEquipment`: `@@unique([scheduleId, equipmentId])` prevents duplicate assignments of the same equipment.
    - `Department`: `headDoctorId @unique` ensures a doctor heads at most one department.
  - Foreign key delete behaviors:
    - Schedules protect associated foreign entities via `Restrict` (`patientId`, `departmentId`, `otRoomId`, `surgeonId`, `createdById`).
    - Schedule children (`ScheduleStaff`, `ScheduleEquipment`, `ScheduleNote`) properly cascade on schedule deletion (`Cascade`).
    - Audit logs preserve history when user accounts are deleted (`SetNull`).

---

## Frontend Routes

| Route | Route Type | Layout / Shell | Access Guard | Rendered Content | Status |
|---|---|---|---|---|---|
| `/` | Public Marketing | Root Layout | None | Comprehensive marketing landing page with hero, platform overview, features, and responsive mobile nav | COMPLETE |
| `/login` | Public Auth | Root Layout | None | Split layout with credentials form (`LoginForm`), error banner, submit state | COMPLETE |
| `/dashboard` | Protected Page | [`AppShell`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/AppShell.tsx) | `requireAuth()` | Operational overview cards, Quick Actions, recent schedules list, OT rooms grid, alerts widget | COMPLETE |
| `/schedules` | Protected Page | [`AppShell`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/AppShell.tsx) | `requireAuth()` | Header banner, search & filters, schedule cards list, create/edit modal, admin status action dialogs | COMPLETE |
| `/users` | Protected Page | Naked `<main>` (no AppShell) | `requireRole("ADMIN")` | User list table, search bar, role & status filters | PARTIAL (lacks AppShell) |
| `/unauthorized` | Protected Fallback | Root Layout | None | Access denied error page with link back to `/dashboard` | COMPLETE |
| `/ot-rooms` | Protected Page | None | None | **Missing Page**: Linked in Quick Actions, returns 404 | MISSING |
| `/equipment` | Protected Page | None | None | **Missing Page**: Linked in Quick Actions, returns 404 | MISSING |
| `/patients` | Protected Page | None | None | **Missing Page**: No route exists | MISSING |
| `/departments` | Protected Page | None | None | **Missing Page**: No route exists | MISSING |
| `/schedules/[id]` | Protected Page | None | None | **Missing Page**: No detail/assignment page exists | MISSING |

---

## Infrastructure / Quality

- **Node / Framework Stack**: Next.js 16.3.6 (Turbopack, React Compiler enabled), React 19.2.8, React DOM 19.2.8.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`. Design system tokens configured in `globals.css` with CSS custom properties (`--color-surface`, `--color-primary`, etc.).
- **TypeScript**: Strict TypeScript 5 with `noEmit`, bundler module resolution, and path alias `@/*` resolving to `./src/*`. Typecheck succeeds cleanly.
- **Linting**: ESLint 9 using Flat Config (`eslint.config.mjs`) extending Next Core Web Vitals and TypeScript configs. ESLint exits with 0 warnings/errors.
- **Formatting**: Prettier configuration with `prettier-plugin-tailwindcss`. `format:check` script configured in `package.json`.
- **Database Connection**: Configured via `DATABASE_URL` environment variable. Docker Compose (`docker-compose.yml`) defines a local PostgreSQL 17 container on port 5432 with volume persistence and healthcheck (`pg_isready -U medorch -d medorch`).
- **Tests**:
  - `package.json` contains no test script or test runner dependencies.
  - Directories `tests/unit`, `tests/integration`, and `tests/e2e` exist in the filesystem but are currently empty.

---

## Remaining Work — PRIORITIZED

### P0 — Blocking / Correctness
1. **Fix `POST /api/doctors` Unhandled Fallthrough**:
   - Location: [`src/app/api/doctors/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/doctors/route.ts#L53-L83).
   - Problem: If `createDoctor` throws an unexpected error or Prisma error (e.g., unique license constraint violation P2002), the `catch` block checks only three specific error strings and returns nothing if they do not match. This violates Next.js route handler contracts and returns `undefined`, triggering an unhandled server crash.
   - Solution: Add Prisma error handling (`P2002` duplicate check) and a fallback `return apiError("Failed to create doctor.", 500, undefined, requestId)`.
2. **Fix Request ID Header Name Typo**:
   - Location: [`src/lib/api/request-id.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/api/request-id.ts#L4).
   - Problem: Reads `x-requesst-id` with two 's' characters instead of `x-request-id`. Any standard client sending `x-request-id` is ignored, resulting in newly generated random UUIDs.
3. **Fix `updateScheduleNoteById` Return Value**:
   - Location: [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L645-L658).
   - Problem: `updateScheduleNoteById` awaits `updateScheduleNote(noteId, content)` but returns `note` (the pre-update note instance fetched before the update), returning stale data to callers.

### P1 — Required Functional Work
1. **Wrap `/users` Page in Application Shell**:
   - Location: [`src/app/(dashboard)/users/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/(dashboard)/users/page.tsx).
   - Problem: The page renders `<main>` directly inside root layout, lacking [`AppShell`](file:///c:/Users/patel/Desktop/medorch/src/components/layout/AppShell.tsx) (Header, Sidebar, responsive padding). Users navigating to `/users` lose all application navigation controls.
2. **Implement Missing `/ot-rooms` and `/equipment` Pages**:
   - Problem: Dashboard [`QuickActions`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L32-L43) links directly to `/ot-rooms` and `/equipment`. Both links lead to 404 pages.
   - Solution: Create App Router pages that consume existing `/api/ot-rooms` and `/api/equipment` endpoints.
3. **Implement Schedule Detail / Assignment UI**:
   - Problem: Backend endpoints exist for staff assignment (`/api/schedules/:id/staff`), equipment assignment/release (`/api/schedules/:id/equipment`), and clinical notes (`/api/schedules/:id/notes`), but no UI allows viewing or interacting with these capabilities.
   - Solution: Create a schedule detail view or modal tabs in `ScheduleCard` / `/schedules/[id]` to manage staff, equipment, and notes.
4. **Implement Patient Direct Field Selection**:
   - Location: [`src/modules/patients/patient.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.repository.ts#L8-L24, #L32-L48).
   - Problem: `findPatients` and `findPatientById` select `patientCode` and linked `user.*`, but fail to select `name`, `email`, `phone`, `dateOfBirth`, `gender` stored directly on the `Patient` model. If a patient is unlinked from a user, their name appears empty in API consumers.

### P2 — Important Hardening
1. **Audit Log Query API & Audit Viewer**:
   - Problem: Mutations log audit events, but there is no API endpoint or UI to view audit trails.
   - Solution: Implement `findAuditLogs` in [`src/modules/audit/audit.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/audit/audit.repository.ts), create `GET /api/audit`, and build an Admin audit log viewer.
2. **Harmonize Fine-Grained Permissions with API Allow-lists**:
   - Problem: [`src/lib/auth/permission.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/permission.ts) and [`src/lib/auth/permissions.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/auth/permissions.ts) exist alongside route-level `authorizeApiRole(...)`. Certain roles (e.g. DOCTOR) have `"schedules:manage"` in permission files but are hard-blocked by API route checks.
   - Solution: Consolidate permission files into one authoritative policy and align route handlers.
3. **Log Missing Audit Events**:
   - Log user logins and logouts in NextAuth callbacks using `LOGIN` and `LOGOUT` actions.
   - Log alert updates and read receipts in [`src/modules/alerts/alerts.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/alerts/alerts.service.ts).

### P3 — Polish / Optional
1. **Add Automated Unit & Integration Tests**:
   - Configure a test runner (Vitest or Jest) in `package.json` and implement test suites in existing `tests/unit` and `tests/integration` directories.
2. **Correct TypeScript Parameter Typo in Department Service**:
   - In [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts#L22), rename `headDoctor?: string` to `headDoctorId?: string`.
3. **Equipment Status Synchronization**:
   - When equipment is assigned to a schedule, optionally transition its `Equipment.status` to `IN_USE`, and restore to `AVAILABLE` on release.

---

## Explicitly Completed Work

The following functional capabilities are fully implemented and verified. Future development must **NOT** duplicate, re-architect, or re-implement these components:

1. **NextAuth Credentials & JWT Session Pipeline**:
   - Fully working credentials authentication in [`src/auth.ts`](file:///c:/Users/patel/Desktop/medorch/src/auth.ts) with `ACTIVE` status verification and bcrypt password checks.
   - Clean session callbacks preserving `id`, `role`, and `status`.
   - Client session wrapper [`src/providers/SessionProvider.tsx`](file:///c:/Users/patel/Desktop/medorch/src/providers/SessionProvider.tsx) integrated in root layout.
2. **Surgical Scheduling Engine & Conflict Detection**:
   - Complete interval conflict detection (`findScheduleConflicts`) in [`src/modules/schedules/schedule.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.repository.ts).
   - Cross-domain validation verifying active patient, active department, matching and non-maintenance OT room, and active DOCTOR surgeon.
   - Strict schedule lifecycle state machine in [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L101-L134) with terminal-state freezing for `COMPLETED` and `CANCELLED`.
   - Staff assignment, equipment assignment/release, and note ownership validation in backend services and routes.
3. **Scheduling Frontend (List, Filter, Create/Edit, Status Transitions)**:
   - Schedule list with client-side multi-parameter filtering ([`src/components/schedules/ScheduleFilters.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleFilters.tsx)).
   - Responsive create/edit modal form ([`src/components/schedules/ScheduleForm.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleForm.tsx)).
   - Status transition buttons with accessible confirmation dialogs ([`src/components/schedules/ScheduleStatusActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/schedules/ScheduleStatusActions.tsx)).
4. **Real-time Alert Center & Notifications**:
   - Database model, repository, and service supporting user-scoped alert management with unread flags and read timestamps.
   - Header notification drawer [`src/components/alerts/AlertCenter.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/alerts/AlertCenter.tsx) with live 30-second polling, unread badges, mark-read, and delete actions.
   - Dashboard alert summary widget [`src/components/dashboard/AlertsSummaryWidget.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/AlertsSummaryWidget.tsx).
5. **Dashboard Operational Overview & Grid**:
   - Real-time room occupancy grid [`src/components/dashboard/OTRoomsGrid.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/OTRoomsGrid.tsx).
   - Concurrent statistics counter [`src/components/dashboard/OperationalOverview.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/OperationalOverview.tsx).
   - Recent schedules list [`src/components/dashboard/RecentSchedulesList.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/RecentSchedulesList.tsx).
6. **User Management List View**:
   - User table with role/status badges and search filters ([`src/components/users/UserList.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/users/UserList.tsx)).
7. **Cross-Domain Audit Logging Mutation Pipeline**:
   - `recordAudit` service integrated and actively recording audit rows across Patients, Doctors, Departments, OT Rooms, Equipment, Schedules, and Alerts.

---

## Known Issues

The following issues have been verified by inspecting active codebase files:

1. **`POST /api/doctors` Unhandled Fallthrough**:
   - File: [`src/app/api/doctors/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/doctors/route.ts#L53-L83).
   - In `POST`, if an error occurs that is not an `Error` with `message === "USER_NOT_FOUND"`, `"USER_NOT_DOCTOR"`, or `"DOCTOR_PROFILE_EXISTS"`, the `catch` block does not return any response. Next.js App Router throws an error for handlers returning `undefined`.
2. **Request ID Header Misspelling**:
   - File: [`src/lib/api/request-id.ts`](file:///c:/Users/patel/Desktop/medorch/src/lib/api/request-id.ts#L4).
   - Function checks `request.headers.get("x-requesst-id")` (two `s` characters), causing incoming `x-request-id` headers from HTTP clients to be ignored.
3. **Stale Return Value in `updateScheduleNoteById`**:
   - File: [`src/modules/schedules/schedule.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/schedules/schedule.service.ts#L658).
   - `updateScheduleNoteById` fetches `note`, calls `updateScheduleNote(noteId, content)`, but returns the old pre-update `note` object.
4. **Missing Direct Demographic Fields in `findPatients`**:
   - File: [`src/modules/patients/patient.repository.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/patients/patient.repository.ts#L8-L24, #L32-L48).
   - The query projects `user { select: { name, email, phone } }` rather than the `name`, `email`, `phone` fields stored directly on the `Patient` row. If `patient.userId` is null, the patient appears nameless.
5. **Missing `AppShell` in `/users` Page**:
   - File: [`src/app/(dashboard)/users/page.tsx`](file:///c:/Users/patel/Desktop/medorch/src/app/(dashboard)/users/page.tsx#L8-L21).
   - The page renders directly into root layout without wrapping in `<AppShell>`, causing the header, sidebar, and layout styling to disappear when navigating to `/users`.
6. **Dead Links in Dashboard Quick Actions**:
   - File: [`src/components/dashboard/QuickActions.tsx`](file:///c:/Users/patel/Desktop/medorch/src/components/dashboard/QuickActions.tsx#L32, #L43).
   - Buttons link to `/ot-rooms` and `/equipment`, but no such pages exist in the App Router, leading to 404 pages.
7. **Type Parameter Mismatch in Department Service**:
   - File: [`src/modules/departments/department.service.ts`](file:///c:/Users/patel/Desktop/medorch/src/modules/departments/department.service.ts#L22).
   - `createNewDepartment` declares `headDoctor?: string` instead of `headDoctorId?: string`.
8. **Missing UI for Schedule Staff, Equipment, and Notes**:
   - Backend APIs for schedule staff, equipment assignments, and notes exist, but `ScheduleCard` and `ScheduleForm` provide no UI interface to view or manipulate them.
9. **Missing Audit Log API and UI**:
   - `AuditLog` rows are created during mutations, but there is no repository read function, no API route, and no frontend interface to view audit logs.

---

## Recommended Next Step

**Fix the error handling in [`src/app/api/doctors/route.ts`](file:///c:/Users/patel/Desktop/medorch/src/app/api/doctors/route.ts#L53-L83) so that `POST /api/doctors` returns a 409 response for Prisma unique-constraint violations (`P2002`) and a fallback 500 response (`apiError("Failed to create doctor.", 500, undefined, requestId)`) instead of falling through with no return value.**

---

No application files were modified.
