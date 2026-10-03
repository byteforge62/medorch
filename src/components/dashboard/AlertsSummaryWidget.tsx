"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AlertItem } from "@/components/alerts/AlertCenter";

export function AlertsSummaryWidget() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        setIsLoading(true);
        const data = await apiClient.get<AlertItem[]>("/api/alerts");
        setAlerts(data || []);
      } catch (err) {
        console.error("Failed to fetch alerts summary:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead).slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical & Recent Alerts</CardTitle>
        <Badge variant={unreadAlerts.length > 0 ? "danger" : "neutral"}>
          {unreadAlerts.length} Active
        </Badge>
      </CardHeader>

      {isLoading ? (
        <div className="p-4 text-center text-xs text-slate-500">Loading alerts...</div>
      ) : unreadAlerts.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">All system alerts cleared</div>
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
