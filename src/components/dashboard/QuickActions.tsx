'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { UserRole } from '@/generated/prisma/client';

type ActionItem = {
  title: string;
  description: string;
  href: string;
  roles: UserRole[];
};

const actions: ActionItem[] = [
  {
    title: 'Schedule surgery',
    description: 'Book procedure & assign theatre',
    href: '/schedules',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
  },
  {
    title: 'Manage theatres',
    description: 'Room status & maintenance',
    href: '/ot-rooms',
    roles: ['ADMIN', 'OT_STAFF'],
  },
  {
    title: 'Equipment registry',
    description: 'Readiness & serial records',
    href: '/equipment',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
  },
  {
    title: 'User accounts',
    description: 'Roles, status & approval',
    href: '/users',
    roles: ['ADMIN'],
  },
  {
    title: 'Audit trail',
    description: 'Every recorded change',
    href: '/audit',
    roles: ['ADMIN'],
  },
];

/**
 * QuickActions — a command strip, not a card grid.
 *
 * Destinations the role reaches for constantly sit as one ruled row directly
 * under the masthead: mono label, hairline separators, no icons and no tiles.
 * It wraps to a stack on narrow screens rather than shrinking the targets.
 */
export function QuickActions() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'PATIENT') as UserRole;

  const allowedActions = actions.filter((action) =>
    action.roles.includes(userRole),
  );

  if (allowedActions.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Quick actions"
      className="border-border bg-surface flex flex-wrap border"
    >
      {allowedActions.map((action, index) => (
        <Link
          key={action.href}
          href={action.href}
          className={`border-border group flex min-w-[11rem] flex-1 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-primary-soft/50 ${
            index === 0 ? '' : 'border-l'
          }`}
        >
          <span className="min-w-0">
            <span className="text-foreground block truncate text-[13px] font-semibold">
              {action.title}
            </span>
            <span className="text-foreground-muted mt-0.5 block truncate text-[11px]">
              {action.description}
            </span>
          </span>

          <span
            aria-hidden="true"
            className="text-foreground-subtle group-hover:text-primary font-mono text-xs transition-all group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      ))}
    </nav>
  );
}
