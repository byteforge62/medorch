import { AppShell } from '@/components/layout/AppShell';
import { DepartmentManagement } from '@/components/departments/DepartmentManagement';
import { requirePermission } from '@/lib/auth/authorization';

export default async function DepartmentsPage() {
  await requirePermission('departments:read');

  return (
    <AppShell>
      <DepartmentManagement />
    </AppShell>
  );
}
