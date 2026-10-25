'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X } from '@phosphor-icons/react';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export type AlertItem = {
  id: string;
  type: 'SCHEDULE' | 'RESOURCE' | 'SYSTEM' | 'MAINTENANCE';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
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
      const data = await apiClient.get<AlertItem[]>('/api/alerts');
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<AlertItem[]>('/api/alerts')
      .then((data) => {
        if (isMounted) {
          setAlerts(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch alerts:', err);
          setError('Failed to load alerts');
          setIsLoading(false);
        }
      });

    const interval = setInterval(() => {
      apiClient
        .get<AlertItem[]>('/api/alerts')
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
        prev.map((a) =>
          a.id === id
            ? { ...a, isRead: true, readAt: new Date().toISOString() }
            : a,
        ),
      );
    } catch (err) {
      console.error('Failed to mark alert read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch('/api/alerts/read-all');
      setAlerts((prev) =>
        prev.map((a) => ({
          ...a,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
    } catch (err) {
      console.error('Failed to mark all alerts read:', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await apiClient.delete(`/api/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const getSeverityBadge = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="danger">Critical</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Warning</Badge>;
      case 'INFO':
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border-strong bg-surface text-foreground-muted hover:bg-surface-muted hover:text-foreground relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border transition-colors"
        aria-label="Alerts"
      >
        <Bell size={18} weight="regular" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="bg-danger text-foreground-inverse absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="border-border bg-surface absolute right-0 z-50 mt-2 w-80 rounded-[var(--radius-card)] border shadow-lg sm:w-96">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-foreground text-sm font-semibold">
                  Alert Center
                </h4>
                {unreadCount > 0 ? (
                  <Badge variant="danger">{unreadCount} unread</Badge>
                ) : null}
              </div>
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-primary cursor-pointer text-xs font-medium hover:underline"
                >
                  Mark all as read
                </button>
              ) : null}
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {isLoading && alerts.length === 0 ? (
                <div className="text-foreground-muted p-4 text-center text-xs">
                  Loading alerts...
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="text-danger p-4 text-center text-xs"
                >
                  {error}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-foreground-muted p-6 text-center text-xs">
                  No alerts found
                </div>
              ) : (
                <div className="space-y-1">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`relative rounded-lg p-3 transition-colors ${
                        !alert.isRead
                          ? 'border-primary bg-primary-soft/60 border-l-2'
                          : 'hover:bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getSeverityBadge(alert.severity)}
                          <span className="text-foreground-muted text-[10px] font-semibold tracking-wider uppercase">
                            {alert.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!alert.isRead ? (
                            <button
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="text-primary cursor-pointer text-[11px] font-medium hover:underline"
                              title="Mark read"
                            >
                              Read
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-foreground-muted hover:text-danger cursor-pointer p-1 transition-colors"
                            title="Dismiss"
                            aria-label="Dismiss alert"
                          >
                            <X size={14} weight="bold" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <h5 className="text-foreground mt-1 text-xs font-semibold">
                        {alert.title}
                      </h5>
                      <p className="text-foreground-secondary mt-0.5 line-clamp-2 text-xs">
                        {alert.message}
                      </p>

                      <div className="text-foreground-muted mt-2 text-[10px]">
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-border border-t p-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={fetchAlerts}
              >
                Refresh Alerts
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
