"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type AlertItem = {
  id: string;
  type: "SCHEDULE" | "RESOURCE" | "SYSTEM" | "MAINTENANCE";
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
};

export function AlertCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const data = await apiClient.get<AlertItem[]>("/api/alerts");
      setAlerts(data || []);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<AlertItem[]>("/api/alerts")
      .then((data) => {
        if (isMounted) {
          setAlerts(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch alerts:", err);
          setError("Failed to load alerts");
          setIsLoading(false);
        }
      });

    const interval = setInterval(() => {
      apiClient
        .get<AlertItem[]>("/api/alerts")
        .then((data) => {
          if (isMounted) {
            setAlerts(data || []);
          }
        })
        .catch(console.error);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/api/alerts/${id}/read`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true, readAt: new Date().toISOString() } : a)),
      );
    } catch (err) {
      console.error("Failed to mark alert read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch("/api/alerts/read-all");
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true, readAt: new Date().toISOString() })));
    } catch (err) {
      console.error("Failed to mark all alerts read:", err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await apiClient.delete(`/api/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const getSeverityBadge = (severity: AlertItem["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="danger">Critical</Badge>;
      case "WARNING":
        return <Badge variant="warning">Warning</Badge>;
      case "INFO":
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Alerts"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Alert Center</h4>
                {unreadCount > 0 ? <Badge variant="danger">{unreadCount} unread</Badge> : null}
              </div>
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
                >
                  Mark all as read
                </button>
              ) : null}
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {isLoading && alerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">Loading alerts...</div>
              ) : error ? (
                <div className="p-4 text-center text-xs text-rose-500">{error}</div>
              ) : alerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No alerts found</div>
              ) : (
                <div className="space-y-1">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`relative rounded-lg p-3 transition-colors ${
                        !alert.isRead
                          ? "bg-blue-50/60 border-l-2 border-blue-600 dark:bg-blue-950/30 dark:border-blue-500"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getSeverityBadge(alert.severity)}
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {alert.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!alert.isRead ? (
                            <button
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="text-[11px] text-blue-600 hover:underline dark:text-blue-400 font-medium"
                              title="Mark read"
                            >
                              Read
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Dismiss"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <h5 className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {alert.title}
                      </h5>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {alert.message}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-2 text-center dark:border-slate-800">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={fetchAlerts}>
                Refresh Alerts
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
