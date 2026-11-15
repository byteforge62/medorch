'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  BellRinging,
  CalendarCheck,
  DoorOpen,
  FirstAidKit,
} from '@phosphor-icons/react';

import { apiClient, ApiClientError } from '@/lib/api/client';

import { MetricCard } from '@/features/dashboard/components/cards';
import { DashboardSkeleton, Panel, PanelError } from '@/features/dashboard/components/admin/DashboardPrimitives';
import { OperationalAttention } from '@/features/dashboard/components/admin/OperationalAttention';
import { TheatreOperationsBoard } from '@/features/dashboard/components/admin/TheatreOperationsBoard';
import { AlertDecisionQueue } from '@/features/dashboard/components/admin/AlertDecisionQueue';
import { SurgicalScheduleTimeline } from '@/features/dashboard/components/admin/SurgicalScheduleTimeline';
import { WorkforceOverview } from '@/features/dashboard/components/admin/WorkforceOverview';
import { EquipmentReadiness } from '@/features/dashboard/components/admin/EquipmentReadiness';
import { OperationalActivityFeed } from '@/features/dashboard/components/admin/OperationalActivityFeed';
import {
  addDays,
  dateKey,
  formatDay,
  isOpenSchedule,
  startOfDay,
} from '@/features/dashboard/components/admin/format';
import type {
  AlertRecord,
  AuditResponse,
  DashboardData,
  DashboardErrors,
  Doctor,
  Equipment,
  Room,
  Schedule,
  ScheduleDetail,
  User,
} from '@/features/dashboard/components/admin/types';

const EMPTY_DATA: DashboardData = {
  rooms: [],
  schedules: [],
  details: {},
  equipment: [],
  alerts: [],
  doctors: [],
  users: [],
  audit: [],
  auditTotal: 0,
};

const sourceLabels: Record<keyof DashboardErrors, string> = {
  rooms: 'theatres',
  schedules: 'schedules',
  equipment: 'equipment',
  alerts: 'alerts',
  doctors: 'doctors',
  users: 'accounts',
  audit: 'audit',
  details: 'case detail',
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'The service did not respond.';
}

async function fetchDetails(schedules: Schedule[]) {
  const today = startOfDay(new Date());
  const horizon = addDays(new Date(), 14);
  const candidates = schedules.filter((schedule) => {
    if (!isOpenSchedule(schedule.status)) return false;
    if (schedule.status === 'IN_PROGRESS') return true;

    const start = new Date(schedule.startTime);
    return start >= today && start <= horizon;
  });

  if (candidates.length === 0) {
    return { details: {} as Record<string, ScheduleDetail>, failed: [] as string[] };
  }

  const results = await Promise.allSettled(
    candidates.map((schedule) =>
      apiClient.get<ScheduleDetail>(`/api/schedules/${schedule.id}`),
    ),
  );

  const details: Record<string, ScheduleDetail> = {};
  const failed: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      details[result.value.id] = result.value;
    } else {
      failed.push(candidates[index].id);
    }
  });

  return { details, failed };
}

function greetingName(name?: string | null) {
  const parts = (name || 'there')
    .replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, '')
    .split(' ')
    .filter(Boolean);

  if (parts.length === 0) return 'there';
  return parts[0].toLowerCase() === 'medorch' ? parts[parts.length - 1] : parts[0];
}

