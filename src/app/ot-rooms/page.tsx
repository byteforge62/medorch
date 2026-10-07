import { requireRole } from '@/lib/auth/authorization';
import { AppShell } from '@/components/layout/AppShell';
import { OTRoomManagement } from '@/app/ot-rooms/OtRoomManagement';

export default async function OTRoomsPage() {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  return (
    <AppShell>
      <OTRoomManagement />
    </AppShell>
  );
}
