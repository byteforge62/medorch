import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { OperationalOverview } from '@/components/dashboard/OperationalOverview';
import { OTRoomsGrid } from '@/components/dashboard/OTRoomsGrid';
import { RecentSchedulesList } from '@/components/dashboard/RecentSchedulesList';
import { AlertsSummaryWidget } from '@/components/dashboard/AlertsSummaryWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Badge } from '@/components/ui/Badge';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { OTStaffDashboard } from '@/components/dashboard/OTStaffDashboard';

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
      <main className="space-y-6">
        {/* Top Header Banner */}
        <div className="border-border bg-surface flex flex-col justify-between gap-4 rounded-2xl border p-6 shadow-xs sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-foreground text-2xl font-bold">
                Operational Dashboard
              </h1>
              <Badge variant="purple">{user.role}</Badge>
            </div>
            <p className="text-foreground-subtle mt-1 text-xs">
              Welcome back,{' '}
              <span className="text-foreground-secondary font-semibold">
                {user.name || user.email}
              </span>
              . Operating Theatre live status monitoring.
            </p>
          </div>

          <div className="text-foreground-subtle flex items-center space-x-3 text-xs">
            <span className="bg-success-soft text-success border-success-soft inline-flex items-center rounded-md border px-2.5 py-1 font-medium">
              <span className="bg-success mr-1.5 h-1.5 w-1.5 animate-ping rounded-full" />
              Account Status: {user.status}
            </span>
          </div>
        </div>

        {/* Operational Overview Statistics */}
        <OperationalOverview />

        {/* Quick Operational Shortcuts */}
        <QuickActions />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RecentSchedulesList />
            <OTRoomsGrid />
          </div>

          <div className="space-y-6">
            <AlertsSummaryWidget />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
