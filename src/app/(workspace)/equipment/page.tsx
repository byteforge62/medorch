import { requireRole } from '@/lib/auth/authorization';
import { EquipmentManagement } from './EquipmentManagement';

export default async function EquipmentPage() {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  return <EquipmentManagement />;
}
