import { AppShell } from '@/components/layout/AppShell';
import { requirePermission } from '@/lib/auth/authorization';

import { PatientDetail } from './PatientDetail';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  await requirePermission('patients:clinical:read');

  const { id } = await params;

  return (
    <AppShell>
      <PatientDetail patientId={id} />
    </AppShell>
  );
}
