import { requirePermission } from '@/server/auth/authorization';
import { DoctorDirectory } from '@/features/doctors/components/DoctorDirectory';

export default async function DoctorsPage() {
  await requirePermission('doctors:read');

  return <DoctorDirectory />;
}
