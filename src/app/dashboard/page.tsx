import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/authorization';

export default async function DashboardPage() {
  const session = await requireAuth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">MedOrch Dashboard</h1>

        <div className="mt-8 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Authenticated User</h2>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm font-medium">ID</dt>
              <dd className="text-sm">{session.user.id}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium">Name</dt>
              <dd className="text-sm">{session.user.name}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium">Email</dt>
              <dd className="text-sm">{session.user.email}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium">Role</dt>
              <dd className="text-sm">{session.user.role}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium">Status</dt>
              <dd className="text-sm">{session.user.status}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
