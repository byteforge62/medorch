'use client';

import React, { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  CaretRight,
  Clock,
  List,
  SignOut,
} from '@phosphor-icons/react';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { PRIMARY_NAVIGATION_ID } from './Sidebar';

/*======================================================================
  Breadcrumb labels
  ======================================================================
  Record identifiers are operational data, not navigation copy. The command
  bar names the record type instead of printing a UUID into the page frame.
====================================================================== */

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  schedules: 'Schedules',
  departments: 'Departments',
  patients: 'Patients',
  appointments: 'Appointments',
  doctors: 'Doctors',
  equipment: 'Equipment',
  'ot-rooms': 'Theatres',
  alerts: 'Alerts',
  users: 'Accounts',
  audit: 'Audit trail',
  unauthorized: 'Access boundary',
};

const RECORD_LABELS: Record<string, string> = {
  schedules: 'Case record',
  patients: 'Patient record',
  appointments: 'Visit record',
  doctors: 'Clinician record',
  equipment: 'Equipment record',
  'ot-rooms': 'Theatre record',
  users: 'Account record',
};

function isRecordId(segment: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    segment,
  );
}

function breadcrumbLabel(segment: string, index: number, segments: string[]) {
  if (isRecordId(segment)) {
    const parent = segments[index - 1];
    return RECORD_LABELS[parent] ?? 'Record';
  }

  return ROUTE_LABELS[segment] ?? segment.replaceAll('-', ' ');
}

/*======================================================================
  LiveClock — the instrument's own timebase.
====================================================================== */

const clockStore = {
  subscribe(onTick: () => void) {
    const timer = window.setInterval(onTick, 1000);
    return () => window.clearInterval(timer);
  },
  getSnapshot() {
    return new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },
  getServerSnapshot() {
    return '--:--:--';
  },
};

function LiveClock() {
  const time = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  return (
    <span
      className="text-ink-secondary bg-surface-subtle border-rule-soft hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-medium md:inline-flex"
      aria-label="Local theatre time"
    >
      <Clock size={12} weight="duotone" aria-hidden="true" />
      <span className="tnum font-mono text-[10.5px] tabular-nums">{time}</span>
    </span>
  );
}

/*======================================================================
  Command bar
  ======================================================================
  A white capsule floating at the top of the lavender working sheet. The
  breadcrumb says where you are; the right side holds the live timebase,
  alert register and the signed-in identity.
====================================================================== */

export function Header({
  onToggleSidebar,
  sidebarOpen = false,
  user: userOverride,
}: {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  /** User override for previews and tests; runtime reads the session. */
  user?: { name?: string | null; role?: string } | null;
}) {
  const { data: session } = useSession();
  const user = userOverride ?? session?.user;
  const pathname = usePathname() || '/';

  const segments = pathname.split('/').filter(Boolean);

  const roleTone: Record<string, string> = {
    ADMIN: 'bg-primary-soft text-primary',
    DOCTOR: 'bg-info-soft text-info',
    OT_STAFF: 'bg-success-soft text-success',
    PATIENT: 'bg-warning-soft text-warning',
  };

  const initials = (user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('');

  return (
    <header
      data-app-header
      className="sticky top-0 z-30 px-3 pt-3 sm:px-5 lg:px-6 lg:pr-8"
    >
      <div className="bg-sheet/92 border-rule flex h-[4.35rem] items-center justify-between gap-3 rounded-[20px] border px-3 shadow-[0_8px_28px_rgba(66,48,112,0.07)] backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="text-ink-secondary bg-surface-subtle hover:bg-pine-soft hover:text-primary flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[13px] transition-colors lg:hidden"
            aria-label={
              sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={sidebarOpen}
            aria-controls={PRIMARY_NAVIGATION_ID}
          >
            <List size={19} weight="bold" aria-hidden="true" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
              {segments.length === 0 ? (
                <li className="text-ink font-semibold">MedOrch</li>
              ) : (
                segments.map((segment, index) => {
                  const isLast = index === segments.length - 1;
                  return (
                    <li
                      key={`${segment}-${index}`}
                      className="flex min-w-0 items-center gap-1.5"
                    >
                      {index > 0 ? (
                        <CaretRight
                          size={10}
                          weight="bold"
                          className="text-ink-subtle shrink-0"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={`truncate ${
                          isLast
                            ? 'text-ink font-semibold'
                            : 'text-ink-muted font-medium'
                        }`}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {breadcrumbLabel(segment, index, segments)}
                      </span>
                    </li>
                  );
                })
              )}
            </ol>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LiveClock />

          <AlertCenter />

          {user ? (
            <>
              <span
                className="bg-rule hidden h-6 w-px sm:block"
                aria-hidden="true"
              />

              <div className="border-rule-soft bg-surface-subtle flex items-center gap-1 rounded-full border py-1 pr-1 pl-1">
                <span
                  className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
                  aria-hidden="true"
                >
                  {initials}
                </span>

                <div className="hidden min-w-0 pl-1 xl:block">
                  <p className="text-ink max-w-[150px] truncate text-[11.5px] leading-tight font-semibold">
                    {user.name || 'User'}
                  </p>
                  <p
                    className={`mt-0.5 inline-flex rounded-full px-1.5 py-px text-[8.5px] font-bold tracking-[0.05em] ${
                      roleTone[user.role || ''] || 'text-ink-muted'
                    }`}
                  >
                    {user.role?.replaceAll('_', ' ')}
                  </p>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-ink-muted hover:bg-sheet hover:text-ink flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <SignOut size={14} weight="bold" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
