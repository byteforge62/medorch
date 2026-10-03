import { requireRole } from "@/lib/auth/authorization";
import { UserList } from "@/components/users/UserList";

export default async function UsersPage() {
  await requireRole("ADMIN");

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Users
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage and monitor MedOrch users and their access.
        </p>
      </div>

      <UserList />
    </main>
  );
}