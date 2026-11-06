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
} from '@phosphor-icons/react';
import type { UserRole } from '@/generated/prisma/client';
import { BrandMark } from '@/components/brand/Brand';

/** Stable id shared with the Header toggle so `aria-controls` resolves. */
export const PRIMARY_NAVIGATION_ID = 'primary-navigation';

interface NavItem {
  code: string;
  name: string;
  href: string;
  roles: UserRole[];
  icon: React.ReactNode;
  group: 'work' | 'control';
}

const navItems: NavItem[] = [
  {
    code: '01',
    name: 'Dashboard',
    href: '/dashboard',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF', 'PATIENT'],
    icon: <SquaresFour size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '02',
    name: 'Schedules',
    href: '/schedules',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <CalendarBlank size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '03',
    name: 'Departments',
    href: '/departments',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <Buildings size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '04',
    name: 'Patients',
    href: '/patients',
    roles: ['ADMIN', 'DOCTOR'],
    icon: <Users size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '05',
    name: 'Doctors',
    href: '/doctors',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <Stethoscope size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '06',
    name: 'Equipment',
    href: '/equipment',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <FirstAidKit size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '07',
    name: 'Theatres',
    href: '/ot-rooms',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <DoorOpen size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '08',
    name: 'My appointments',
    href: '/patients/appointments',
    roles: ['PATIENT'],
    icon: <CalendarCheck size={16} weight="regular" />,
    group: 'work',
  },
  {
    code: '09',
    name: 'Accounts',
    href: '/users',
    roles: ['ADMIN'],
    icon: <UserList size={16} weight="regular" />,
    group: 'control',
  },
  {
    code: '10',
    name: 'Audit trail',
    href: '/audit',
    roles: ['ADMIN'],
    icon: <ClipboardText size={16} weight="regular" />,
    group: 'control',
  },
];

const groupLabels: Record<NavItem['group'], string> = {
  work: 'Theatre operations',
  control: 'Administration',
};

/*======================================================================
  Instrument rail
  ======================================================================
  A narrow spine (84px) that widens to 256px on hover or keyboard focus.
  Everything that is not part of the collapsed glyph set — wordmark, group
  names, destination labels, status text — is clipped and faded out, so the
  collapsed rail reads as a numbered index and never leaks into the sheet.

  The active destination is a printed tab pulled out of the dark spine: paper
  fill, ink type, a vermilion signal tick and a 2px edge mark.
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

  /* On the mobile drawer the labels must always be visible; in the desktop
     rail they appear only while the rail is open. */
  const disclose = isOpen
    ? 'opacity-100'
    : 'opacity-0 lg:group-hover/rail:opacity-100';

  return (
    <>
      {isOpen ? (
        <div
          className="bg-ink/55 fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id={PRIMARY_NAVIGATION_ID}
        data-app-sidebar
        aria-label="Primary navigation"
        className={`group/rail bg-sheet text-ink border-rule fixed top-0 bottom-0 left-0 z-50 flex w-[17rem] flex-col overflow-hidden border-r transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,0.75,0.2,1)] lg:w-[var(--rail-closed)] lg:focus-within:w-[var(--rail-open)] lg:hover:w-[var(--rail-open)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Masthead — the mark alone when collapsed */}
        <div className="border-rule flex h-16 shrink-0 items-center gap-3 overflow-hidden border-b px-6">
          <BrandMark className="text-brass h-6 w-6 shrink-0" />
          <span
            className={`flex min-w-0 flex-col transition-opacity duration-200 ${disclose}`}
          >
            <span className="text-ink text-[15px] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap">
              MedOrch
            </span>
            <span className="text-ink-muted mt-1.5 text-[10px] leading-none font-medium whitespace-nowrap">
              Theatre control
            </span>
          </span>
        </div>

        {/* Index */}
        <nav className="thin-scroll flex-1 overflow-x-hidden overflow-y-auto py-5">
          {groups.map((group) => {
            const items = allowed.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="mb-7">
                <div className="mb-2 flex items-center gap-2 px-6">
                  <span
                    className={`bg-rule h-px w-3 shrink-0 transition-opacity duration-200 ${disclose}`}
                    aria-hidden="true"
                  />
                  <p
                    className={`text-ink-muted text-[10px] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-opacity duration-200 ${disclose}`}
                  >
                    {groupLabels[group]}
                  </p>
                </div>

                <ul>
                  {items.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          title={item.name}
                          className={`relative mx-2.5 flex h-10 items-center gap-3 rounded-[var(--radius-control)] px-3 transition-colors duration-200 ${
                            active
                              ? 'bg-pine-soft text-pine'
                              : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
                          }`}
                        >
                          <span className="shrink-0" aria-hidden="true">
                            {item.icon}
                          </span>

                          <span
                            className={`truncate text-[13px] whitespace-nowrap transition-opacity duration-200 ${disclose} ${
                              active ? 'font-semibold' : 'font-medium'
                            }`}
                          >
                            {item.name}
                          </span>

                          {active ? (
                            <span
                              className="bg-pine ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
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

        {/* Footer — status readout, clipped when collapsed */}
        <div className="border-rule shrink-0 overflow-hidden border-t px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className="signal-dot bg-brass h-1.5 w-1.5 shrink-0"
              aria-hidden="true"
            />
            <span
              className={`text-ink-muted text-[10px] font-medium whitespace-nowrap transition-opacity duration-200 ${disclose}`}
            >
              System operational
            </span>
          </div>
          <p
            className={`text-ink-subtle mt-2 font-mono text-[10px] whitespace-nowrap uppercase transition-opacity duration-200 ${disclose}`}
          >
            v0.1.0 · {role}
          </p>
        </div>
      </aside>
    </>
  );
}
