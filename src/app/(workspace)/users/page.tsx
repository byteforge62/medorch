import { requireRole } from '@/server/auth/authorization';
import { UserList } from '@/features/users/components/UserList';

export default async function UsersPage() {
  await requireRole('ADMIN');

  return <UserList />;
}
