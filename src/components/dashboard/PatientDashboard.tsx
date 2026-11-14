'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  Bell,
  CalendarBlank,
  CalendarX,
  CheckCircle,
  ClockCounterClockwise,
  MapPin,
  UserCircle,
} from '@phosphor-icons/react';

import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiClient } from '@/lib/api/client';
import { ALERT_SEVERITY } from '@/lib/operational-status';

/*======================================================================
  Patient dashboard
  ======================================================================
  Only what the patient portal actually exposes is shown: their own
  scheduled procedures (/api/me/appointments), their own notifications
  (/api/alerts), and the identity carried by the portal payload plus the
  session. Clinical notes, results and contact details are not exposed by
  these endpoints, so the record panel says so rather than inventing them.
====================================================================== */

type PortalScheduleStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

type PortalPriority = 'ELECTIVE' | 'URGENT' | 'EMERGENCY';

type Appointment = {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: PortalScheduleStatus;
  priority: PortalPriority;
  department: { name: string } | null;
  otRoom: { name: string; code: string } | null;
};

type PatientPortal = {
  id: string;
  patientCode: string;
  name: string;
  schedules: Appointment[];
  currentTime?: string;
};

type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

type PatientAlert = {
  id: string;
  scheduleId: string | null;
  type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: string;
  schedule: {
    id: string;
    procedure: string;
    scheduledDate: string;
    status: PortalScheduleStatus;
  } | null;
};

const PRIORITY_LABEL: Record<PortalPriority, string> = {
  ELECTIVE: 'Elective',
  URGENT: 'Urgent',
  EMERGENCY: 'Emergency',
};

function parseWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  const date = parseWhen(value);
  if (!date) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatTime(value: string) {
  return formatDate(value, { hour: '2-digit', minute: '2-digit' });
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)}–${formatTime(end)}`;
}

function dayParts(value: string) {
  const date = parseWhen(value);
  if (!date) return { weekday: '—', day: '--', month: '---' };
  return {
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
      .format(date)
      .toUpperCase(),
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date),
  };
}

function countdown(target: string, from: number) {
  const when = parseWhen(target);
  if (!when) return null;

  const diff = when.getTime() - from;
  const minutes = Math.round(Math.abs(diff) / 60_000);

  if (minutes < 60) {
    return diff >= 0 ? `in ${minutes} min` : `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return diff >= 0 ? `in ${hours} h` : `${hours} h ago`;
  }

  const days = Math.round(hours / 24);
  return diff >= 0 ? `in ${days} d` : `${days} d ago`;
}

