import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/authorization';
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
    return <PatientDashboard userName={user.name || user.email || 'there'} />;
  }

  if (user.role === 'DOCTOR') {
    return <DoctorDashboard userName={user.name || user.email || 'Doctor'} />;
  }

  if (user.role === 'OT_STAFF') {
    return (
      <OTStaffDashboard userName={user.name || user.email || 'OT Staff'} />
    );
  }

  return <AdminDashboard />;
}
