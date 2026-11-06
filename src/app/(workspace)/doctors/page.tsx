import { requirePermission } from '@/lib/auth/authorization';
import { DoctorDirectory } from './DoctorDirectory';

export default async function DoctorsPage() {
  await requirePermission('doctors:read');

  return <DoctorDirectory />;
}
