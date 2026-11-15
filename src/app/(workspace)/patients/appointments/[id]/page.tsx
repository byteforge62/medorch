import { requirePermission } from '@/server/auth/authorization';
import { AppointmentDetail } from '@/features/patients/components/AppointmentDetail';

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

  return <AppointmentDetail appointmentId={id} />;
}
