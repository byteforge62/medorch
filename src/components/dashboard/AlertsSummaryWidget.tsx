'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { AlertItem } from '@/components/alerts/AlertCenter';

const severityRail: Record<AlertItem['severity'], string> = {
  CRITICAL: 'bg-danger',
  WARNING: 'bg-warning',
  INFO: 'bg-info',
};

/**
 * AlertsSummaryWidget — the exception column.
 *
 * Operational software earns its keep by surfacing what is wrong, so this
 * panel lists only unread alerts as ruled rows with a severity rail and the
 * time it was raised. Severity is never colour-only: the word is always
 * printed beside it. Cleared state is stated explicitly rather than left as an
 * empty box.
 */
export function AlertsSummaryWidget() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<AlertItem[]>('/api/alerts');
      setAlerts(data ?? []);
    } catch (err) {
      console.error('Failed to fetch alerts summary:', err);
      setError('Unable to load alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAlerts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAlerts]);

  const unread = alerts.filter((alert) => !alert.isRead);
  const criticalCount = unread.filter(
    (alert) => alert.severity === 'CRITICAL',
  ).length;
  const warningCount = unread.filter(
    (alert) => alert.severity === 'WARNING',
  ).length;

  const stamp = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <section
      aria-labelledby="exceptions-title"
      className="border border-border"
    >
      <div className="border-border flex items-end justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div>
          <p className="eyebrow">Requires attention</p>
          <h2
            id="exceptions-title"
            className="text-foreground mt-1.5 text-base font-semibold tracking-tight"
          >
            Exceptions
          </h2>
        </div>

        <div className="text-right font-mono text-[10px] tracking-[0.14em] uppercase">
          <p className="text-danger">{criticalCount} critical</p>
          <p className="text-warning mt-0.5">{warningCount} warning</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-foreground-muted bg-surface px-4 py-5 font-mono text-[11px] tracking-[0.14em] uppercase sm:px-5">
          Loading alerts…
        </p>
      ) : error ? (
        <div role="alert" className="bg-surface px-4 py-4 sm:px-5">
          <p className="text-danger text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void loadAlerts()}
            className="text-primary mt-2 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      ) : unread.length === 0 ? (
        <div className="bg-surface px-4 py-5 sm:px-5">
          <p className="text-foreground font-medium">Nothing outstanding</p>
          <p className="text-foreground-muted mt-1 text-sm">
            All operational alerts have been read.
          </p>
        </div>
      ) : (
        <ul className="bg-border divide-y divide-border">
          {unread.map((alert) => (
            <li key={alert.id} className="bg-surface">
              <div className="relative py-3 pr-4 pl-5 sm:pr-5">
                <span
                  className={`absolute top-0 bottom-0 left-0 w-[3px] ${severityRail[alert.severity]}`}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-3">
                  <p className="text-foreground text-sm font-semibold">
                    {alert.title}
                  </p>

                  <span
                    className={`shrink-0 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'text-danger'
                        : alert.severity === 'WARNING'
                          ? 'text-warning'
                          : 'text-info'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-foreground-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                  {alert.message}
                </p>

                <p className="text-foreground-subtle mt-1.5 font-mono text-[10px] tracking-[0.12em] uppercase">
                  {alert.type} · {stamp(alert.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
