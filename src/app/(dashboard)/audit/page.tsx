import { AppShell } from '@/components/layout/AppShell';
import { requireRole } from '@/lib/auth/authorization';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';

export default async function AuditPage() {
  await requireRole(['ADMIN']);

  return (
    <AppShell>
      <AuditLogViewer />
    </AppShell>
  );
}
