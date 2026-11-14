'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api/client';
import { EQUIPMENT_STATUS } from '@/lib/operational-status';
import type { EquipmentStatusValue } from '@/lib/operational-status';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  CalendarCheck,
  DoorOpen,
  Heartbeat,
  Warning,
} from '@phosphor-icons/react';
import { MetricCard, TheatreStatusCard } from './cards';
import {
  SchedulePriorityBadge,
  ScheduleStatusBadge,
} from '@/components/schedules/ScheduleStatusBadge';
import type {
  SchedulePriority,
  ScheduleStatus,
} from '@/components/schedules/ScheduleStatusBadge';

type StaffRole = 'SURGEON' | 'NURSE' | 'ANESTHETIST' | 'TECHNICIAN' | 'OTHER';

interface ScheduleEquipmentDetail {
  id: string;
  equipment: Array<{
    id: string;
    releasedAt: string | null;
    equipment: {
      id: string;
      name: string;
      category: string;
      serialNumber: string;
      status: EquipmentStatusValue;
    };
  }>;
}

interface TheatreEquipmentRow {
  assignmentId: string;
  scheduleId: string;
  procedure: string;
  roomCode: string;
  roomName: string;
  startTime: string;
  released: boolean;
  equipment: ScheduleEquipmentDetail['equipment'][number]['equipment'];
}

interface StaffAssignment {
  id: string;
  role: StaffRole;
  assignedAt: string;
  schedule: {
    id: string;
    procedure: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    status: ScheduleStatus;
    priority: SchedulePriority;
    patient: { name: string; patientCode: string };
    department: { name: string };
    otRoom: { name: string; code: string };
  };
}

/*======================================================================
  Theatre state
  ======================================================================
  A theatre's state is derived from the cases booked into it, never from a
  stored flag: a room with a case in progress is live, a room with a case
  later today is committed, and a room with nothing today is free.

  Each state carries a label as well as a colour, so the board is readable
  without relying on hue.
====================================================================== */

type TheatreState = 'live' | 'next' | 'committed' | 'free';

/* A live theatre uses the same violet as an OCCUPIED room elsewhere, so the
   room reads consistently on the board and in the theatre register. */
const THEATRE_STATE: Record<
  TheatreState,
  { label: string; dot: string; text: string; soft: string; rail: string }
> = {
  live: {
    label: 'In theatre',
    dot: 'bg-primary',
    text: 'text-primary',
    soft: 'bg-primary-soft',
    rail: 'bg-primary',
  },
  next: {
    label: 'Next up',
    dot: 'bg-warning',
    text: 'text-warning',
    soft: 'bg-warning-soft',
    rail: 'bg-warning',
  },
  committed: {
    label: 'Booked',
    dot: 'bg-border-strong',
    text: 'text-ink-muted',
    soft: 'bg-surface-muted',
    rail: 'bg-border-strong',
  },
  free: {
    label: 'Free today',
    dot: 'bg-border-strong',
    text: 'text-ink-muted',
    soft: 'bg-surface-muted',
    rail: 'bg-border-strong',
  },
};

/* Rails follow the shared schedule contract: in-progress is expected work
   (warning), a delay is a broken commitment (danger). */
const ROW_TONE: Record<ScheduleStatus, string> = {
  IN_PROGRESS: 'bg-warning',
  DELAYED: 'bg-danger',
  CONFIRMED: 'bg-primary',
  SCHEDULED: 'bg-border-strong',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-border-strong',
};

function localTodayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function clock(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--:--';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function shortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-- ---';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  })
    .format(date)
    .toUpperCase();
}

