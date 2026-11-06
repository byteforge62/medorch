'use client';

import React, { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { List, SignOut } from '@phosphor-icons/react';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { PRIMARY_NAVIGATION_ID } from './Sidebar';

/*======================================================================
  LiveClock — the instrument's own timebase.
  ======================================================================
  Rendered client-side after mount so the server and client markup agree.
  Local theatre time, 24-hour, tabular.
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
      className="text-ink-muted tnum hidden font-mono text-[11px] tabular-nums md:inline"
      aria-label="Local theatre time"
    >
      {time}
    </span>
  );
}

/*======================================================================
  Command bar
  ======================================================================
  A quiet strip across the top of the working sheet: where you are on the
  left, the timebase and your identity on the right. It floats over the page
  rather than ruling it off, so the content beneath keeps its air.
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
    OT_STAFF: 'bg-warning-soft text-warning',
    PATIENT: 'bg-vermilion-soft text-vermilion',
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
      className="border-rule-soft bg-paper/85 sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:px-6 lg:px-8"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="border-rule text-ink hover:bg-surface flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border transition-colors lg:hidden"
          aria-label={
            sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={sidebarOpen}
          aria-controls={PRIMARY_NAVIGATION_ID}
        >
          <List size={19} weight="bold" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
            {segments.length === 0 ? (
              <li className="text-ink font-medium">MedOrch</li>
            ) : (
              segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                return (
                  <li
                    key={`${segment}-${index}`}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    {index > 0 ? (
                      <span
                        className="text-ink-subtle shrink-0"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    ) : null}
                    <span
                      className={`truncate capitalize ${
                        isLast ? 'text-ink font-semibold' : 'text-ink-muted'
                      }`}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {segment.replaceAll('-', ' ')}
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

        <span className="bg-rule hidden h-5 w-px md:block" aria-hidden="true" />

        <AlertCenter />

        {user ? (
          <>
            <span
              className="bg-rule hidden h-5 w-px sm:block"
              aria-hidden="true"
            />

            <div className="flex items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <p className="text-ink max-w-[190px] truncate text-[13px] leading-tight font-semibold">
                  {user.name || 'User'}
                </p>
                <p
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] ${
                    roleTone[user.role || ''] || 'text-ink-muted'
                  }`}
                >
                  {user.role}
                </p>
              </div>

              <span
                className="bg-primary-soft text-primary ring-primary/15 hidden h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold ring-1 sm:flex"
                aria-hidden="true"
              >
                {initials}
              </span>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-ink-muted hover:bg-surface hover:text-ink flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <SignOut size={17} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
