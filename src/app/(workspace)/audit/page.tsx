import { requireRole } from '@/lib/auth/authorization';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default async function AuditPage() {
  await requireRole(['ADMIN']);
  return (
    <main className="space-y-4 md:space-y-8">
      <PageHeader
        eyebrow="Security & compliance"
        title="Audit Trails"
        description="Review recorded system activity, identify the actor, and inspect changes across MedOrch."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AuditLogViewer />

        <div>
          <Card className="border-border border-b-0 p-6">
            <p className="text-foreground-muted text-sm">
              Audit investigation workspace
            </p>
            <p className="text-foreground mt-2 font-medium">
              Review recorded system activity, identify the actor, and inspect
              changes across MedOrch.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
