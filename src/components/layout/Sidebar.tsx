'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

/** Stable id shared with the Header toggle so `aria-controls` resolves. */
export const PRIMARY_NAVIGATION_ID = 'primary-navigation';

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
    icon: <SquaresFour size={16} weight="regular" />,
  },
  {
    name: 'Schedules',
    href: '/schedules',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <CalendarBlank size={16} weight="regular" />,
  },
  {
    name: 'Departments',
    href: '/departments',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <Buildings size={16} weight="regular" />,
  },
  {
    name: 'Patients',
    href: '/patients',
    roles: ['ADMIN', 'DOCTOR'],
    icon: <Users size={16} weight="regular" />,
  },
  {
    name: 'Doctors',
    href: '/doctors',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <Stethoscope size={16} weight="regular" />,
  },
  {
    name: 'Equipment',
    href: '/equipment',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <FirstAidKit size={16} weight="regular" />,
  },
  {
    name: 'OT Rooms',
    href: '/ot-rooms',
    roles: ['ADMIN', 'DOCTOR', 'OT_STAFF'],
    icon: <DoorOpen size={16} weight="regular" />,
  },
  {
    name: 'My Appointments',
    href: '/patients/appointments',
    roles: ['PATIENT'],
    icon: <CalendarCheck size={16} weight="regular" />,
  },
  {
    name: 'Users',
    href: '/users',
    roles: ['ADMIN'],
    icon: <UserList size={16} weight="regular" />,
  },
  {
    name: 'Audit Trails',
    href: '/audit',
    roles: ['ADMIN'],
    icon: <ClipboardText size={16} weight="regular" />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'PATIENT';

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(userRole as UserRole),
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen ? (
        <div
          className="bg-foreground/40 fixed inset-0 z-40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id={PRIMARY_NAVIGATION_ID}
        aria-label="Primary navigation"
        className={`border-border bg-surface fixed top-16 bottom-0 left-0 z-40 w-64 border-r transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-1">
            <div className="text-foreground-muted px-3 py-2 text-[10px] font-semibold tracking-wider uppercase">
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
                    className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary'
                        : 'text-foreground-secondary hover:bg-surface-muted hover:text-foreground'
                    }`}
                  >
                    <span
                      className={
                        isActive ? 'text-primary' : 'text-foreground-muted'
                      }
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-border bg-surface-muted rounded-[var(--radius-card)] border p-3.5">
            <div className="flex items-center space-x-2">
              <span
                className="bg-success h-2 w-2 rounded-full"
                aria-hidden="true"
              />
              <span className="text-foreground-secondary text-xs font-semibold">
                System Operational
              </span>
            </div>
            <p className="text-foreground-muted mt-1 text-[11px]">
              MedOrch v0.1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
