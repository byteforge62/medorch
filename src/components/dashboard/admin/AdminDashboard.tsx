'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { apiClient, ApiClientError } from '@/lib/api/client';
import { Button, buttonClasses } from '@/components/ui/Button';

import { DashboardSkeleton, Panel, PanelError } from './DashboardPrimitives';
import { OperationalAttention } from './OperationalAttention';
import { TheatreOperationsBoard } from './TheatreOperationsBoard';
import { AlertDecisionQueue } from './AlertDecisionQueue';
import { SurgicalScheduleTimeline } from './SurgicalScheduleTimeline';
import { WorkforceOverview } from './WorkforceOverview';
import { EquipmentReadiness } from './EquipmentReadiness';
import { OperationalActivityFeed } from './OperationalActivityFeed';
import {
  addDays,
  dateKey,
  formatDay,
  isOpenSchedule,
  startOfDay,
} from './format';
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
} from './types';

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

export function AdminDashboard() {
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
      unread: unread.length,
      availableEquipment: availableEquipment.length,
      equipment: data.equipment.length,
    };
  }, [data, now]);

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
    <main className="space-y-4">
      <header className="border-rule flex flex-col gap-5 border-b pb-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <p className="eyebrow">Clinical operations</p>
              <span className="bg-rule h-3 w-px" aria-hidden="true" />
              <p className="text-ink-subtle text-[11px]">{dateLabel}</p>
            </div>
            <h1 className="text-ink mt-2 text-[clamp(1.65rem,2.9vw,2.25rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
              Operations control
            </h1>
            <p className="text-ink-muted mt-2 max-w-[68ch] text-[12.5px] leading-relaxed">
              The current theatre picture, open cases, resource readiness and decisions that need
              an administrator now.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink-subtle mr-1 text-[10.5px]">Updated {timeLabel}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={refreshing}
              loadingLabel="Refreshing operations data"
              onClick={refresh}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Link href="/schedules" className={buttonClasses({ size: 'sm' })}>
              Open schedules
            </Link>
          </div>
        </div>

        <dl className="divide-rule-soft grid grid-cols-2 divide-x rounded-[var(--radius-panel)] border border-rule bg-sheet shadow-xs sm:grid-cols-4">
          <div className="px-4 py-3">
            <dt className="text-ink-muted text-[10px] font-medium">Open cases</dt>
            <dd className="text-ink mt-1 flex items-baseline gap-1.5 text-[1.55rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              {errors.schedules ? '—' : stats.open}
              {!errors.schedules ? (
                <span className="text-ink-subtle text-[10px] font-medium tracking-normal">
                  {stats.today} today
                </span>
              ) : null}
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-ink-muted text-[10px] font-medium">Theatres ready</dt>
            <dd className="text-ink mt-1 flex items-baseline gap-1.5 text-[1.55rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              {errors.rooms ? '—' : `${stats.readyRooms}/${stats.activeRooms}`}
              {!errors.rooms ? (
                <span className="text-ink-subtle text-[10px] font-medium tracking-normal">
                  active
                </span>
              ) : null}
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-ink-muted text-[10px] font-medium">Unread alerts</dt>
            <dd className="text-ink mt-1 flex items-baseline gap-1.5 text-[1.55rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              {errors.alerts ? '—' : stats.unread}
              {!errors.alerts ? (
                <span className="text-ink-subtle text-[10px] font-medium tracking-normal">
                  on file
                </span>
              ) : null}
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-ink-muted text-[10px] font-medium">Equipment available</dt>
            <dd className="text-ink mt-1 flex items-baseline gap-1.5 text-[1.55rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              {errors.equipment ? '—' : `${stats.availableEquipment}/${stats.equipment}`}
              {!errors.equipment ? (
                <span className="text-ink-subtle text-[10px] font-medium tracking-normal">
                  tracked
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
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
        <Panel>
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

      <div className="grid items-stretch gap-4 xl:grid-cols-12">
        <div className="order-2 min-w-0 xl:order-1 xl:col-span-8">
          <TheatreOperationsBoard
            rooms={data.rooms}
            schedules={data.schedules}
            now={now}
            error={errors.rooms ?? errors.schedules}
            onRetry={refresh}
          />
        </div>
        <div className="order-1 min-w-0 xl:order-2 xl:col-span-4">
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
