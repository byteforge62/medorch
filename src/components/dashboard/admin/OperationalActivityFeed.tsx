'use client';

import React from 'react';
import Link from 'next/link';

import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from './DashboardPrimitives';
import { formatDateTime, formatRelative } from './format';
import type { AuditAction, AuditLog } from './types';

const actionTone: Record<AuditAction, string> = {
  CREATE: 'bg-success',
  UPDATE: 'bg-primary',
  DELETE: 'bg-danger',
  LOGIN: 'bg-ink-subtle',
  LOGOUT: 'bg-ink-subtle',
  APPROVE: 'bg-success',
  REJECT: 'bg-danger',
  CANCEL: 'bg-warning',
  COMPLETE: 'bg-success',
};

export function OperationalActivityFeed({
  logs,
  total,
  error,
  onRetry,
}: {
  logs: AuditLog[];
  total: number;
  error?: string;
  onRetry: () => void;
}) {
  return (
    <Panel labelledBy="operational-activity" tone="neutral">
      <PanelHeader
        id="operational-activity"
        title="Operational activity"
        caption="Latest recorded audit events across the hospital."
        aside={
          <Link href="/audit" className="text-primary text-[10.5px] font-semibold hover:underline">
            Audit trail →
          </Link>
        }
      />

      {error ? <PanelError message={error} onRetry={onRetry} /> : null}

      {!error && logs.length === 0 ? (
        <PanelEmpty
          title="No recorded activity"
          description="The audit trail has no events in the current result set."
        />
      ) : null}

      {!error && logs.length > 0 ? (
        <ol className="divide-rule-soft divide-y">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-3 px-4 py-2.5 sm:px-5">
              <span
                className={`${actionTone[log.action]} mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-ink-secondary text-[11px] leading-snug">
                  {log.description ?? `${log.entity} ${log.action.toLowerCase()}`}
                </p>
                <p className="text-ink-subtle mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px]">
                  <span>{log.user?.name ?? 'System'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{log.entity}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={log.createdAt} title={formatDateTime(log.createdAt)}>
                    {formatRelative(log.createdAt)}
                  </time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {!error && logs.length > 0 ? (
        <p className="border-rule-soft text-ink-subtle border-t px-4 py-2 text-[10px] sm:px-5">
          Showing the latest {logs.length} of {total} recorded event{total === 1 ? '' : 's'}.
        </p>
      ) : null}
    </Panel>
  );
}
