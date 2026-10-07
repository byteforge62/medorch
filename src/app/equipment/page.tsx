import { requireRole } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { EquipmentManagement } from './EquipmentManagement';

export default async function EquipmentPage() {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  return (
    <AppShell>
      <EquipmentManagement />
    </AppShell>
  );
}
