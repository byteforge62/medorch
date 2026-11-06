'use client';

/*======================================================================
  Preview harness — REAL page components, stubbed transport
  ======================================================================
  This route mounts the actual module components that ship in the app. The
  only thing that differs from production is the transport: `installPreviewFetch`
  answers `/api/*` with labelled synthetic fixtures so the screens can be
  inspected without PostgreSQL.

  Nothing here is a mockup, and nothing is written to a database. The frame
  carries a banner so a screenshot can never be mistaken for a real record.
====================================================================== */

import { installPreviewFetch } from '@/lib/preview/fixtures';

// Installed at import time, before any mounted component's effect issues a
// request. Guarded internally so a second import is a no-op.
installPreviewFetch();

import Link from 'next/link';
import type { UserRole } from '@/generated/prisma/client';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';

import { PatientRegistry } from '@/app/(workspace)/patients/PatientRegistry';
import { DoctorDirectory } from '@/app/(workspace)/doctors/DoctorDirectory';
import { OTRoomManagement } from '@/app/(workspace)/ot-rooms/OtRoomManagement';
import { EquipmentManagement } from '@/app/(workspace)/equipment/EquipmentManagement';
import { SchedulePage } from '@/components/schedules/SchedulePage';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { UserList } from '@/components/users/UserList';

import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { OTStaffDashboard } from '@/components/dashboard/OTStaffDashboard';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard';

const PREVIEW_USER = {
  name: 'Preview Operator',
  email: 'preview@medorch.test',
  role: 'ADMIN',
};

function AdminControlRoom() {
  // The real admin branch renders the operations console on its own; the preview
  // mounts the same thing rather than reintroducing a page header.
  return <AdminDashboard />;
}

const MODULES: Record<
  string,
  { label: string; role: UserRole; render: () => React.ReactNode }
> = {
  admin: {
    label: 'Admin dashboard',
    role: 'ADMIN',
    render: () => <AdminControlRoom />,
  },
  doctor: {
    label: 'Doctor dashboard',
    role: 'DOCTOR',
    render: () => <DoctorDashboard userName="Dr. Anaya Sharma" />,
  },
  ot: {
    label: 'OT staff dashboard',
    role: 'OT_STAFF',
    render: () => <OTStaffDashboard userName="Dev Anand" />,
  },
  patient: {
    label: 'Patient dashboard',
    role: 'PATIENT',
    render: () => <PatientDashboard userName="Ira Devan" />,
  },
  patients: {
    label: 'Patient Registry',
    role: 'ADMIN',
    render: () => <PatientRegistry />,
  },
  doctors: {
    label: 'Doctor Directory',
    role: 'ADMIN',
    render: () => <DoctorDirectory />,
  },
  'ot-rooms': {
    label: 'OT Rooms',
    role: 'ADMIN',
    render: () => <OTRoomManagement />,
  },
  equipment: {
    label: 'Equipment',
    role: 'ADMIN',
    render: () => <EquipmentManagement />,
  },
  schedules: {
    label: 'Schedules',
    role: 'ADMIN',
    render: () => <SchedulePage />,
  },
  audit: {
    label: 'Audit Logs',
    role: 'ADMIN',
    render: () => <AuditLogViewer />,
  },
  users: {
    label: 'User Management',
    role: 'ADMIN',
    render: () => (
      <main className="space-y-6">
        <PageHeader
          eyebrow="Access control"
          title="Users"
          description="Provision accounts, approve registrations, and review who can reach which part of MedOrch."
        />
        <UserList />
      </main>
    ),
  },
};

export function PreviewClient({ module }: { module: string }) {
  const entry = MODULES[module];

  if (!entry) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <h1 className="text-ink text-3xl font-semibold">Preview modules</h1>
        <ul className="grid grid-cols-2 gap-3">
          {Object.entries(MODULES).map(([slug, item]) => (
            <li key={slug}>
              <Link
                href={`/preview/${slug}`}
                className="border-rule bg-sheet block rounded-[var(--radius-panel)] border px-4 py-3 text-sm font-medium shadow-sm"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <AppShell role={entry.role} user={{ ...PREVIEW_USER, role: entry.role }}>
      <div className="border-danger/35 bg-danger-soft/50 text-danger mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold">
        Preview · synthetic fixture data — not a clinical record
      </div>

      {entry.render()}
    </AppShell>
  );
}
