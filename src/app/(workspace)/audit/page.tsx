import { requireRole } from '@/lib/auth/authorization';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';

export default async function AuditPage() {
  await requireRole('ADMIN');

  return <AuditLogViewer />;
}
