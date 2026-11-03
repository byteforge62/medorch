import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { HospitalIntelligence } from '@/components/dashboard/HospitalIntelligence';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { OTStaffDashboard } from '@/components/dashboard/OTStaffDashboard';

/* Each role gets its own composed workspace. The ADMIN branch no longer wraps
   the console in a page header or a stack of summary widgets — the command bar
   and the operations floor carry that responsibility themselves. */

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
    <AppShell>
      <HospitalIntelligence />
    </AppShell>
  );
}
