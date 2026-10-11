import { AppShell } from '@/components/layout/AppShell';
import { requirePermission } from '@/lib/auth/authorization';
import { AppointmentDetail } from './AppointmentDetail';

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  await requirePermission('schedules:read:own');

  const { id } = await params;

  return (
    <AppShell>
      <AppointmentDetail appointmentId={id} />
    </AppShell>
  );
}
