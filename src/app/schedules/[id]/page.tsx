import { requireRole } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { ScheduleDetail } from './ScheduleDetails';

interface ScheduleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ScheduleDetailPage({
  params,
}: ScheduleDetailPageProps) {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  const { id } = await params;

  return (
    <AppShell>
      <ScheduleDetail scheduleId={id} />
    </AppShell>
  );
}
