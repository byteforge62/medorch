'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/generated/prisma/client';
import { workspaceForRoute, type Workspace } from '@/lib/design/workspace';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/*======================================================================
  AppShell — the instrument: spine, command bar, working sheet.
  ======================================================================
  Layout: an 84px instrument spine pinned to the left edge, a printed command
  bar, then a single working sheet. The sheet is the page: paper with one
  hairline under the command bar and content set on a centred measure. Pages
  render their own `<main>` landmark, so this frame never introduces a second
  one.

  Environment: the frame carries `data-workspace`, which every token in
  globals.css is scoped against. The value comes from the workflow itself
  (see lib/design/workspace) rather than from a switcher, so a theatre board
  is graphite because it is watched, and a patient index is paper because it is
  read. Callers may override it only for previews and tests.

  Every navigation re-keys the sheet, which runs the page-enter animation.
  That is the page transition system: a 500ms rise, no route spinner, no
  curtain that delays the content.

  `role` and `user` are optional overrides used by visual previews and tests;
  at runtime both read the authenticated session.
====================================================================== */

export function AppShell({
  children,
  role,
  user,
  workspace,
}: {
  children: React.ReactNode;
  role?: UserRole;
  user?: { name?: string | null; email?: string | null; role?: string } | null;
  workspace?: Workspace;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const activeWorkspace = workspace ?? workspaceForRoute(pathname, role);

  return (
    <div
      data-workspace={activeWorkspace}
      className="bg-paper text-ink relative min-h-screen"
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />

      <div className="lg:pl-[var(--rail-closed)]">
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        <div className="relative">
          <div
            key={pathname}
            className="page-enter mx-auto w-full max-w-[var(--sheet-max)] px-4 pt-8 pb-24 sm:px-6 lg:px-9"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
