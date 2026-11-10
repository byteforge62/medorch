'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/generated/prisma/client';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/*======================================================================
  AppShell — lavender field, white navigation, working sheet.
  ======================================================================
  The authenticated product floats over a layered lavender environment.
  The navigation is a persistent white panel; the command bar is a quiet
  white capsule; module surfaces are white cards. Decorative geometry is
  fixed, negative-stacked and pointer-inert, so it never sits behind a
  timetable, table row or form control.

  The shell survives client-side navigation: only the working sheet is
  re-keyed for the page transition.
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
      data-workspace="lavender"
      data-app-shell="lavender"
      className="text-ink relative min-h-screen"
    >
      {/* Decorative field — always behind content, never interactive. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 right-[8%] h-[28rem] w-[28rem] rounded-full bg-[#DCD1F4]/45 blur-3xl" />
        <div className="absolute top-[28%] -left-40 h-[26rem] w-[26rem] rounded-full bg-[#E8E1F7]/80 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-12rem] h-[34rem] w-[34rem] rounded-full border border-[#6550B5]/10" />
        <div className="absolute right-[-4rem] bottom-[-6rem] h-[22rem] w-[22rem] rounded-full border border-[#6550B5]/8" />
        <svg
          className="absolute top-[14%] right-[2%] h-52 w-52 text-[#6550B5]/10"
          viewBox="0 0 220 220"
          fill="none"
        >
          <path
            d="M12 148c48-5 81-35 104-80 11-22 30-39 56-44"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 9"
            strokeLinecap="round"
          />
          <circle cx="168" cy="50" r="32" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="168" cy="50" r="5" fill="currentColor" opacity="0.5" />
        </svg>
        <div className="absolute top-[58%] left-[22%] h-2 w-2 rounded-full bg-[#8D7AD0]/30" />
        <div className="absolute top-[18%] left-[36%] h-1.5 w-1.5 rounded-full bg-[#8D7AD0]/25" />
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />

      <div className="relative z-40 lg:pl-[17rem]">
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        <div className="relative px-3 pt-3 pb-4 lg:pr-4 lg:pb-4">
          <div className="bg-sheet border-rule min-h-[calc(100vh-7.5rem)] rounded-[24px] border shadow-[0_14px_44px_rgba(66,48,112,0.06)]">
            <div
              key={pathname}
              data-page-content
              className="page-enter mx-auto w-full max-w-[var(--sheet-max)] px-4 pt-6 pb-24 sm:px-6 sm:pt-7 lg:px-7 lg:pb-16"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
