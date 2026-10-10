import { AppShell } from '@/components/layout/AppShell';
import { requirePermission } from '@/lib/auth/authorization';

import { DoctorDetail } from './DoctorDetail';

interface DoctorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorDetailPage({
  params,
}: DoctorDetailPageProps) {
  await requirePermission('doctors:read');

  const { id } = await params;

  return (
    <AppShell>
      <DoctorDetail doctorId={id} />
    </AppShell>
  );
}
