'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/generated/prisma/client';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/*======================================================================
  AppShell — a control rail beside a lavender daybook.
  ======================================================================
  The old shell nested a white command bar, a white navigation card and a
  white content sheet inside one another. Here the rail is the constant:
  a dark aubergine spine, a paper command line, and content that sits
  directly on the lavender canvas. Individual modules own their working
  surfaces, so the shell no longer turns every screen into one giant card.

  Navigation state and the page transition survive client navigation; only
  the working content is re-keyed.
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
    <div data-workspace="lavender" data-app-shell="lavender" className="text-ink min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />

      <div className="relative min-h-screen lg:pl-[17rem]">
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        <main className="px-3 pb-12 sm:px-5 lg:px-8 lg:pb-16">
          <div
            key={pathname}
            data-page-content
            className="page-enter mx-auto w-full max-w-[96rem] pt-4 lg:pt-6"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
