'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { List, SignOut } from '@phosphor-icons/react';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { Badge } from '@/components/ui/Badge';
import { PRIMARY_NAVIGATION_ID } from './Sidebar';

interface HeaderProps {
  onToggleSidebar?: () => void;
  /** Current visibility of the sidebar drawer, reflected on the toggle. */
  sidebarOpen?: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen = false }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'purple';
      case 'DOCTOR':
        return 'info';
      case 'OT_STAFF':
        return 'warning';
      case 'PATIENT':
      default:
        return 'neutral';
    }
  };

  return (
    <header className="border-border bg-surface sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="border-border-strong text-foreground-secondary hover:bg-surface-muted focus-visible:outline-ring flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border transition-colors focus-visible:outline-2 lg:hidden"
          aria-label={
            sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={sidebarOpen}
          aria-controls={PRIMARY_NAVIGATION_ID}
        >
          <List size={20} weight="bold" aria-hidden="true" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="bg-primary text-foreground-inverse flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-xs">
            M
          </div>
          <span className="text-foreground text-base font-bold tracking-tight">
            MedOrch
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <AlertCenter />

        <div className="bg-border h-5 w-px" aria-hidden="true" />

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end space-x-1.5">
                <span className="text-foreground text-xs font-semibold">
                  {user.name || 'User'}
                </span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <span className="text-foreground-muted block max-w-[160px] truncate text-[11px]">
                {user.email}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="border-border-strong text-foreground-muted hover:border-danger-border hover:bg-danger-soft hover:text-danger focus-visible:outline-ring flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border transition-colors focus-visible:outline-2"
              title="Sign Out"
              aria-label="Sign out"
            >
              <SignOut size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
