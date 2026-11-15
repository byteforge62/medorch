import { requireRole } from '@/server/auth/authorization';
import { OTRoomManagement } from '@/features/operating-rooms/components/OtRoomManagement';

export default async function OtRoomsPage() {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  return <OTRoomManagement />;
}
