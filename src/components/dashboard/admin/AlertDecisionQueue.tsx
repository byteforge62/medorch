'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import {
  CountTag,
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from './DashboardPrimitives';
import { formatRelative, SEVERITY } from './format';
import type { AlertRecord } from './types';

export function AlertDecisionQueue({
  alerts,
  error,
  actionError,
  busyId,
  onMarkRead,
  onRetry,
}: {
  alerts: AlertRecord[];
  error?: string;
  actionError?: string;
  busyId: string | null;
  onMarkRead: (alert: AlertRecord) => void;
  onRetry: () => void;
}) {
  const unread = useMemo(
    () =>
      alerts
        .filter((alert) => !alert.isRead)
        .slice()
        .sort((first, second) => {
          const bySeverity =
            SEVERITY[first.severity].rank - SEVERITY[second.severity].rank;
          if (bySeverity !== 0) return bySeverity;
          return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
        }),
    [alerts],
  );

  const critical = unread.filter((alert) => alert.severity === 'CRITICAL').length;
  const warning = unread.filter((alert) => alert.severity === 'WARNING').length;

  return (
    <Panel labelledBy="alert-queue" className="flex h-full flex-col" tone="warning">
      <PanelHeader
        id="alert-queue"
        title="Alerts needing review"
        caption="Unread operational signals, ordered by severity and recency."
        aside={
          <div className="flex items-center gap-1.5">
            {critical ? <CountTag tone="critical">{critical} critical</CountTag> : null}
            {warning ? <CountTag tone="warning">{warning} warning</CountTag> : null}
            {!critical && !warning ? <CountTag tone="positive">Inbox clear</CountTag> : null}
          </div>
        }
      />

      {error ? <PanelError message={error} onRetry={onRetry} /> : null}

      {!error && unread.length === 0 ? (
        <PanelEmpty
          title="No unread alerts"
          description="Every alert currently on file has been read. The full register remains available."
        />
      ) : null}

      {!error && unread.length > 0 ? (
        <ul className="divide-rule-soft flex-1 divide-y">
          {unread.slice(0, 5).map((alert) => {
            const severity = SEVERITY[alert.severity];
            const busy = busyId === alert.id;

            return (
              <li key={alert.id} className="relative px-4 py-3.5 sm:px-5">
                <span
                  className={`${severity.rail} absolute top-0 bottom-0 left-0 w-[3px]`}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`${severity.chip} rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.06em] uppercase`}
                  >
                    {severity.label}
                  </span>
                  <span className="text-ink-subtle text-[10.5px]">
                    {alert.type.toLowerCase()} · {formatRelative(alert.createdAt)}
                  </span>
                </div>

                <p className="text-ink mt-1.5 text-[12.5px] leading-snug font-semibold">
                  {alert.title}
                </p>
                <p className="text-ink-muted mt-1 line-clamp-2 text-[11.5px] leading-relaxed">
                  {alert.message}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  {alert.schedule ? (
                    <Link
                      href={`/schedules/${alert.schedule.id}`}
                      className="text-primary max-w-full truncate text-[10.5px] font-semibold hover:underline"
                    >
                      {alert.schedule.procedure} →
                    </Link>
                  ) : (
                    <span className="text-ink-subtle text-[10.5px]">No linked schedule</span>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    isLoading={busy}
                    loadingLabel="Marking alert read"
                    disabled={busyId !== null}
                    onClick={() => onMarkRead(alert)}
                  >
                    Mark read
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {actionError ? (
        <p role="alert" className="border-danger/25 bg-danger-soft text-danger border-t px-4 py-2 text-[11.5px] sm:px-5">
          {actionError}
        </p>
      ) : null}

      <div className="border-rule-soft mt-auto flex items-center justify-between border-t px-4 py-2.5 sm:px-5">
        <span className="text-ink-subtle text-[10.5px]">
          {unread.length > 5 ? `${unread.length - 5} more in the register` : 'Register up to date'}
        </span>
        <Link href="/alerts" className="text-primary text-[11px] font-semibold hover:underline">
          Open alert register →
        </Link>
      </div>
    </Panel>
  );
}
