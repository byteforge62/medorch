import { requirePermission } from '@/server/auth/authorization';

import { PatientDetail } from '@/features/patients/components/PatientDetail';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  await requirePermission('patients:clinical:read');

  const { id } = await params;

  return <PatientDetail patientId={id} />;
}
