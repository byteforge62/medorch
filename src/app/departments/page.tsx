import { AppShell } from '@/components/layout/AppShell'
import { requirePermission } from '@/lib/auth/authorization'
import { DepartmentManagement } from '@/components/departments/DepartmentManagement'

export default async function DepartmentsPage() {
  await requirePermission('departments:read')

  return (
    <AppShell>
      <DepartmentManagement />
    </AppShell>
  )
}