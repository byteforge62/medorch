import { requireRole } from '@/lib/auth/authorization';
import { UserList } from '@/components/users/UserList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default async function UsersPage() {
  await requireRole('ADMIN');

  return (
    <main className="space-y-4 md:space-y-8">
      <PageHeader
        eyebrow="Access control"
        title="Users"
        description="Provision accounts, approve registrations, and review who can reach which part of MedOrch."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UserList />

        <div>
          <Card className="border-border border-b-0 p-6">
            <p className="text-foreground-muted text-sm">
              Account management workspace
            </p>
            <p className="text-foreground mt-2 font-medium">
              Provision accounts, approve registrations, and review role-based
              access.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
