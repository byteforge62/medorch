'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Buildings,
  CalendarBlank,
  CalendarCheck,
  ClipboardText,
  DoorOpen,
  FirstAidKit,
  SquaresFour,
  Stethoscope,
  UserList,
  Users,
  X,
  type IconProps,
} from '@phosphor-icons/react';
import type { UserRole } from '@/generated/prisma/client';
import { Wordmark } from '@/components/shared/Brand';

/** Stable id shared with the Header toggle so `aria-controls` resolves. */
export const PRIMARY_NAVIGATION_ID = 'primary-navigation';

interface NavItem {
  name: string;
  href: string;
  roles: UserRole[];
  icon: React.ComponentType<IconProps>;
  group: 'work' | 'control';
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF', 'PATIENT'],
    icon: SquaresFour,
    group: 'work',
  },
  {
    name: 'Schedules',
    href: '/schedules',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: CalendarBlank,
    group: 'work',
  },
  {
    name: 'Theatres',
    href: '/ot-rooms',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: DoorOpen,
    group: 'work',
  },
  {
    name: 'Departments',
    href: '/departments',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: Buildings,
    group: 'work',
  },
  {
    name: 'Patients',
    href: '/patients',
    roles: ['ADMIN', 'DOCTOR'],
    icon: Users,
    group: 'work',
  },
  {
    name: 'Doctors',
    href: '/doctors',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: Stethoscope,
    group: 'work',
  },
  {
    name: 'Equipment',
    href: '/equipment',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: FirstAidKit,
    group: 'work',
  },
  {
    name: 'My appointments',
    href: '/patients/appointments',
    roles: ['PATIENT'],
    icon: CalendarCheck,
    group: 'work',
  },
  {
    name: 'Accounts',
    href: '/users',
    roles: ['ADMIN'],
    icon: UserList,
    group: 'control',
  },
  {
    name: 'Audit trail',
    href: '/audit',
    roles: ['ADMIN'],
    icon: ClipboardText,
    group: 'control',
  },
];

const groupLabels: Record<NavItem['group'], string> = {
  work: 'Theatre operations',
  control: 'Administration',
};

function initialsOf(name?: string | null) {
  return (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/*======================================================================
  The control rail
  ======================================================================
  A midnight spine carrying the same cobalt-to-teal signal as the public
  page: the active destination is a soft pill with a gradient edge, not a
  grey block. Navigation labels stay visible at all desktop widths.
====================================================================== */

export function Sidebar({
  isOpen,
  onClose,
  role: roleOverride,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Role override for previews and tests; runtime reads the session. */
  role?: UserRole;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = roleOverride ?? ((session?.user?.role || 'PATIENT') as UserRole);

  const allowed = navItems.filter((item) => item.roles.includes(role));
  const groups: NavItem['group'][] = ['work', 'control'];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {isOpen ? (
        <div
          className="bg-[var(--rail-overlay)] fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id={PRIMARY_NAVIGATION_ID}
        data-app-sidebar
        aria-label="Primary navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[17rem] flex-col overflow-hidden bg-rail text-white transition-transform duration-300 ease-[cubic-bezier(0.22,0.75,0.2,1)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/10"
        />

        <div className="relative flex h-[5.6rem] shrink-0 items-center justify-between px-5">
          <Wordmark
            href="/dashboard"
            tone="chalk"
            size="lg"
            subtitle="Theatre operations"
          />

                      <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <nav className="thin-scroll relative flex-1 overflow-y-auto px-3 pt-4 pb-4">
          {groups.map((group) => {
            const items = allowed.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-medium text-white/45">
                  {groupLabels[group]}
                </p>

                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    const IconComponent = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className={`group relative flex h-10 items-center gap-3 rounded-[11px] px-3 transition-colors duration-200 ${
                            active
                              ? 'bg-white/[0.08] text-white ring-1 ring-inset ring-white/10'
                              : 'text-white/62 hover:bg-[var(--nav-hover-bg)] hover:text-white'
                          }`}
                        >
                          {active ? (
                            <span
                              aria-hidden="true"
                              className="bg-brand-lavender absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full"
                            />
                          ) : null}
                          <IconComponent
                            size={17}
                            weight={active ? 'fill' : 'regular'}
                            className={
                              active
                                ? 'text-[#5EEAD4]'
                                : 'text-white/45 group-hover:text-white/75'
                            }
                            aria-hidden="true"
                          />
                          <span className={`min-w-0 flex-1 truncate text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}>
                            {item.name}
                          </span>
                          {active ? (
                            <span className="bg-[#5EEAD4] h-1 w-1 rounded-full" aria-hidden="true" />
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="relative shrink-0 border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-[11px] font-semibold text-white/85"
              aria-hidden="true"
            >
              {initialsOf(session?.user?.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold text-white/90">
                {session?.user?.name ?? 'Signed in'}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-white/45">
                {role.replaceAll('_', ' ')}
              </span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
