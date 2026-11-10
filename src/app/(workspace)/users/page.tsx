import { requireRole } from '@/lib/auth/authorization';
import { UserList } from '@/components/users/UserList';

export default async function UsersPage() {
  await requireRole('ADMIN');

  return <UserList />;
}
