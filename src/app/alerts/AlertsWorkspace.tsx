'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { X } from '@phosphor-icons/react';

import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';

type AlertType = 'SCHEDULE' | 'RESOURCE' | 'SYSTEM' | 'MAINTENANCE';
type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

type AlertRecord = {
  id: string;
  userId: string;
  scheduleId: string | null;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  schedule?: {
    id: string;
    procedure: string;
    scheduledDate: string;
    status: string;
  } | null;
};

type Filter = 'ALL' | 'UNREAD';

const SEVERITY: Record<
  AlertSeverity,
  { label: string; badge: 'danger' | 'warning' | 'info'; rail: string }
> = {
  CRITICAL: { label: 'Critical', badge: 'danger', rail: 'bg-danger' },
  WARNING: { label: 'Warning', badge: 'warning', rail: 'bg-warning' },
  INFO: { label: 'Info', badge: 'info', rail: 'bg-info' },
};

function formatStamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function recipientOf(alert: AlertRecord) {
  return alert.user?.name?.trim() || alert.user?.email || null;
}

export function AlertsWorkspace() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const requestAlerts = useCallback(
    () => apiClient.get<AlertRecord[]>('/api/alerts'),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    requestAlerts()
      .then((data) => {
        if (!cancelled) setAlerts(data ?? []);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof ApiClientError
              ? loadError.message
              : 'Failed to load alerts.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestAlerts]);

  const loadAlerts = useCallback(
    async (initial = false) => {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError('');

      try {
        const data = await requestAlerts();
        setAlerts(data ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof ApiClientError
            ? loadError.message
            : 'Failed to load alerts.',
        );
      } finally {
        if (initial) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [requestAlerts],
  );

  const orderedAlerts = useMemo(
    () =>
      [...alerts].sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }),
    [alerts],
  );

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !alert.isRead).length,
    [alerts],
  );

  const visibleAlerts = useMemo(
    () =>
      filter === 'UNREAD'
        ? orderedAlerts.filter((alert) => !alert.isRead)
        : orderedAlerts,
    [filter, orderedAlerts],
  );

  async function handleMarkAsRead(alert: AlertRecord) {
    setBusyId(alert.id);
    setActionError('');

    try {
      const updated = await apiClient.patch<AlertRecord>(
        `/api/alerts/${alert.id}/read`,
      );

      setAlerts((current) =>
        current.map((item) =>
          item.id === alert.id ? { ...item, ...updated } : item,
        ),
      );
    } catch (updateError) {
      setActionError(
        updateError instanceof ApiClientError
          ? updateError.message
          : `Could not mark “${alert.title}” as read. Please retry.`,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDismiss(alert: AlertRecord) {
    setBusyId(alert.id);
    setActionError('');

    try {
      await apiClient.delete<{ success: boolean }>(`/api/alerts/${alert.id}`);
      setAlerts((current) => current.filter((item) => item.id !== alert.id));
    } catch (deleteError) {
      setActionError(
        deleteError instanceof ApiClientError
          ? deleteError.message
          : `Could not dismiss “${alert.title}”. Please retry.`,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true);
    setActionError('');

    try {
      await apiClient.patch<{ count: number }>('/api/alerts/read-all');
      const readAt = new Date().toISOString();

      setAlerts((current) =>
        current.map((alert) => ({
          ...alert,
          isRead: true,
          readAt: alert.readAt ?? readAt,
        })),
      );
    } catch (markError) {
      setActionError(
        markError instanceof ApiClientError
          ? markError.message
          : 'Could not mark all alerts as read. Please retry.',
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Operational signals"
        title="Alerts"
        meta={
          loading
            ? 'Loading alerts'
            : error && alerts.length === 0
              ? 'Unavailable'
              : `${unreadCount} unread · ${alerts.length} on file`
        }
        description="Signals raised by theatre schedules, resources and system activity. Review the source and severity, then mark items read or dismiss them."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || refreshing}
              onClick={() => void loadAlerts(false)}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>

            {!loading && unreadCount > 0 ? (
              <Button
                type="button"
                size="sm"
                isLoading={markingAll}
                loadingLabel="Marking alerts read"
                onClick={() => void handleMarkAllAsRead()}
              >
                Mark all read
              </Button>
            ) : null}
          </>
        }
      />

      {loading ? (
        <LoadingState message="Loading alerts…" />
      ) : error && alerts.length === 0 ? (
        <ErrorState
          title="Alerts could not be loaded"
          message={error}
          onRetry={() => void loadAlerts(true)}
        />
      ) : (
        <section className="panel-flush" aria-labelledby="alert-register-title">
          <header className="border-rule-soft flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="alert-register-title" className="text-ink text-[13px] font-semibold">
                Alert register
              </h2>

              <div
                className="flex items-center gap-1"
                role="group"
                aria-label="Filter alerts"
              >
                {(
                  [
                    { key: 'ALL', label: 'All', count: alerts.length },
                    { key: 'UNREAD', label: 'Unread', count: unreadCount },
                  ] as const
                ).map((option) => {
                  const active = filter === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(option.key)}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                        active
                          ? 'bg-primary text-primary-ink'
                          : 'text-ink-secondary hover:bg-surface-muted'
                      }`}
                    >
                      {option.label}
                      <span
                        className={`ml-1.5 ${
                          active ? 'text-primary-ink/70' : 'text-ink-subtle'
                        }`}
                      >
                        {option.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-ink-subtle font-mono text-[10px] tracking-[0.08em] uppercase">
              {isAdmin ? 'All recipients' : 'Assigned to you'} · newest first
            </p>
          </header>

          {actionError ? (
            <p
              role="alert"
              className="border-danger/30 bg-danger-soft text-danger border-b px-4 py-2 text-[12px] sm:px-5"
            >
              {actionError}
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="border-warning/30 bg-warning-soft text-ink-secondary flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-[12px] sm:px-5"
            >
              <span>{error} The last loaded list is shown below.</span>
              <button
                type="button"
                onClick={() => void loadAlerts(false)}
                className="text-primary cursor-pointer text-[11.5px] font-semibold underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          ) : null}

          {visibleAlerts.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                title={
                  alerts.length === 0
                    ? 'No alerts on file'
                    : 'No unread alerts'
                }
                description={
                  alerts.length === 0
                    ? 'Alerts raised for your role will appear here. Nothing has been generated.'
                    : 'Every alert assigned to you has been read.'
                }
              />
            </div>
          ) : (
            <ul className="divide-rule-soft divide-y">
              {visibleAlerts.map((alert) => {
                const severity = SEVERITY[alert.severity];
                const recipient = recipientOf(alert);
                const busy = busyId === alert.id;

                return (
                  <li
                    key={alert.id}
                    className={`relative px-4 py-4 sm:px-5 ${
                      alert.isRead ? 'bg-sheet' : 'bg-primary-soft/35'
                    }`}
                  >
                    <span
                      className={`${severity.rail} absolute top-0 bottom-0 left-0 w-[3px]`}
                      aria-hidden="true"
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={severity.badge}>{severity.label}</Badge>

                          <span className="text-ink-subtle font-mono text-[10px] tracking-[0.08em] uppercase">
                            {alert.type}
                          </span>

                          {!alert.isRead ? (
                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-primary">
                              <span
                                className="bg-primary h-1.5 w-1.5 rounded-full"
                                aria-hidden="true"
                              />
                              Unread
                            </span>
                          ) : null}
                        </div>

                        <h3 className="text-ink mt-1.5 text-[14px] leading-snug font-semibold">
                          {alert.title}
                        </h3>

                        <p className="text-ink-secondary mt-1 max-w-[78ch] text-[12.5px] leading-relaxed">
                          {alert.message}
                        </p>

                        <div className="text-ink-subtle mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.04em]">
                          <time dateTime={alert.createdAt}>
                            {formatStamp(alert.createdAt)}
                          </time>

                          {isAdmin && recipient ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>For {recipient}</span>
                            </>
                          ) : null}

                          {alert.schedule?.procedure ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">
                                {alert.schedule.procedure}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
                        {!alert.isRead ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            disabled={busy}
                            isLoading={busy}
                            loadingLabel="Marking alert read"
                            onClick={() => void handleMarkAsRead(alert)}
                          >
                            Mark read
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          disabled={busy}
                          onClick={() => void handleDismiss(alert)}
                        >
                          <X size={12} weight="bold" aria-hidden="true" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
