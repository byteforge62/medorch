"use client";

import React, {useCallback,useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AlertItem } from "@/components/alerts/AlertCenter";

export function AlertsSummaryWidget() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<AlertItem[]>("/api/alerts");
      setAlerts(data ?? []);
    } catch (err) {
      console.error("Failed to fetch alerts summary:", err);
      setError("Unable to load alerts. Please try again.");
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
    (alert) => alert.severity === "CRITICAL",
  ).length;

  const warningCount = unreadAlertsAll.filter(
    (alert) => alert.severity === "WARNING",
  ).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical & Recent Alerts</CardTitle>
        <Badge variant={unreadAlerts.length > 0 ? "danger" : "neutral"}>
          {unreadAlerts.length} Active
        </Badge>
      </CardHeader>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
            Critical
          </p>
          <p className="mt-1 text-xl font-semibold text-rose-900 dark:text-rose-100">
            {isLoading ? "—" : criticalCount}
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Warnings
          </p>
          <p className="mt-1 text-xl font-semibold text-amber-900 dark:text-amber-100">
            {isLoading ? "—" : warningCount}
          </p>
        </div>
      </div>


      {isLoading ? (
        <div className="p-4 text-center text-xs text-slate-500">
          Loading alerts...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
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
        <div className="p-6 text-center text-xs text-slate-400">
          All system alerts cleared
        </div>
      ) : (

        <div className="space-y-2">
          {unreadAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {alert.title}
                </span>
                <Badge
                  variant={
                    alert.severity === "CRITICAL"
                      ? "danger"
                      : alert.severity === "WARNING"
                        ? "warning"
                        : "info"
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
