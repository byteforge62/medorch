import { AppShell } from '@/components/layout/AppShell';
import { requireAuth } from '@/lib/auth/authorization';

/*======================================================================
  Authenticated workspace boundary
  ======================================================================
  Every role-specific route lives under this group, so the sidebar, command
  bar and session consumers are mounted once and preserved by the App Router.
  Authentication is still enforced here on the server before any page is
  rendered; each page keeps its own role or permission check for the actual
  resource it exposes.
====================================================================== */

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <AppShell>{children}</AppShell>;
}
