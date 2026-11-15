import { requireRole } from '@/server/auth/authorization';
import { AuditLogViewer } from '@/features/audit-logs/components/AuditLogViewer';

export default async function AuditPage() {
  await requireRole('ADMIN');

  return <AuditLogViewer />;
}
