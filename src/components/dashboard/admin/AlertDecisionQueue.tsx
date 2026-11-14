'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Info, SealWarning, Warning } from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import { AlertCard } from '../cards';
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
        <div className="flex-1 space-y-2 p-3">
          {unread.slice(0, 5).map((alert) => {
            const severity = SEVERITY[alert.severity];
            const busy = busyId === alert.id;
            const tone =
              alert.severity === 'CRITICAL'
                ? 'danger'
                : alert.severity === 'WARNING'
                  ? 'warning'
                  : 'info';

            return (
              <AlertCard
                key={alert.id}
                icon={
                  alert.severity === 'CRITICAL' ? (
                    <Warning size={15} weight="fill" aria-hidden="true" />
                  ) : alert.severity === 'WARNING' ? (
                    <SealWarning size={15} weight="duotone" aria-hidden="true" />
                  ) : (
                    <Info size={15} weight="duotone" aria-hidden="true" />
                  )
                }
                severity={tone}
                title={alert.title}
                message={alert.message}
                meta={
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] uppercase ${severity.chip}`}
                    >
                      {severity.label}
                    </span>
                    <span className="text-ink-subtle text-[10px]">
                      {alert.type.toLowerCase()} · {formatRelative(alert.createdAt)}
                    </span>
                  </div>
                }
                href={alert.schedule ? `/schedules/${alert.schedule.id}` : undefined}
                hrefLabel={alert.schedule ? 'Case record' : undefined}
                action={
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
                }
              />
            );
          })}
        </div>
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
