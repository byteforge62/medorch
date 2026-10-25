'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AlertItem } from '@/components/alerts/AlertCenter';

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

  const unreadAlerts = alerts.filter((a) => !a.isRead).slice(0, 4);
  const unreadAlertsAll = alerts.filter((alert) => !alert.isRead);

  const criticalCount = unreadAlertsAll.filter(
    (alert) => alert.severity === 'CRITICAL',
  ).length;

  const warningCount = unreadAlertsAll.filter(
    (alert) => alert.severity === 'WARNING',
  ).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical & Recent Alerts</CardTitle>
        <Badge variant={unreadAlerts.length > 0 ? 'danger' : 'neutral'}>
          {unreadAlerts.length} Active
        </Badge>
      </CardHeader>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="border-danger-soft bg-danger-soft rounded-lg border p-3">
          <p className="text-danger text-xs font-medium">Critical</p>
          <p className="text-danger mt-1 text-xl font-semibold">
            {isLoading ? '—' : criticalCount}
          </p>
        </div>

        <div className="border-warning-soft bg-warning-soft rounded-lg border p-3">
          <p className="text-warning text-xs font-medium">Warnings</p>
          <p className="text-warning mt-1 text-xl font-semibold">
            {isLoading ? '—' : warningCount}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-foreground-subtle p-4 text-center text-xs">
          Loading alerts...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="border-danger-soft bg-danger-soft text-danger rounded-lg border p-4 text-sm"
        >
          {error}
          <button
            type="button"
            onClick={() => void loadAlerts()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : unreadAlerts.length === 0 ? (
        <div className="text-foreground-subtle p-6 text-center text-xs">
          All system alerts cleared
        </div>
      ) : (
        <div className="space-y-2">
          {unreadAlerts.map((alert) => (
            <div
              key={alert.id}
              className="border-border bg-surface-muted rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-semibold">
                  {alert.title}
                </span>
                <Badge
                  variant={
                    alert.severity === 'CRITICAL'
                      ? 'danger'
                      : alert.severity === 'WARNING'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-foreground-muted mt-1 line-clamp-2 text-xs">
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
