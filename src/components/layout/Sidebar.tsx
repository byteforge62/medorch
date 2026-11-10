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
import { BrandMark } from '@/components/brand/Brand';

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
    name: 'Theatres',
    href: '/ot-rooms',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: DoorOpen,
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
  Lavender navigation panel
  ======================================================================
  A persistent white panel floating inside the lavender field. Icons sit
  in soft lavender tiles; the active destination turns its tile violet
  and its row lavender. Labels remain visible at every desktop width so
  the navigation reads as a place, not a hover secret.
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
          className="fixed inset-0 z-40 bg-[#25213b]/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id={PRIMARY_NAVIGATION_ID}
        data-app-sidebar
        aria-label="Primary navigation"
        className={`bg-sheet border-rule fixed top-0 bottom-0 left-0 z-50 flex w-[17rem] flex-col overflow-hidden border-r shadow-[0_18px_60px_rgba(66,48,112,0.10)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.75,0.2,1)] lg:top-4 lg:bottom-4 lg:left-4 lg:z-30 lg:w-[16rem] lg:rounded-[28px] lg:border ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-[5.25rem] shrink-0 items-center justify-between px-5">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="MedOrch dashboard"
          >
            <BrandMark className="h-9 w-9 shrink-0 text-primary" />
            <span className="flex min-w-0 flex-col">
              <span className="font-display text-ink truncate text-[18px] leading-none font-semibold tracking-[-0.03em]">
                MedOrch
              </span>
              <span className="text-ink-muted mt-1.5 truncate text-[10px] font-medium tracking-[0.02em]">
                Theatre operations
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="text-ink-muted hover:bg-surface-subtle hover:text-ink flex h-9 w-9 items-center justify-center rounded-xl transition-colors lg:hidden"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <nav className="thin-scroll flex-1 overflow-y-auto px-3 pb-3">
          {groups.map((group) => {
            const items = allowed.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="mb-5">
                <p className="text-ink-subtle mb-2 px-3 text-[9.5px] font-semibold tracking-[0.13em] uppercase">
                  {groupLabels[group]}
                </p>

                <ul className="space-y-1">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    const IconComponent = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          title={item.name}
                          className={`group flex h-11 items-center gap-3 rounded-[14px] px-2.5 transition-colors duration-200 ${
                            active
                              ? 'bg-primary-soft text-primary'
                              : 'text-ink-secondary hover:bg-surface-subtle hover:text-ink'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-200 ${
                              active
                                ? 'bg-primary text-white shadow-[0_5px_14px_rgba(101,80,181,0.22)]'
                                : 'bg-surface-subtle text-ink-muted group-hover:bg-pine-soft group-hover:text-primary'
                            }`}
                            aria-hidden="true"
                          >
                            <IconComponent
                              size={17}
                              weight={active ? 'fill' : 'regular'}
                            />
                          </span>

                          <span
                            className={`min-w-0 flex-1 truncate text-[13px] ${
                              active ? 'font-semibold' : 'font-medium'
                            }`}
                          >
                            {item.name}
                          </span>

                          {active ? (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden="true"
                            />
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

        <div className="shrink-0 px-3 pb-3">
          <div className="bg-surface-subtle border-rule-soft rounded-[18px] border p-3.5">
            <div className="flex items-center gap-2">
              <span
                className="bg-success h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_3px_rgba(32,138,104,0.12)]"
                aria-hidden="true"
              />
              <p className="text-ink-secondary text-[10.5px] font-semibold">
                Systems operational
              </p>
            </div>

            <div className="border-rule-soft mt-3 flex items-center gap-2.5 border-t pt-3">
              <span
                className="bg-primary-soft text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                aria-hidden="true"
              >
                {initialsOf(session?.user?.name)}
              </span>
              <span className="min-w-0">
                <span className="text-ink block truncate text-[11.5px] font-semibold">
                  {session?.user?.name ?? 'Signed in'}
                </span>
                <span className="text-ink-muted mt-0.5 block truncate text-[9.5px] font-medium tracking-[0.04em] uppercase">
                  {role.replaceAll('_', ' ')}
                </span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
