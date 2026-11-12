'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { CaretRight, Clock, List, SignOut } from '@phosphor-icons/react';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { BrandMark, Wordmark } from '@/components/brand/Brand';
import { PRIMARY_NAVIGATION_ID } from './Sidebar';

/*======================================================================
  Breadcrumb labels
  ======================================================================
  Record identifiers are operational data, not navigation copy. The
  command line names the record type instead of printing a UUID.
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
  LiveClock — the desk timebase.
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
      className="text-ink-secondary hidden items-center gap-1.5 text-[10.5px] font-medium md:inline-flex"
      aria-label="Local theatre time"
    >
      <Clock size={12} weight="duotone" aria-hidden="true" />
      <span className="tnum font-mono text-[10.5px] tabular-nums">{time}</span>
    </span>
  );
}

/*======================================================================
  Command line
  ======================================================================
  A paper rail, not another floating card. It holds orientation on the left
  and the day's instruments on the right: time, alert register and identity.
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

  const initials = (user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('');

  return (
    <header
      data-app-header
      className="border-rule/90 bg-paper/95 sticky top-0 z-30 border-b"
    >
      <div className="mx-auto flex h-[4.45rem] max-w-[96rem] items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="border-rule text-ink-secondary hover:border-rule-strong hover:bg-sheet flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[7px] border transition-colors lg:hidden"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls={PRIMARY_NAVIGATION_ID}
          >
            <List size={18} weight="bold" aria-hidden="true" />
          </button>

          <Link
            href="/dashboard"
            aria-label="MedOrch dashboard"
            className="inline-flex shrink-0 items-center sm:hidden lg:hidden"
          >
            <BrandMark className="h-8 w-8" />
          </Link>
          <span className="hidden shrink-0 sm:block lg:hidden">
            <Wordmark size="sm" />
          </span>

          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-[12px]">
              {segments.length === 0 ? (
                <li className="text-ink font-semibold">MedOrch</li>
              ) : (
                segments.map((segment, index) => {
                  const isLast = index === segments.length - 1;
                  return (
                    <li key={`${segment}-${index}`} className="flex min-w-0 items-center gap-1.5">
                      {index > 0 ? (
                        <CaretRight
                          size={9}
                          weight="bold"
                          className="text-ink-subtle shrink-0"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={`truncate ${
                          isLast ? 'text-ink font-semibold' : 'text-ink-muted font-medium'
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

        <div className="flex shrink-0 items-center gap-3">
          <LiveClock />
          <AlertCenter />

          {user ? (
            <>
              <span className="bg-rule hidden h-5 w-px sm:block" aria-hidden="true" />

              <div className="flex items-center gap-2">
                <span
                  className="bg-rail flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9.5px] font-bold text-white/90"
                  aria-hidden="true"
                >
                  {initials}
                </span>

                <div className="hidden min-w-0 xl:block">
                  <p className="text-ink max-w-[140px] truncate text-[11px] leading-tight font-semibold">
                    {user.name || 'User'}
                  </p>
                  <p className="text-ink-muted mt-0.5 truncate text-[9px] leading-tight">
                    {user.role?.replaceAll('_', ' ')}
                  </p>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-ink-muted hover:bg-sheet hover:text-ink flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] transition-colors"
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
