import { requireRole } from '@/lib/auth/authorization';
import { OTRoomManagement } from './OtRoomManagement';

export default async function OtRoomsPage() {
  await requireRole(['ADMIN', 'DOCTOR', 'OT_STAFF']);

  return <OTRoomManagement />;
}
