'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useSession } from 'next-auth/react';
import { PencilSimple, Plus, X } from '@phosphor-icons/react';

import { apiClient, ApiClientError } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Field, Select, TextInput, Textarea } from '@/components/ui/Input';
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

type UserOption = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type ScheduleOption = {
  id: string;
  procedure: string;
  scheduledDate: string;
  patient?: {
    name?: string | null;
    patientCode?: string | null;
  } | null;
};

type AlertForm = {
  userId: string;
  scheduleId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
};

const EMPTY_ALERT_FORM: AlertForm = {
  userId: '',
  scheduleId: '',
  type: 'SYSTEM',
  title: '',
  message: '',
  severity: 'INFO',
};

const ALERT_TYPES: AlertType[] = [
  'SCHEDULE',
  'RESOURCE',
  'SYSTEM',
  'MAINTENANCE',
];

const ALERT_SEVERITIES: AlertSeverity[] = ['INFO', 'WARNING', 'CRITICAL'];

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
  const role = session?.user?.role;
  const isAdmin = role === 'ADMIN';
  const canCreate =
    role === 'ADMIN' || role === 'DOCTOR' || role === 'OT_STAFF';

  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const [composerMode, setComposerMode] = useState<'create' | 'edit' | null>(
    null,
  );
  const [editingAlert, setEditingAlert] = useState<AlertRecord | null>(null);
  const [form, setForm] = useState<AlertForm>(EMPTY_ALERT_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [recipients, setRecipients] = useState<UserOption[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);

  const requestAlerts = useCallback(
    () => apiClient.get<AlertRecord[]>('/api/alerts'),
    [],
  );

  const updateForm = useCallback(
    <K extends keyof AlertForm>(key: K, value: AlertForm[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const loadComposerOptions = useCallback(async () => {
    if (optionsLoaded || optionsLoading) return;

    setOptionsLoading(true);
    setFormError('');

    try {
      const [scheduleData, userData] = await Promise.all([
        apiClient.get<ScheduleOption[]>('/api/schedules'),
        isAdmin ? apiClient.get<UserOption[]>('/api/users') : Promise.resolve([]),
      ]);

      setScheduleOptions(scheduleData ?? []);
      setRecipients(userData ?? []);
      setOptionsLoaded(true);
    } catch (optionsError) {
      setFormError(
        optionsError instanceof ApiClientError
          ? optionsError.message
          : 'Could not load alert recipients and schedules.',
      );
    } finally {
      setOptionsLoading(false);
    }
  }, [isAdmin, optionsLoaded, optionsLoading]);

  const openCreateComposer = useCallback(() => {
    setComposerMode('create');
    setEditingAlert(null);
    setForm({
      ...EMPTY_ALERT_FORM,
      userId: isAdmin ? '' : session?.user?.id ?? '',
    });
    setFormError('');
    void loadComposerOptions();
  }, [isAdmin, loadComposerOptions, session?.user?.id]);

  const openEditComposer = useCallback((alert: AlertRecord) => {
    setComposerMode('edit');
    setEditingAlert(alert);
    setForm({
      userId: alert.userId,
      scheduleId: alert.scheduleId ?? '',
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
    });
    setFormError('');
  }, []);

  const closeComposer = useCallback(() => {
    if (saving) return;
    setComposerMode(null);
    setEditingAlert(null);
    setForm(EMPTY_ALERT_FORM);
    setFormError('');
  }, [saving]);

  useEffect(() => {
    if (!composerMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      composerRef.current
        ?.querySelector<HTMLInputElement>('input[name="alert-title"]')
        ?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [composerMode]);

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

  async function handleSubmitAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setFormError('A title and message are required.');
      return;
    }

    if (composerMode === 'create' && !form.userId) {
      setFormError('Select the person who should receive this alert.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (composerMode === 'edit' && editingAlert) {
        const updated = await apiClient.patch<AlertRecord>(
          `/api/alerts/${editingAlert.id}`,
          {
            title: form.title.trim(),
            message: form.message.trim(),
            severity: form.severity,
          },
        );

        setAlerts((current) =>
          current.map((alert) =>
            alert.id === editingAlert.id ? { ...alert, ...updated } : alert,
          ),
        );
      } else {
        const created = await apiClient.post<AlertRecord>('/api/alerts', {
          userId: form.userId,
          scheduleId: form.scheduleId || null,
          type: form.type,
          title: form.title.trim(),
          message: form.message.trim(),
          severity: form.severity,
        });

        setAlerts((current) => [created, ...current]);
        setFilter('ALL');
      }

      setComposerMode(null);
      setEditingAlert(null);
      setForm(EMPTY_ALERT_FORM);
    } catch (submitError) {
      setFormError(
        submitError instanceof ApiClientError
          ? submitError.message
          : composerMode === 'edit'
            ? 'Could not update this alert.'
            : 'Could not create this alert.',
      );
    } finally {
      setSaving(false);
    }
  }

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
        description={
          isAdmin
            ? 'Signals raised by theatre schedules, resources and system activity. Dispatch an alert to a user, edit the signal, then track it to read.'
            : 'Signals raised by theatre schedules, resources and system activity. Review the source and severity, then mark items read or dismiss them.'
        }
        actions={
          <>
            {canCreate ? (
              <Button
                type="button"
                size="sm"
                onClick={openCreateComposer}
              >
                <Plus size={13} weight="bold" aria-hidden="true" />
                New alert
              </Button>
            ) : null}

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
                        {isAdmin ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            disabled={busy}
                            onClick={() => openEditComposer(alert)}
                          >
                            <PencilSimple
                              size={12}
                              aria-hidden="true"
                            />
                            Edit
                          </Button>
                        ) : null}

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

      {composerMode ? (
        <div
          className="bg-foreground/45 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeComposer();
          }}
        >
          <div
            ref={composerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-composer-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                closeComposer();
              }
            }}
            className="border-border-strong bg-surface max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[var(--radius-panel)] border p-5 shadow-xl sm:p-6"
          >
            <div className="border-rule flex items-start justify-between gap-4 border-b pb-4">
              <div className="min-w-0">
                <p className="eyebrow">Alert desk</p>
                <h2
                  id="alert-composer-title"
                  className="text-ink mt-1 text-lg font-semibold"
                >
                  {composerMode === 'edit' ? 'Edit alert' : 'Dispatch alert'}
                </h2>
                <p className="text-ink-muted mt-1 text-[12px] leading-relaxed">
                  {composerMode === 'edit'
                    ? 'Update the signal visible to its recipient. Recipient and linked case cannot be changed after dispatch.'
                    : 'Create a persisted alert for a user, optionally linked to a theatre case.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                disabled={saving}
                aria-label="Close alert form"
                className="border-rule text-ink-subtle hover:bg-surface-subtle hover:text-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] border transition-colors disabled:opacity-50"
              >
                <X size={14} weight="bold" aria-hidden="true" />
              </button>
            </div>

            {formError ? (
              <p
                role="alert"
                className="border-danger/30 bg-danger-soft text-danger mt-4 rounded-[var(--radius-control)] border px-3 py-2 text-[12px] font-medium"
              >
                {formError}
              </p>
            ) : null}

            <form
              onSubmit={(event) => void handleSubmitAlert(event)}
              className="mt-4 space-y-4"
            >
              {composerMode === 'create' ? (
                <>
                  {isAdmin ? (
                    <Field label="Recipient" htmlFor="alert-recipient" required>
                      <Select
                        id="alert-recipient"
                        value={form.userId}
                        onChange={(event) =>
                          updateForm('userId', event.target.value)
                        }
                        disabled={saving || optionsLoading}
                      >
                        <option value="">
                          {optionsLoading ? 'Loading users…' : 'Select a user'}
                        </option>
                        {recipients.map((recipient) => (
                          <option key={recipient.id} value={recipient.id}>
                            {recipient.name || recipient.email} · {recipient.role}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  ) : (
                    <div className="border-rule bg-surface-subtle rounded-[var(--radius-control)] border px-3 py-2.5">
                      <p className="text-ink-subtle text-[9px] font-semibold tracking-[0.07em] uppercase">
                        Recipient
                      </p>
                      <p className="text-ink mt-1 text-[12px] font-medium">
                        {session?.user?.name ||
                          session?.user?.email ||
                          'Your account'}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Signal type" htmlFor="alert-type" required>
                      <Select
                        id="alert-type"
                        value={form.type}
                        onChange={(event) =>
                          updateForm('type', event.target.value as AlertType)
                        }
                        disabled={saving}
                      >
                        {ALERT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Severity" htmlFor="alert-severity" required>
                      <Select
                        id="alert-severity"
                        value={form.severity}
                        onChange={(event) =>
                          updateForm(
                            'severity',
                            event.target.value as AlertSeverity,
                          )
                        }
                        disabled={saving}
                      >
                        {ALERT_SEVERITIES.map((severity) => (
                          <option key={severity} value={severity}>
                            {SEVERITY[severity].label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field
                    label="Linked case"
                    htmlFor="alert-schedule"
                    hint="Optional. Links this alert to an accessible theatre case."
                  >
                    <Select
                      id="alert-schedule"
                      value={form.scheduleId}
                      onChange={(event) =>
                        updateForm('scheduleId', event.target.value)
                      }
                      disabled={saving || optionsLoading}
                    >
                      <option value="">No linked case</option>
                      {scheduleOptions.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.procedure} · {schedule.patient?.name ?? 'Patient'}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border-rule bg-surface-subtle rounded-[var(--radius-control)] border px-3 py-2.5">
                      <p className="text-ink-subtle text-[9px] font-semibold tracking-[0.07em] uppercase">
                        Recipient
                      </p>
                      <p className="text-ink mt-1 text-[12px] font-medium">
                        {editingAlert?.user?.name ||
                          editingAlert?.user?.email ||
                          'Alert recipient'}
                      </p>
                    </div>

                    <div className="border-rule bg-surface-subtle rounded-[var(--radius-control)] border px-3 py-2.5">
                      <p className="text-ink-subtle text-[9px] font-semibold tracking-[0.07em] uppercase">
                        Signal
                      </p>
                      <p className="text-ink mt-1 text-[12px] font-medium">
                        {editingAlert?.type ?? form.type}
                      </p>
                    </div>
                  </div>

                  <Field label="Severity" htmlFor="alert-severity" required>
                    <Select
                      id="alert-severity"
                      value={form.severity}
                      onChange={(event) =>
                        updateForm(
                          'severity',
                          event.target.value as AlertSeverity,
                        )
                      }
                      disabled={saving}
                    >
                      {ALERT_SEVERITIES.map((severity) => (
                        <option key={severity} value={severity}>
                          {SEVERITY[severity].label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </>
              )}

              <Field label="Title" htmlFor="alert-title" required>
                <TextInput
                  id="alert-title"
                  name="alert-title"
                  maxLength={200}
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  placeholder="e.g. Theatre 2 running late"
                  disabled={saving}
                />
              </Field>

              <Field label="Message" htmlFor="alert-message" required>
                <Textarea
                  id="alert-message"
                  rows={4}
                  maxLength={1000}
                  value={form.message}
                  onChange={(event) => updateForm('message', event.target.value)}
                  placeholder="Describe the signal and the action expected from the recipient."
                  disabled={saving}
                />
              </Field>

              <div className="border-rule flex items-center justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeComposer}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {composerMode === 'edit' ? 'Save alert' : 'Dispatch alert'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
