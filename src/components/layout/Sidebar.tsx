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
import { Wordmark } from '@/components/brand/Brand';

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
  A deep aubergine spine instead of a floating white navigation card. It
  gives the product a fixed point of reference and keeps the working
  canvas lavender. Navigation labels stay visible at all desktop widths.
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full border border-white/[0.055]"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="relative mx-5 mb-5 flex items-center gap-2 border-y border-white/10 py-2.5">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="bg-success-bright absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" />
            <span className="bg-success-bright relative inline-flex h-1.5 w-1.5 rounded-full" />
          </span>
          <p className="text-[10.5px] font-medium text-white/55">Theatre day open</p>
          <span className="ml-auto font-mono text-[9.5px] text-white/30">ORCH</span>
        </div>

        <nav className="thin-scroll relative flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group) => {
            const items = allowed.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="mb-5">
                <p className="mb-2 px-3 text-[10px] font-medium tracking-[0.025em] text-white/35">
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
                          className={`group relative flex h-10 items-center gap-3 rounded-[7px] px-3 transition-colors duration-200 ${
                            active
                              ? 'bg-[var(--nav-active-bg)] text-white'
                              : 'text-white/62 hover:bg-[var(--nav-hover-bg)] hover:text-white'
                          }`}
                        >
                          {active ? (
                            <span
                              aria-hidden="true"
                              className="bg-[var(--nav-indicator)] absolute top-1/2 left-0 h-4 w-[2px] -translate-y-1/2 rounded-full"
                            />
                          ) : null}
                          <IconComponent
                            size={17}
                            weight={active ? 'fill' : 'regular'}
                            className={active ? 'text-brand-lavender' : 'text-white/45 group-hover:text-white/75'}
                            aria-hidden="true"
                          />
                          <span className={`min-w-0 flex-1 truncate text-[12.5px] ${active ? 'font-semibold' : 'font-medium'}`}>
                            {item.name}
                          </span>
                          {active ? (
                            <span className="h-1 w-1 rounded-full bg-white/50" aria-hidden="true" />
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-[10px] font-bold text-white/85"
              aria-hidden="true"
            >
              {initialsOf(session?.user?.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11.5px] font-semibold text-white/90">
                {session?.user?.name ?? 'Signed in'}
              </span>
              <span className="mt-0.5 block truncate text-[9.5px] font-medium text-white/40">
                {role.replaceAll('_', ' ')}
              </span>
            </span>
          </div>
          <p className="mt-3 font-mono text-[8.5px] tracking-[0.08em] text-white/25">
            MEDORCH / THEATRE DESK
          </p>
        </div>
      </aside>
    </>
  );
}
