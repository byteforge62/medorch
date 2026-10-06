"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { AlertCenter } from "@/components/alerts/AlertCenter";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "purple";
      case "DOCTOR":
        return "info";
      case "OT_STAFF":
        return "warning";
      case "PATIENT":
      default:
        return "neutral";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-foreground-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-ring)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
            M
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            MedOrch
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <AlertCenter />

        <div className="h-5 w-px bg-[var(--color-border)]" />

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end space-x-1.5">
                <span className="text-xs font-semibold text-[var(--color-foreground)]">
                  {user.name || 'User'}
                </span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <span className="block max-w-[160px] truncate text-[11px] text-[var(--color-foreground-muted)]">
                {user.email}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-foreground-muted)] transition-colors hover:border-[var(--color-danger-border)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-[var(--color-ring)]"
              title="Sign Out"
              aria-label="Sign out"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
