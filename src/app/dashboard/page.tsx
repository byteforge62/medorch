import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { OperationalOverview } from '@/components/dashboard/OperationalOverview';
import { OTRoomsGrid } from '@/components/dashboard/OTRoomsGrid';
import { RecentSchedulesList } from '@/components/dashboard/RecentSchedulesList';
import { AlertsSummaryWidget } from '@/components/dashboard/AlertsSummaryWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Badge } from '@/components/ui/Badge';

export default async function DashboardPage() {
  const session = await requireAuth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Operational Dashboard
              </h1>
              <Badge variant="purple">{user.role}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name || user.email}</span>. Operating Theatre live status monitoring.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
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
      </div>
    </AppShell>
  );
}
