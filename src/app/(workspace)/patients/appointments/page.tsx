import { requirePermission } from '@/server/auth/authorization';
import { MyAppointments } from '@/features/patients/components/MyAppointments';

export default async function MyAppointmentsPage() {
  await requirePermission('schedules:read:own');

  return <MyAppointments />;
}
