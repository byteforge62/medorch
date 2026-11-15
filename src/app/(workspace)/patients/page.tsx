import { requirePermission } from '@/server/auth/authorization';

import { PatientRegistry } from '@/features/patients/components/PatientRegistry';

export default async function PatientsPage() {
  await requirePermission('patients:read');

  return <PatientRegistry />;
}
