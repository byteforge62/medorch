import { requirePermission } from '@/server/auth/authorization';
import { DepartmentManagement } from '@/features/departments/components/DepartmentManagement';

export default async function DepartmentsPage() {
  await requirePermission('departments:read');

  return <DepartmentManagement />;
}
