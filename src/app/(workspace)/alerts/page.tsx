import { requirePermission } from '@/server/auth/authorization';

import { AlertsWorkspace } from '@/features/alerts/components/AlertsWorkspace';

export default async function AlertsPage() {
  await requirePermission('alerts:read');

  return <AlertsWorkspace />;
}
