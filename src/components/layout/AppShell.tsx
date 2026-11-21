'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/generated/prisma/client';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

/*======================================================================
  AppShell — the cobalt rail beside a porcelain daybook.
  ======================================================================
  The rail is the constant: a midnight spine with the same cobalt/teal
  signal language as the public site. The command line is porcelain, and
  content sits directly on the canvas — individual modules own their
  working surfaces, so no screen becomes one giant nested card.

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
    <div data-workspace="cobalt" data-app-shell="cobalt" className="text-ink min-h-screen">
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
