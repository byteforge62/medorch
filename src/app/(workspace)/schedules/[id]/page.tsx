import { requireRole } from '@/server/auth/authorization';
import { ScheduleDetail } from '@/features/schedules/components/ScheduleDetails';

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

  return <ScheduleDetail scheduleId={id} />;
}