function timeAgo(value: string, now: number) {
  const then = parseWhen(value);
  if (!then) return '';

  const minutes = Math.round((now - then.getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;

  return formatDate(value, { day: '2-digit', month: 'short' });
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const parts = dayParts(appointment.startTime);

  return (
    <Link
      href={`/patients/appointments/${appointment.id}`}
      className="hover:border-border-strong hover:bg-surface-subtle group flex items-center gap-4 rounded-[12px] border border-transparent px-3 py-3 transition-colors"
    >
      <span className="bg-surface-muted flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[9px]">
        <span className="text-ink-subtle text-[9px] leading-none font-semibold tracking-[0.08em]">
          {parts.month}
        </span>
        <span className="text-foreground mt-0.5 text-[15px] leading-none font-semibold tabular-nums">
          {parts.day}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[13.5px] font-semibold">
          {appointment.procedure}
        </span>
        <span className="text-foreground-muted mt-0.5 block truncate text-[11.5px]">
          {parts.weekday} · {formatTimeRange(appointment.startTime, appointment.endTime)}
          {appointment.department ? ` · ${appointment.department.name}` : ''}
          {appointment.otRoom ? ` · ${appointment.otRoom.name}` : ''}
        </span>
      </span>

      <span className="hidden shrink-0 items-center gap-2 sm:flex">
        {appointment.priority === 'EMERGENCY' ? (
          <span className="text-danger text-[10px] font-semibold tracking-[0.06em]">
            {PRIORITY_LABEL.EMERGENCY.toUpperCase()}
          </span>
        ) : null}
        <ScheduleStatusBadge status={appointment.status} />
      </span>

      <ArrowRight
        size={14}
        className="text-ink-subtle group-hover:text-primary shrink-0 transition-colors"
        aria-hidden="true"
      />
    </Link>
  );
}

export function PatientDashboard({ userName }: { userName?: string }) {
  const { data: session } = useSession();
  const [patient, setPatient] = useState<PatientPortal | null>(null);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [busyAlertId, setBusyAlertId] = useState<string | null>(null);
  const [alertActionError, setAlertActionError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<PatientPortal>('/api/me/appointments');
      setPatient(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load your appointments.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError(null);

    try {
      const data = await apiClient.get<PatientAlert[]>('/api/alerts');
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setAlertsError(
        err instanceof Error ? err.message : 'Failed to load your notifications.',
      );
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  /* Both sources load independently: a failing notification feed must not
     blank out the appointment list. The loaders below are reused by the
     retry buttons, which may reset their own loading flag. */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiClient.get<PatientPortal>('/api/me/appointments');
        if (!cancelled) setPatient(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load your appointments.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      try {
        const data = await apiClient.get<PatientAlert[]>('/api/alerts');
        if (!cancelled) setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setAlertsError(
            err instanceof Error
              ? err.message
              : 'Failed to load your notifications.',
          );
        }
      } finally {
        if (!cancelled) setAlertsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function markAlertRead(id: string) {
    setBusyAlertId(id);
    setAlertActionError(null);

    try {
      await apiClient.patch<unknown>(`/api/alerts/${id}/read`);
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === id ? { ...alert, isRead: true } : alert,
        ),
      );
    } catch (err) {
      setAlertActionError(
        err instanceof Error
          ? err.message
          : 'Could not update the notification.',
      );
    } finally {
      setBusyAlertId(null);
    }
  }

  const schedules = patient?.schedules ?? [];
  const upcoming = schedules
    .filter(
      (schedule) =>
        schedule.status !== 'CANCELLED' &&
        schedule.status !== 'COMPLETED' &&
        (parseWhen(schedule.endTime)?.getTime() ?? 0) >= now,
    )
    .sort(
      (a, b) =>
        (parseWhen(a.startTime)?.getTime() ?? 0) -
        (parseWhen(b.startTime)?.getTime() ?? 0),
    );
  const nextAppointment = upcoming[0] ?? null;
  const laterUpcoming = upcoming.slice(1);
  const recent = schedules
    .filter(
      (schedule) =>
        schedule.status === 'COMPLETED' ||
        (schedule.status !== 'CANCELLED' &&
          (parseWhen(schedule.endTime)?.getTime() ?? 0) < now),
    )
    .sort(
      (a, b) =>
        (parseWhen(b.endTime)?.getTime() ?? 0) -
        (parseWhen(a.endTime)?.getTime() ?? 0),
    )
    .slice(0, 6);

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;
  const nextCountdown = nextAppointment
    ? countdown(nextAppointment.startTime, now)
    : null;
  const nextParts = nextAppointment ? dayParts(nextAppointment.startTime) : null;
  const displayName =
    patient?.name || userName || session?.user?.name || 'Patient';
  const email = session?.user?.email ?? null;
  const accountActive = session?.user?.status === 'ACTIVE';

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Patient portal"
        title={`Good day, ${displayName}`}
        description="Your scheduled procedures, theatre details and messages from your care team."
        actions={
          <Link
            href="/patients/appointments"
            className="border-border-strong text-foreground hover:bg-surface-subtle inline-flex items-center gap-1.5 rounded-[8px] border px-3.5 py-2 text-[12px] font-semibold"
          >
            <CalendarBlank size={15} aria-hidden="true" />
            All my appointments
          </Link>
        }
      />

      {/* Next appointment ------------------------------------------------ */}
      <section className="mt-6" aria-label="Next appointment">
        {loading ? (
          <div className="panel animate-pulse p-6">
            <div className="bg-surface-muted h-3 w-28 rounded" />
            <div className="bg-surface-muted mt-4 h-6 w-64 max-w-full rounded" />
            <div className="bg-surface-muted mt-3 h-3 w-40 rounded" />
          </div>
        ) : error ? (
          <div className="panel p-6">
            <p className="text-danger text-[13px] font-semibold">
              We could not load your appointments.
            </p>
            <p className="text-foreground-muted mt-1 text-[12.5px]">{error}</p>
            <button
              type="button"
              onClick={() => void loadAppointments()}
              className="border-border-strong text-foreground hover:bg-surface-subtle mt-4 rounded-[8px] border px-3.5 py-2 text-[12px] font-semibold"
            >
              Try again
            </button>
          </div>
        ) : nextAppointment && nextParts ? (
          <div className="panel overflow-hidden">
            <div className="grid gap-5 p-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <div className="bg-primary-soft text-primary flex h-[68px] w-[68px] flex-col items-center justify-center rounded-[14px]">
                <span className="text-[10px] leading-none font-semibold tracking-[0.08em]">
                  {nextParts.month}
                </span>
                <span className="mt-1 text-[24px] leading-none font-semibold tabular-nums">
                  {nextParts.day}
                </span>
                <span className="mt-1 text-[9px] leading-none font-semibold tracking-[0.06em]">
                  {nextParts.weekday}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-ink-subtle text-[10.5px] font-semibold tracking-[0.1em] uppercase">
                  Next appointment
                </p>
                <h2 className="text-foreground mt-1 truncate text-[19px] font-semibold">
                  {nextAppointment.procedure}
                </h2>
                <p className="text-foreground-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                  <span className="tabular-nums">
                    {formatTimeRange(
                      nextAppointment.startTime,
                      nextAppointment.endTime,
                    )}
                  </span>
                  {nextAppointment.department ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{nextAppointment.department.name}</span>
                    </>
                  ) : null}
                  {nextAppointment.otRoom ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} aria-hidden="true" />
                        {nextAppointment.otRoom.name}
                      </span>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <ScheduleStatusBadge status={nextAppointment.status} />
                {nextCountdown ? (
                  <span className="text-primary inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums">
                    <ClockCounterClockwise size={13} aria-hidden="true" />
                    {nextCountdown}
                  </span>
                ) : null}
                <Link
                  href={`/patients/appointments/${nextAppointment.id}`}
                  className="text-primary inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
                >
                  View details
                  <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarX size={24} weight="duotone" aria-hidden="true" />}
            title="No upcoming appointments"
            description="When your care team schedules a procedure, its date, theatre and status will appear here."
            action={
              <Link
                href="/patients/appointments"
                className="text-primary text-[12px] font-semibold hover:underline"
              >
                View appointment history
              </Link>
            }
          />
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Appointments ------------------------------------------------- */}
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="later-appointments-heading">
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="later-appointments-heading"
                className="text-foreground text-[13px] font-semibold"
              >
                Also coming up
              </h2>
              <span className="text-ink-subtle text-[11px] tabular-nums">
                {laterUpcoming.length}
              </span>
            </div>

            <div className="panel mt-2.5 overflow-hidden p-1.5">
              {loading ? (
                <div className="space-y-2 p-3">
                  <div className="bg-surface-muted h-11 animate-pulse rounded" />
                  <div className="bg-surface-muted h-11 animate-pulse rounded" />
                </div>
              ) : laterUpcoming.length === 0 ? (
                <p className="text-foreground-muted px-3 py-5 text-center text-[12.5px]">
                  No other upcoming appointments are scheduled.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {laterUpcoming.map((appointment) => (
                    <li key={appointment.id}>
                      <AppointmentRow appointment={appointment} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section aria-labelledby="past-appointments-heading">
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="past-appointments-heading"
                className="text-foreground text-[13px] font-semibold"
              >
                Past appointments
              </h2>
              <Link
                href="/patients/appointments"
                className="text-primary text-[11px] font-semibold hover:underline"
              >
                See all
              </Link>
            </div>

            <div className="panel mt-2.5 overflow-hidden p-1.5">
              {loading ? (
                <div className="space-y-2 p-3">
                  <div className="bg-surface-muted h-11 animate-pulse rounded" />
                </div>
              ) : recent.length === 0 ? (
                <p className="text-foreground-muted px-3 py-5 text-center text-[12.5px]">
                  No past appointments are recorded for your account yet.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {recent.map((appointment) => (
                    <li key={appointment.id}>
                      <AppointmentRow appointment={appointment} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Side column --------------------------------------------------- */}
        <div className="min-w-0 space-y-6">
          {/* Notifications ------------------------------------------------ */}
          <section className="panel" aria-labelledby="notifications-heading">
            <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
              <h2
                id="notifications-heading"
                className="text-foreground inline-flex items-center gap-1.5 text-[13px] font-semibold"
              >
                <Bell size={15} aria-hidden="true" />
                Notifications
              </h2>
              {unreadCount > 0 ? (
                <span className="bg-primary-soft text-primary rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="text-ink-subtle text-[10.5px]">Up to date</span>
              )}
            </div>

            <div className="p-2">
              {alertsLoading ? (
                <div className="space-y-2 p-2">
                  <div className="bg-surface-muted h-10 animate-pulse rounded" />
                  <div className="bg-surface-muted h-10 animate-pulse rounded" />
                </div>
              ) : alertsError ? (
                <div className="p-2">
                  <p className="text-foreground-muted text-[12px]">
                    {alertsError}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadAlerts()}
                    className="text-primary mt-2 text-[11.5px] font-semibold hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : alerts.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <CheckCircle
                    size={22}
                    weight="duotone"
                    className="text-success mx-auto"
                    aria-hidden="true"
                  />
                  <p className="text-foreground mt-2 text-[12.5px] font-semibold">
                    No notifications
                  </p>
                  <p className="text-foreground-muted mt-1 text-[11.5px]">
                    Messages about your appointments will appear here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {alerts.slice(0, 6).map((alert) => {
                    const severity = ALERT_SEVERITY[alert.severity];
                    return (
                      <li
                        key={alert.id}
                        className={`relative rounded-[8px] px-2.5 py-2.5 ${
                          alert.isRead ? '' : 'bg-surface-subtle'
                        }`}
                      >
                        <span
                          className={`absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-full ${severity.rail}`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 pl-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-[12px] leading-snug ${
                                alert.isRead
                                  ? 'text-ink-secondary'
                                  : 'text-foreground font-semibold'
                              }`}
                            >
                              {alert.title}
                            </p>
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold ${severity.chip}`}
                            >
                              {severity.label}
                            </span>
                          </div>
                          <p className="text-foreground-muted mt-0.5 text-[11.5px] leading-snug">
                            {alert.message}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-ink-subtle text-[10.5px]">
                              {timeAgo(alert.createdAt, now)}
                            </span>
                            {alert.schedule ? (
                              <Link
                                href={`/patients/appointments/${alert.schedule.id}`}
                                className="text-primary text-[10.5px] font-semibold hover:underline"
                              >
                                {alert.schedule.procedure}
                              </Link>
                            ) : null}
                            {!alert.isRead ? (
                              <button
                                type="button"
                                onClick={() => void markAlertRead(alert.id)}
                                disabled={busyAlertId === alert.id}
                                aria-busy={busyAlertId === alert.id}
                                className="text-ink-secondary hover:text-foreground ml-auto text-[10.5px] font-semibold disabled:opacity-60"
                              >
                                {busyAlertId === alert.id
                                  ? 'Saving…'
                                  : 'Mark as read'}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {alertActionError ? (
                <p className="text-danger px-2 pt-1 text-[11px]">
                  {alertActionError}
                </p>
              ) : null}
            </div>
          </section>

          {/* Record -------------------------------------------------------- */}
          <section className="panel" aria-labelledby="record-heading">
            <div className="border-border flex items-center gap-1.5 border-b px-4 py-3">
              <UserCircle size={15} aria-hidden="true" />
              <h2
                id="record-heading"
                className="text-foreground text-[13px] font-semibold"
              >
                Your record
              </h2>
            </div>

            <dl className="divide-border divide-y">
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="text-ink-subtle text-[11px]">Patient ID</dt>
                <dd className="text-foreground font-mono text-[11.5px]">
                  {loading ? '—' : (patient?.patientCode ?? 'Not assigned')}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="text-ink-subtle text-[11px]">Name</dt>
                <dd className="text-foreground text-right text-[11.5px]">
                  {displayName}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="text-ink-subtle text-[11px]">Email</dt>
                <dd className="text-foreground max-w-[60%] truncate text-right text-[11.5px]">
                  {email ?? 'Not available'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="text-ink-subtle text-[11px]">Account</dt>
                <dd
                  className={`text-[11.5px] font-semibold ${
                    accountActive ? 'text-success' : 'text-warning'
                  }`}
                >
                  {accountActive ? 'Active' : 'Restricted'}
                </dd>
              </div>
            </dl>

            <p className="text-foreground-muted border-border border-t px-4 py-3 text-[11px] leading-relaxed">
              Clinical notes and results are shared by your care team during
              your visit and are not displayed in this portal. Contact the
              hospital if any detail above is incorrect.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
