'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/generated/prisma/client';
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

  The shell is mounted by the authenticated `(workspace)` layout, not by an
  individual page. It therefore survives client-side navigation: the rail,
  command bar and session consumers keep their DOM and state while only the
  working sheet changes. Every navigation re-keys the sheet, which runs the
  page-enter animation. That is the page transition system: a 450ms rise, no
  route spinner, no curtain that delays the content.

  Every authenticated role uses the approved light clinical environment. The
  previous graphite operations scope has been removed rather than left as a
  hidden route switch.

  `role` and `user` are optional overrides used by visual previews and tests;
  at runtime both read the authenticated session.
====================================================================== */

export function AppShell({
  children,
  role,
  user,
}: {
  children: React.ReactNode;
  role?: UserRole;
  user?: { name?: string | null; email?: string | null; role?: string } | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      data-workspace="clinical"
      data-app-shell="clinical"
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
            data-page-content
            className="page-enter mx-auto w-full max-w-[var(--sheet-max)] px-4 pt-8 pb-24 sm:px-6 lg:px-9"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
