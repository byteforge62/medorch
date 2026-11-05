import { AppShell } from '@/components/layout/AppShell';
import { requirePermission } from '@/lib/auth/authorization';

import { AlertsWorkspace } from './AlertsWorkspace';

export default async function AlertsPage() {
  await requirePermission('alerts:read');

  return (
    <AppShell>
      <AlertsWorkspace />
    </AppShell>
  );
}