export function AdminDashboard() {
  const { data: session } = useSession();
  const firstName = greetingName(session?.user?.name);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [errors, setErrors] = useState<DashboardErrors>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [busyAlertId, setBusyAlertId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (reloadKey === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [rooms, schedules, equipment, alerts, doctors, users, audit] =
        await Promise.allSettled([
          apiClient.get<Room[]>('/api/ot-rooms'),
          apiClient.get<Schedule[]>('/api/schedules'),
          apiClient.get<Equipment[]>('/api/equipment'),
          apiClient.get<AlertRecord[]>('/api/alerts'),
          apiClient.get<Doctor[]>('/api/doctors'),
          apiClient.get<User[]>('/api/users'),
          apiClient.get<AuditResponse>('/api/audit?limit=12'),
        ]);

      if (cancelled) return;

      const nextErrors: DashboardErrors = {};

      const read = <T,>(
        result: PromiseSettledResult<T>,
        source: keyof DashboardErrors,
      ): T | null => {
        if (result.status === 'fulfilled') return result.value;
        nextErrors[source] = messageOf(result.reason);
        return null;
      };

      const roomData = read(rooms, 'rooms') ?? [];
      const scheduleData = read(schedules, 'schedules') ?? [];
      const equipmentData = read(equipment, 'equipment') ?? [];
      const alertData = read(alerts, 'alerts') ?? [];
      const doctorData = read(doctors, 'doctors') ?? [];
      const userData = read(users, 'users') ?? [];
      const auditData = read(audit, 'audit') ?? null;

      let details: Record<string, ScheduleDetail> = {};
      if (schedules.status === 'fulfilled') {
        const detailResult = await fetchDetails(scheduleData);
        if (cancelled) return;
        details = detailResult.details;

        if (detailResult.failed.length > 0) {
          nextErrors.details = `${detailResult.failed.length} case detail request${
            detailResult.failed.length === 1 ? '' : 's'
          } did not load.`;
        }
      }

      setData({
        rooms: roomData,
        schedules: scheduleData,
        details,
        equipment: equipmentData,
        alerts: alertData,
        doctors: doctorData,
        users: userData,
        audit: auditData?.items ?? [],
        auditTotal: auditData?.pagination.total ?? 0,
      });
      setErrors(nextErrors);
      setLoading(false);
      setRefreshing(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const stats = useMemo(() => {
    const todayKey = dateKey(now);
    const today = data.schedules.filter(
      (schedule) =>
        isOpenSchedule(schedule.status) && dateKey(schedule.startTime) === todayKey,
    );
    const open = data.schedules.filter((schedule) => isOpenSchedule(schedule.status));
    const activeRooms = data.rooms.filter((room) => room.isActive);
    const readyRooms = activeRooms.filter((room) => room.status === 'AVAILABLE');
    const unread = data.alerts.filter((alert) => !alert.isRead);
    const availableEquipment = data.equipment.filter(
      (item) => item.status === 'AVAILABLE',
    );

    return {
      today: today.length,
      open: open.length,
      activeRooms: activeRooms.length,
      readyRooms: readyRooms.length,
      occupiedRooms: activeRooms.filter((room) => room.status === 'OCCUPIED').length,
      outRooms: activeRooms.filter(
        (room) => room.status === 'MAINTENANCE' || room.status === 'DISABLED',
      ).length,
      unread: unread.length,
      criticalAlerts: unread.filter((alert) => alert.severity === 'CRITICAL').length,
      warningAlerts: unread.filter((alert) => alert.severity === 'WARNING').length,
      infoAlerts: unread.filter((alert) => alert.severity === 'INFO').length,
      inUseEquipment: data.equipment.filter((item) => item.status === 'IN_USE').length,
      retiredEquipment: data.equipment.filter((item) => item.status === 'RETIRED').length,
      availableEquipment: availableEquipment.length,
      maintenanceEquipment: data.equipment.filter((item) => item.status === 'MAINTENANCE')
        .length,
      equipment: data.equipment.length,
    };
  }, [data, now]);

  /* Real caseload per day for the next seven days, counted from the schedule
     register. No projection or smoothing: a day with no booked case is drawn
     as an empty column. */
  const weekLoad = useMemo(() => {
    const start = startOfDay(now);
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    const counts = days.map(
      (day) =>
        data.schedules.filter(
          (schedule) =>
            schedule.status !== 'CANCELLED' && dateKey(schedule.startTime) === dateKey(day),
        ).length,
    );

    return {
      days,
      counts,
      total: counts.reduce((sum, count) => sum + count, 0),
      labels: days.map((day) =>
        new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(day),
      ),
    };
  }, [data.schedules, now]);

  async function handleMarkRead(alert: AlertRecord) {
    setBusyAlertId(alert.id);
    setActionError('');

    try {
      const updated = await apiClient.patch<AlertRecord>(`/api/alerts/${alert.id}/read`);
      setData((current) => ({
        ...current,
        alerts: current.alerts.map((item) =>
          item.id === alert.id ? { ...item, ...updated } : item,
        ),
      }));
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : messageOf(error);
      setActionError(`${message} The alert remains unread; retry when the service is available.`);
    } finally {
      setBusyAlertId(null);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const partialSources = (Object.keys(errors) as (keyof DashboardErrors)[]).map(
    (source) => sourceLabels[source],
  );
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  const allCoreFailed =
    Boolean(errors.rooms) &&
    Boolean(errors.schedules) &&
    Boolean(errors.equipment) &&
    Boolean(errors.alerts) &&
    Boolean(errors.doctors) &&
    Boolean(errors.users) &&
    Boolean(errors.audit);

  return (
    <main className="space-y-3">
      <header className="space-y-0">
        <div className="dashboard-command bg-rail relative overflow-hidden px-5 pt-5 pb-16 text-white sm:px-7 sm:pt-7 sm:pb-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_100%]" />
            <div className="absolute -top-32 right-[-7rem] h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -top-16 right-[-2rem] h-52 w-52 rounded-full border border-white/[0.06]" />
          </div>

          <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] xl:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[8.5px] tracking-[0.08em] text-white/40">
                <span>OPERATIONS DESK</span>
                <span className="h-px w-4 bg-white/25" aria-hidden="true" />
                <span>{dateLabel}</span>
              </div>

              <h1 className="font-display mt-3 text-[clamp(1.65rem,2.5vw,2.25rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-white">
                Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}.
              </h1>
              <p className="mt-2.5 max-w-[56ch] text-[12.5px] leading-[1.65] text-white/60">
                The current theatre picture, open cases, resource readiness and the decisions that
                need you now.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href="/schedules"
                  className="text-rail hover:bg-paper inline-flex h-8 items-center gap-1.5 rounded-[7px] bg-white px-3 text-[10.5px] font-semibold transition-colors"
                >
                  Open schedules
                  <ArrowRight size={12} weight="bold" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={refresh}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[7px] border border-white/20 px-3 text-[10.5px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing…' : 'Refresh picture'}
                </button>
                <span className="font-mono text-[9px] text-white/35">UPDATED {timeLabel}</span>
              </div>
            </div>

            <div className="hidden border-white/10 xl:block xl:border-l xl:pl-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10.5px] font-semibold text-white/60">Live picture</p>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/40">
                  <span className="bg-success-bright h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                  CONNECTED
                </span>
              </div>
              <p className="mt-2.5 max-w-[34ch] text-[11.5px] leading-[1.6] text-white/60">
                Read directly from the theatre, schedule, equipment and alert services. Missing
                feeds stay visibly missing.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-2.5 font-mono text-[9px] text-white/45">
                <span>ROLE-SCOPED</span>
                <span>NO CLINICAL NOTES</span>
                <span>LOCAL TIME</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-4 -mt-11 grid gap-2.5 sm:mx-6 sm:grid-cols-2 xl:grid-cols-12">
          <MetricCard
            feature
            className="sm:col-span-2 xl:col-span-6"
            label="Open cases"
            value={errors.schedules ? '—' : stats.open}
            unit={errors.schedules ? undefined : 'cases'}
            icon={<CalendarCheck size={19} weight="duotone" aria-hidden="true" />}
            support={
              errors.schedules
                ? 'The schedule register did not load.'
                : `${stats.today} scheduled today · ${weekLoad.total} booked in the next seven days`
            }
            series={
              errors.schedules
                ? undefined
                : {
                    values: weekLoad.counts,
                    labels: weekLoad.labels,
                    ariaLabel: `Cases booked per day: ${weekLoad.days
                      .map((day, index) => `${formatDay(day)} ${weekLoad.counts[index]}`)
                      .join(', ')}`,
                  }
            }
          />

          <MetricCard
            className="xl:col-span-2"
            label="Theatres ready"
            value={errors.rooms ? '—' : `${stats.readyRooms}/${stats.activeRooms}`}
            unit={errors.rooms ? undefined : 'active'}
            tone={!errors.rooms && stats.readyRooms === 0 ? 'warning' : 'success'}
            icon={<DoorOpen size={18} weight="duotone" aria-hidden="true" />}
            support={
              errors.rooms ? 'Theatre register unavailable.' : 'Recorded state per theatre'
            }
            breakdown={
              errors.rooms
                ? undefined
                : [
                    { label: 'Ready', value: stats.readyRooms, tone: 'success' as const },
                    { label: 'In use', value: stats.occupiedRooms, tone: 'primary' as const },
                    { label: 'Out', value: stats.outRooms, tone: 'neutral' as const },
                  ]
            }
          />

          <MetricCard
            className="xl:col-span-2"
            label="Unread alerts"
            value={errors.alerts ? '—' : stats.unread}
            unit={errors.alerts ? undefined : 'open'}
            tone={stats.criticalAlerts > 0 ? 'danger' : 'warning'}
            icon={<BellRinging size={18} weight="duotone" aria-hidden="true" />}
            support={
              errors.alerts
                ? 'Alert register unavailable.'
                : stats.unread === 0
                  ? 'Every alert on file has been read.'
                  : [
                      stats.criticalAlerts ? `${stats.criticalAlerts} critical` : '',
                      stats.warningAlerts ? `${stats.warningAlerts} warning` : '',
                      stats.infoAlerts ? `${stats.infoAlerts} info` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')
            }
            breakdown={
              errors.alerts
                ? undefined
                : [
                    {
                      label: 'Critical',
                      value: stats.criticalAlerts,
                      tone: 'danger' as const,
                    },
                    {
                      label: 'Warning',
                      value: stats.warningAlerts,
                      tone: 'warning' as const,
                    },
                    { label: 'Info', value: stats.infoAlerts, tone: 'info' as const },
                  ]
            }
          />

          <MetricCard
            className="xl:col-span-2"
            label="Equipment ready"
            value={
              errors.equipment ? '—' : `${stats.availableEquipment}/${stats.equipment}`
            }
            unit={errors.equipment ? undefined : 'available'}
            tone={stats.maintenanceEquipment > 0 ? 'warning' : 'info'}
            icon={<FirstAidKit size={18} weight="duotone" aria-hidden="true" />}
            support={
              errors.equipment ? 'Equipment register unavailable.' : 'Recorded status per item'
            }
            breakdown={
              errors.equipment
                ? undefined
                : [
                    {
                      label: 'Available',
                      value: stats.availableEquipment,
                      tone: 'success' as const,
                    },
                    { label: 'In use', value: stats.inUseEquipment, tone: 'primary' as const },
                    {
                      label: 'Service',
                      value: stats.maintenanceEquipment,
                      tone: 'warning' as const,
                    },
                    {
                      label: 'Retired',
                      value: stats.retiredEquipment,
                      tone: 'neutral' as const,
                    },
                  ]
            }
          />
        </div>
      </header>

      {partialSources.length > 0 ? (
        <div
          role="status"
          className="border-warning/25 bg-warning-soft/50 text-ink-secondary flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-panel)] border px-4 py-2.5 text-[11.5px]"
        >
          <p>
            Partial operational picture: {partialSources.join(', ')} did not load. Panels below
            show only available data and do not infer missing values.
          </p>
          <button
            type="button"
            onClick={refresh}
            className="text-primary font-semibold underline decoration-current/30 underline-offset-4 hover:decoration-current"
          >
            Retry all
          </button>
        </div>
      ) : null}

      {allCoreFailed ? (
        <Panel tone="danger">
          <PanelError
            message="None of the operational feeds returned data. No dashboard conclusion can be drawn."
            onRetry={refresh}
          />
        </Panel>
      ) : null}

      <OperationalAttention
        rooms={data.rooms}
        schedules={data.schedules}
        equipment={data.equipment}
        alerts={data.alerts}
        users={data.users}
        errors={errors}
        now={now}
        onRetry={refresh}
      />

      <div className="grid items-start gap-3 lg:grid-cols-12">
        <div className="order-2 min-w-0 lg:order-1 lg:col-span-8">
          <TheatreOperationsBoard
            rooms={data.rooms}
            schedules={data.schedules}
            now={now}
            error={errors.rooms ?? errors.schedules}
            onRetry={refresh}
          />
        </div>
        <div className="order-1 min-w-0 lg:order-2 lg:col-span-4">
          <AlertDecisionQueue
            alerts={data.alerts}
            error={errors.alerts}
            actionError={actionError}
            busyId={busyAlertId}
            onMarkRead={(alert) => void handleMarkRead(alert)}
            onRetry={refresh}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <SurgicalScheduleTimeline
            schedules={data.schedules}
            details={data.details}
            detailsError={errors.details}
            now={now}
            error={errors.schedules}
            onRetry={refresh}
          />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <WorkforceOverview
            users={data.users}
            doctors={data.doctors}
            schedules={data.schedules}
            details={data.details}
            now={now}
            usersError={errors.users}
            doctorsError={errors.doctors}
            schedulesError={errors.schedules}
            detailsError={errors.details}
            onRetry={refresh}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <EquipmentReadiness
            equipment={data.equipment}
            schedules={data.schedules}
            details={data.details}
            now={now}
            error={errors.equipment}
            detailsError={errors.details}
            onRetry={refresh}
          />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <OperationalActivityFeed
            logs={data.audit}
            total={data.auditTotal}
            error={errors.audit}
            onRetry={refresh}
          />
        </div>
      </div>

      <p className="text-ink-subtle flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[10px]">
        <span>Source: MedOrch theatre, schedule, equipment, alert, workforce and audit APIs.</span>
        <span aria-hidden="true">·</span>
        <span>{formatDay(now, 'long')}</span>
        <span aria-hidden="true">·</span>
        <span>No patient clinical notes are loaded in this workspace.</span>
      </p>
    </main>
  );
}