function minutesOf(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.getHours() * 60 + date.getMinutes();
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

/* The axis runs from the earliest start to the latest end of the visible
   day, padded by an hour each side, so the blocks always fill the frame. */
function axisFor(assignments: StaffAssignment[]) {
  const starts = assignments
    .map((a) => minutesOf(a.schedule.startTime))
    .filter((v): v is number => v !== null);
  const ends = assignments
    .map((a) => minutesOf(a.schedule.endTime))
    .filter((v): v is number => v !== null);

  if (starts.length === 0 || ends.length === 0) {
    return { from: 8 * 60, to: 18 * 60 };
  }

  const from = Math.floor((Math.min(...starts) - 30) / 60) * 60;
  const to = Math.ceil((Math.max(...ends) + 30) / 60) * 60;

  return { from: Math.max(0, from), to: Math.min(24 * 60, to) };
}

/*======================================================================
  OTStaffDashboard — theatre command
  ======================================================================
  The screen answers one question first: what is happening in each theatre
  right now, and what is about to happen? That makes the room board the top
  object, and turns the day into one continuous time axis with a lane per
  theatre, so overlaps and gaps are visible as shapes rather than inferred
  from timestamps.

  Assignment detail follows underneath, because a scrub nurse still needs
  their own line. All figures are derived from the fetched assignments.
====================================================================== */

export function OTStaffDashboard({ userName }: { userName: string }) {
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipmentRows, setEquipmentRows] = useState<TheatreEquipmentRow[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      try {
        const data = await apiClient.get<StaffAssignment[]>(
          '/api/me/staff-schedules',
        );

        if (!cancelled) {
          setAssignments(data ?? []);
          setError('');
        }
      } catch (caught: unknown) {
        if (!cancelled) {
          setError(
            caught instanceof ApiClientError
              ? caught.message
              : 'Unable to load your staff assignments.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAssignments();

    return () => {
      cancelled = true;
    };
  }, []);

  const todayKey = localTodayKey();

  const isTerminal = (status: ScheduleStatus) =>
    status === 'COMPLETED' || status === 'CANCELLED';

  const today = useMemo(
    () =>
      assignments
        .filter((a) => a.schedule.scheduledDate.slice(0, 10) === todayKey)
        .sort(
          (a, b) =>
            Date.parse(a.schedule.startTime) - Date.parse(b.schedule.startTime),
        ),
    [assignments, todayKey],
  );

  const later = useMemo(
    () =>
      assignments
        .filter((a) => a.schedule.scheduledDate.slice(0, 10) !== todayKey)
        .sort(
          (a, b) =>
            Date.parse(a.schedule.startTime) - Date.parse(b.schedule.startTime),
        ),
    [assignments, todayKey],
  );

  /* Equipment is attached to a case, not to a room record, so each of today's
     distinct cases is read for its real allocations. Failures are reported as
     a partial result rather than hidden. */
  useEffect(() => {
    const caseIds = [...new Set(today.map((item) => item.schedule.id))].slice(
      0,
      12,
    );

    if (caseIds.length === 0) {
      return;
    }

    let cancelled = false;

    void Promise.allSettled(
      caseIds.map((id) => apiClient.get<ScheduleEquipmentDetail>(`/api/schedules/${id}`)),
    ).then((results) => {
      if (cancelled) return;

      const rows: TheatreEquipmentRow[] = [];
      let failed = false;

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          failed = true;
          return;
        }

        const assignment = today.find(
          (item) => item.schedule.id === caseIds[index],
        );

        if (!assignment) return;

        for (const allocated of result.value.equipment ?? []) {
          rows.push({
            assignmentId: allocated.id,
            scheduleId: assignment.schedule.id,
            procedure: assignment.schedule.procedure,
            roomCode: assignment.schedule.otRoom.code,
            roomName: assignment.schedule.otRoom.name,
            startTime: assignment.schedule.startTime,
            released: Boolean(allocated.releasedAt),
            equipment: allocated.equipment,
          });
        }
      });

      rows.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
      setEquipmentRows(rows);
      setEquipmentError(
        failed ? 'Some case equipment could not be loaded.' : '',
      );
      setEquipmentLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [today]);

  const theatres = useMemo(() => {
    const map = new Map<
      string,
      {
        code: string;
        name: string;
        items: StaffAssignment[];
        state: TheatreState;
        next?: StaffAssignment;
      }
    >();

    for (const assignment of assignments) {
      const key = assignment.schedule.otRoom.code;
      const entry = map.get(key) ?? {
        code: key,
        name: assignment.schedule.otRoom.name,
        items: [],
        state: 'free' as TheatreState,
      };

      entry.items.push(assignment);
      map.set(key, entry);
    }

    for (const entry of map.values()) {
      const todayItems = entry.items
        .filter((i) => i.schedule.scheduledDate.slice(0, 10) === todayKey)
        .sort(
          (a, b) =>
            Date.parse(a.schedule.startTime) - Date.parse(b.schedule.startTime),
        );

      const live = todayItems.find(
        (i) => i.schedule.status === 'IN_PROGRESS',
      );
      const upcoming = todayItems.find(
        (i) => !isTerminal(i.schedule.status) && i.schedule.status !== 'IN_PROGRESS',
      );

      if (live) {
        entry.state = 'live';
        entry.next = live;
      } else if (upcoming) {
        entry.state = upcoming.schedule.status === 'CONFIRMED' ? 'next' : 'committed';
        entry.next = upcoming;
      } else {
        entry.state = 'free';
        entry.next = todayItems[0];
      }
    }

    return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [assignments, todayKey]);

  if (loading) {
    return <LoadingState message="Loading your staff dashboard…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const liveCount = theatres.filter((t) => t.state === 'live').length;
  const openCount = assignments.filter(
    (a) => !isTerminal(a.schedule.status),
  ).length;
  const priorityCount = assignments.filter(
    (a) =>
      a.schedule.priority === 'URGENT' || a.schedule.priority === 'EMERGENCY',
  ).length;

  const axis = axisFor(today);
  const span = axis.to - axis.from;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const nowVisible = nowMinutes > axis.from && nowMinutes < axis.to;
  const nowLeft = ((nowMinutes - axis.from) / span) * 100;

  const hourMarks: number[] = [];
  for (let m = axis.from; m <= axis.to; m += 60) hourMarks.push(m);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Theatre operations"
        title="Theatre command"
        meta={userName}
        description="Room state first, then the day as one timeline. Every figure below is derived from your assignments."
      />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Live now"
          value={liveCount}
          unit={liveCount === 1 ? 'theatre' : 'theatres'}
          tone="primary"
          icon={<Heartbeat size={18} weight="duotone" aria-hidden="true" />}
          support="Cases marked in progress"
        />
        <MetricCard
          label="Open cases"
          value={openCount}
          unit="assigned"
          icon={<CalendarCheck size={18} weight="duotone" aria-hidden="true" />}
          support="Not yet completed or cancelled"
        />
        <MetricCard
          label="Priority"
          value={priorityCount}
          unit="flagged"
          tone="warning"
          icon={<Warning size={18} weight="duotone" aria-hidden="true" />}
          support="Urgent or emergency cases"
        />
        <MetricCard
          label="Theatres"
          value={theatres.length}
          unit="on your list"
          tone="success"
          icon={<DoorOpen size={18} weight="duotone" aria-hidden="true" />}
          support="Rooms holding your assignments"
        />
      </div>

      {/* Theatre board — the room is the unit of operations */}
      {theatres.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="No theatres assigned"
            description="Theatres appear here once you hold an assignment in them."
          />
        </section>
      ) : (
        <section aria-labelledby="theatre-board" className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <h2 id="theatre-board" className="section-title text-ink">
              Theatre board
            </h2>
            <p className="text-ink-muted text-xs">
              Today, {shortDate(new Date().toISOString())}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {theatres.map((theatre) => {
              const state = THEATRE_STATE[theatre.state];
              const todayItems = theatre.items.filter(
                (i) => i.schedule.scheduledDate.slice(0, 10) === todayKey,
              );

              return (
                <TheatreStatusCard
                  key={theatre.code}
                  code={theatre.code}
                  name={theatre.name}
                  statusLabel={state.label}
                  tone={
                    theatre.state === 'live'
                      ? 'primary'
                      : theatre.state === 'next'
                        ? 'warning'
                        : 'neutral'
                  }
                  live={theatre.state === 'live'}
                  primaryLabel={
                    theatre.state === 'live'
                      ? 'In theatre'
                      : theatre.state === 'free'
                        ? 'Theatre day'
                        : 'Next case'
                  }
                  primaryLine={
                    theatre.next ? theatre.next.schedule.procedure : 'Nothing booked today'
                  }
                  secondaryLine={
                    theatre.next
                      ? `${clock(theatre.next.schedule.startTime)}–${clock(
                          theatre.next.schedule.endTime,
                        )} · ${roleLabel(theatre.next.role)}`
                      : undefined
                  }
                  descriptor={`${todayItems.length} case${
                    todayItems.length === 1 ? '' : 's'
                  } today`}
                  segments={todayItems.flatMap((assignment) => {
                    const start = minutesOf(assignment.schedule.startTime);
                    const end = minutesOf(assignment.schedule.endTime);
                    if (start === null || end === null) return [];

                    return [
                      {
                        id: assignment.id,
                        left: ((start - axis.from) / span) * 100,
                        width: Math.max(2, ((end - start) / span) * 100),
                        className: ROW_TONE[assignment.schedule.status],
                        label: `${assignment.schedule.procedure} ${clock(
                          assignment.schedule.startTime,
                        )}–${clock(assignment.schedule.endTime)}`,
                      },
                    ];
                  })}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Equipment on today's cases */}
      {today.length > 0 ? (
        <section
          aria-labelledby="theatre-equipment-title"
          className="panel-flush"
        >
          <div className="border-rule-soft flex flex-wrap items-end justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 id="theatre-equipment-title" className="section-title text-ink">
                Equipment in your theatres
              </h2>
              <p className="text-ink-muted mt-1 text-[13px]">
                Units allocated to today&apos;s cases, with their current
                register status.
              </p>
            </div>
            <Link
              href="/equipment"
              className="text-primary text-[11.5px] font-semibold hover:underline"
            >
              Equipment register →
            </Link>
          </div>

          {equipmentLoading ? (
            <div className="space-y-2 px-5 py-4">
              <div className="bg-surface-muted h-9 animate-pulse rounded" />
              <div className="bg-surface-muted h-9 animate-pulse rounded" />
            </div>
          ) : equipmentRows.length === 0 ? (
            <div className="px-5 py-5">
              <p className="text-foreground-muted text-[12.5px]">
                No equipment is allocated to today&apos;s cases yet.
                {equipmentError ? ` ${equipmentError}` : ''}
              </p>
            </div>
          ) : (
            <>
              {equipmentError ? (
                <p className="text-warning px-5 pt-3 text-[11.5px]">
                  {equipmentError}
                </p>
              ) : null}
              <ul className="divide-rule-soft divide-y">
                {equipmentRows.map((row) => {
                  const meta = EQUIPMENT_STATUS[row.equipment.status];

                  return (
                    <li
                      key={row.assignmentId}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate text-[13px] font-medium">
                          {row.equipment.name}
                        </span>
                        <span className="text-ink-muted mt-0.5 block truncate text-[11.5px]">
                          {row.equipment.category} ·{' '}
                          {row.equipment.serialNumber} · {row.roomCode} ·{' '}
                          {row.procedure}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${meta.tone} ${meta.text}`}
                      >
                        {meta.label}
                      </span>
                      <Link
                        href={`/schedules/${row.scheduleId}`}
                        className="text-primary shrink-0 text-[11px] font-semibold hover:underline"
                      >
                        Case →
                      </Link>
                      {row.released ? (
                        <span className="text-ink-subtle shrink-0 text-[10.5px]">
                          Released
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      ) : null}

      {/* The day as one axis */}
      {today.length > 0 ? (
        <section aria-labelledby="timeline-title" className="panel overflow-hidden">
          <div className="border-rule-soft flex flex-wrap items-end justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 id="timeline-title" className="section-title text-ink">
                Today in theatre
              </h2>
              <p className="text-ink-muted mt-1 text-[13px]">
                One lane per theatre; block width is the scheduled duration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-ink-muted inline-flex items-center gap-1.5">
                <span className="bg-warning h-2 w-2 rounded-full" aria-hidden="true" />
                In progress
              </span>
              <span className="text-ink-muted inline-flex items-center gap-1.5">
                <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
                Confirmed
              </span>
              <span className="text-ink-muted inline-flex items-center gap-1.5">
                <span className="bg-success h-2 w-2 rounded-full" aria-hidden="true" />
                Completed
              </span>
              <span className="text-ink-muted inline-flex items-center gap-1.5">
                <span className="bg-danger h-2 w-2 rounded-full" aria-hidden="true" />
                Delayed
              </span>
              <span className="text-ink-muted inline-flex items-center gap-1.5">
                <span className="bg-border-strong h-2 w-2 rounded-full" aria-hidden="true" />
                Scheduled
              </span>
            </div>
          </div>

          <div className="px-5 py-5">
            {/* hour scale */}
            <div className="relative ml-[7.5rem] h-5">
              {hourMarks.map((mark) => {
                const left = ((mark - axis.from) / span) * 100;
                return (
                  <span
                    key={mark}
                    className="text-ink-subtle absolute -translate-x-1/2 font-mono text-[10px]"
                    style={{ left: `${left}%` }}
                  >
                    {String(Math.floor(mark / 60)).padStart(2, '0')}
                  </span>
                );
              })}
            </div>

            <div className="relative">
              {nowVisible ? (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 ml-[7.5rem] w-px bg-primary"
                  style={{ left: `calc(${nowLeft}% - 7.5rem)` }}
                  aria-hidden="true"
                />
              ) : null}

              {theatres.map((theatre) => (
                <div
                  key={theatre.code}
                  className="border-rule-soft flex items-center gap-3 border-t py-2"
                >
                  <div className="w-[7.5rem] shrink-0">
                    <p className="text-ink font-mono text-[11px] font-medium">
                      {theatre.code}
                    </p>
                    <p className="text-ink-subtle truncate text-[11px]">
                      {theatre.name}
                    </p>
                  </div>

                  <div className="relative h-12 min-w-0 flex-1">
                    {hourMarks.map((mark) => {
                      const left = ((mark - axis.from) / span) * 100;
                      return (
                        <span
                          key={mark}
                          className="bg-rule-soft absolute inset-y-0 w-px"
                          style={{ left: `${left}%` }}
                          aria-hidden="true"
                        />
                      );
                    })}

                    {theatre.items
                      .filter((i) => i.schedule.scheduledDate.slice(0, 10) === todayKey)
                      .map((assignment) => {
                        const start = minutesOf(assignment.schedule.startTime);
                        const end = minutesOf(assignment.schedule.endTime);

                        if (start === null || end === null) return null;

                        const left = ((start - axis.from) / span) * 100;
                        const width = Math.max(((end - start) / span) * 100, 8);

                        return (
                          <Link
                            key={assignment.id}
                            href={`/schedules/${assignment.schedule.id}`}
                            className="border-rule bg-sheet-raised absolute top-0.5 bottom-0.5 overflow-hidden rounded-[6px] border px-1.5 py-1 shadow-xs transition-shadow hover:shadow-sm"
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${assignment.schedule.procedure} · ${clock(
                              assignment.schedule.startTime,
                            )}–${clock(assignment.schedule.endTime)}`}
                          >
                            <span
                              className={`absolute inset-y-0 left-0 w-[2px] ${
                                ROW_TONE[assignment.schedule.status]
                              }`}
                              aria-hidden="true"
                            />
                            <span className="text-ink block truncate pl-1 text-[11px] leading-tight font-medium">
                              {assignment.schedule.procedure}
                            </span>
                            <span className="text-ink-muted block truncate pl-1 font-mono text-[10px]">
                              {clock(assignment.schedule.startTime)}
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Run sheet — the assignment line a scrub nurse reads */}
      <section aria-labelledby="run-sheet-title" className="panel-flush">
        <div className="border-rule-soft flex items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="run-sheet-title" className="section-title text-ink">
              My assignments
            </h2>
            <p className="text-ink-muted mt-1 text-[13px]">
              Your role on each case, newest first after today.
            </p>
          </div>
          <span className="text-ink-muted font-mono text-[11px]">
            {assignments.length} total
          </span>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="Procedures assigned to your staff account will appear here."
          />
        ) : (
          <ul className="divide-rule-soft divide-y">
            {[...today, ...later].map((assignment) => {
              const terminal = isTerminal(assignment.schedule.status);

              return (
                <li key={assignment.id}>
                  <Link
                    href={`/schedules/${assignment.schedule.id}`}
                    className="hover:bg-surface-subtle flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors"
                  >
                    <span className="w-[6.5rem] shrink-0">
                      <span className="text-ink block font-mono text-[11px] font-medium">
                        {clock(assignment.schedule.startTime)}
                      </span>
                      <span className="text-ink-subtle block text-[10px]">
                        {shortDate(assignment.schedule.scheduledDate)}
                      </span>
                    </span>

                    <span
                      className={`min-w-0 flex-1 ${terminal ? 'opacity-60' : ''}`}
                    >
                      <span className="text-ink block truncate text-[14px] font-medium">
                        {assignment.schedule.procedure}
                      </span>
                      <span className="text-ink-muted mt-0.5 block truncate text-[12px]">
                        {assignment.schedule.patient.name} ·{' '}
                        {assignment.schedule.otRoom.code} ·{' '}
                        {roleLabel(assignment.role)}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <SchedulePriorityBadge
                        priority={assignment.schedule.priority}
                      />
                      <ScheduleStatusBadge status={assignment.schedule.status} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
