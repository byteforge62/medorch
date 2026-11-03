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
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleMarkAsRead = async (alert: AlertItem) => {
    setActionError(null);
    try {
      await apiClient.patch(`/api/alerts/${alert.id}/read`);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id
            ? { ...a, isRead: true, readAt: new Date().toISOString() }
            : a,
        ),
      );
    } catch (err) {
      console.error('Failed to mark alert read:', err);
      setActionError(`Could not mark “${alert.title}” as read. Please retry.`);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionError(null);
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
      setActionError('Could not mark all alerts as read. Please retry.');
    }
  };

  const handleDeleteAlert = async (alert: AlertItem) => {
    setActionError(null);
    try {
      await apiClient.delete(`/api/alerts/${alert.id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
      setActionError(`Could not dismiss “${alert.title}”. Please retry.`);
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
          <span className="bg-danger text-foreground-inverse absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-none px-0.5 text-[10px] font-bold">
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
          <div className="border-border bg-surface fixed top-16 right-3 left-3 z-50 border sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-2 sm:w-96">
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

            {actionError ? (
              <p
                role="alert"
                className="text-danger border-danger/30 border-b px-4 py-2 text-xs"
              >
                {actionError}
              </p>
            ) : null}

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
                      className={`relative border-l-2 py-2.5 pr-2 pl-3 transition-colors ${
                        !alert.isRead
                          ? 'bg-primary-soft/50'
                          : 'hover:bg-surface-muted'
                      }`}
                      style={{
                        borderLeftColor:
                          alert.severity === 'CRITICAL'
                            ? 'var(--danger)'
                            : alert.severity === 'WARNING'
                              ? 'var(--warning)'
                              : 'var(--info)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}

                          {!alert.isRead ? (
                            <span
                              className="bg-primary h-1.5 w-1.5 shrink-0"
                              aria-label="Unread"
                            />
                          ) : null}
                        </div>
                        <div className="flex items-center space-x-1">
                          {!alert.isRead ? (
                            <button
                              onClick={() => handleMarkAsRead(alert)}
                              className="text-primary cursor-pointer text-[11px] font-medium hover:underline"
                              title="Mark read"
                            >
                              Read
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDeleteAlert(alert)}
                            className="text-foreground-muted hover:text-danger cursor-pointer p-1 transition-colors"
                            title="Dismiss"
                            aria-label={`Dismiss alert: ${alert.title}`}
                          >
                            <X size={14} weight="bold" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <h5 className="text-foreground mt-1.5 text-[13px] leading-snug font-semibold">
                        {alert.title}
                      </h5>
                      <p className="text-foreground-secondary mt-1 line-clamp-2 text-xs">
                        {alert.message}
                      </p>

                      <div className="text-foreground-muted mt-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] uppercase">
                        <span>{alert.type}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={alert.createdAt}>
                          {new Date(alert.createdAt).toLocaleString()}
                        </time>
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
