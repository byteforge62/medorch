"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { UserRole } from "@/generated/prisma/client";

interface NavItem {
  name: string;
  href: string;
  roles: UserRole[];
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF', 'PATIENT'],
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: 'Schedules',
    href: '/schedules',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF', 'PATIENT'],
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: 'Users',
    href: '/users',
    roles: ['ADMIN'],
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Audit Trails',
    href: '/audit',
    roles: ['ADMIN'],
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h4m2-10H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V8.414a2 2 0 00-.586-1.414l-2.414-2.414A2 2 0 0012.586 4H11"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 4v4h6"
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "PATIENT";

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(userRole as UserRole),
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-foreground)]/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        aria-label="Primary navigation"
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-[var(--color-foreground-muted)] uppercase">
              Operations Navigation
            </div>
            <nav className="space-y-1">
              {allowedNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-xs font-semibold transition-colors ${isActive
                        ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                        : 'text-[var(--color-foreground-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]'
                      }`}
                  >
                    <span
                      className={
                        isActive
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-foreground-muted)]'
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3.5">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
              <span className="text-xs font-semibold text-[var(--color-foreground-secondary)]">
                System Operational
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-foreground-muted)]">
              MedOrch v0.1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
