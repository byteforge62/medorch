import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { OTStaffDashboard } from '@/components/dashboard/OTStaffDashboard';

/* Each role gets its own composed workspace. The ADMIN branch is a light
   clinical operations surface; clinicians and patients keep their clinical
   reading of the dashboard. */

export default async function DashboardPage() {
  const session = await requireAuth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  if (user.role === 'PATIENT') {
    return (
      <AppShell>
        <PatientDashboard userName={user.name || user.email || 'there'} />
      </AppShell>
    );
  }

  if (user.role === 'DOCTOR') {
    return (
      <AppShell>
        <DoctorDashboard userName={user.name || user.email || 'Doctor'} />
      </AppShell>
    );
  }

  if (user.role === 'OT_STAFF') {
    return (
      <AppShell>
        <OTStaffDashboard userName={user.name || user.email || 'OT Staff'} />
      </AppShell>
    );
  }

  return (
    <AppShell workspace="clinical">
      <AdminDashboard />
    </AppShell>
  );
}
