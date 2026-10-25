import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/authorization";
import { UserList } from "@/components/users/UserList";

export default async function UsersPage() {
  await requireRole("ADMIN");

  return (

    <AppShell>
      <main className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Users
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage and monitor MedOrch users and their access.
          </p>
        </div>
        <UserList />
      </main>
    </AppShell>
  );
}