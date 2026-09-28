import { requireRole } from "@/lib/auth/authorization";
import { getUsers } from "@/modules/users/user.service";
export default async function UsersPage() {
  await requireRole("ADMIN");

  const users = await getUsers();

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage MedOrch users and their access.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0"
              >
                <td className="px-4 py-3">
                  {user.name}
                </td>

                <td className="px-4 py-3">
                  {user.email}
                </td>

                <td className="px-4 py-3">
                  {user.role}
                </td>

                <td className="px-4 py-3">
                  {user.status}
                </td>

                <td className="px-4 py-3">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}