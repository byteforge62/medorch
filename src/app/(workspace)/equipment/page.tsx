import { requireRole } from '@/server/auth/authorization';
import { EquipmentManagement } from '@/features/equipment/components/EquipmentManagement';

export default async function EquipmentPage() {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  return <EquipmentManagement />;
}
