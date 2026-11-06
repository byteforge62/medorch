import { requirePermission } from '@/lib/auth/authorization';
import { MyAppointments } from './MyAppointments';

export default async function MyAppointmentsPage() {
  await requirePermission('schedules:read:own');

  return <MyAppointments />;
}
