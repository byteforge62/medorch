'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

import {
  CountTag,
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from './DashboardPrimitives';
import {
  dateKey,
  durationMinutes,
  formatClock,
  formatDuration,
  formatTimeRange,
  hasOverlap,
  isOpenSchedule,
  minutesOfDay,
  ROOM_STATUS,
  SCHEDULE_STATUS,
} from './format';
import { TheatreStatusCard } from '../cards';
import type { Room, Schedule } from './types';

function axisFor(schedules: Schedule[]) {
  const starts = schedules
    .map((schedule) => minutesOfDay(schedule.startTime))
    .filter((value): value is number => value !== null);
  const ends = schedules
    .map((schedule) => minutesOfDay(schedule.endTime))
    .filter((value): value is number => value !== null);

  const from = starts.length ? Math.min(...starts) : 8 * 60;
  const to = ends.length ? Math.max(...ends) : 18 * 60;
  const start = Math.max(0, Math.floor(from / 60) - 1);
  const end = Math.min(24, Math.max(start + 6, Math.ceil(to / 60) + 1));
  const span = (end - start) * 60;

  return {
    start,
    end,
    pct: (minutes: number) => ((minutes - start * 60) / span) * 100,
  };
}

export function TheatreOperationsBoard({
  rooms,
  schedules,
  now,
  error,
  onRetry,
}: {
  rooms: Room[];
  schedules: Schedule[];
  now: Date;
  error?: string;
  onRetry: () => void;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const view = useMemo(() => {
    const today = dateKey(now);
    const todaySchedules = schedules.filter((schedule) => dateKey(schedule.startTime) === today);
    const activeRooms = rooms.filter((room) => room.isActive);
    const axis = axisFor(todaySchedules);

    const casesByRoom = new Map<string, Schedule[]>();
    for (const schedule of schedules) {
      if (schedule.status === 'CANCELLED') continue;
      const current = casesByRoom.get(schedule.otRoomId) ?? [];
      current.push(schedule);
      casesByRoom.set(schedule.otRoomId, current);
    }

    const roomViews = rooms.map((room) => {
      const allCases = (casesByRoom.get(room.id) ?? []).slice().sort(
        (first, second) =>
          new Date(first.startTime).getTime() - new Date(second.startTime).getTime(),
      );
      const todayCases = allCases.filter((schedule) => dateKey(schedule.startTime) === today);
      const activeCase = allCases.find((schedule) => schedule.status === 'IN_PROGRESS') ?? null;
      const nowMs = now.getTime();
      const nextCase =
        allCases.find(
          (schedule) =>
            isOpenSchedule(schedule.status) &&
            new Date(schedule.startTime).getTime() > nowMs &&
            schedule.id !== activeCase?.id,
        ) ?? null;
      const bookedMinutes = todayCases.reduce(
        (total, schedule) => total + durationMinutes(schedule.startTime, schedule.endTime),
        0,
      );
      const conflicts = todayCases.filter((schedule, index) =>
        todayCases.some(
          (other, otherIndex) =>
            otherIndex > index &&
            hasOverlap(schedule, other) &&
            schedule.status !== 'CANCELLED' &&
            other.status !== 'CANCELLED',
        ),
      );

      return {
        room,
        allCases,
        todayCases,
        activeCase,
        nextCase,
        bookedMinutes,
        conflict: conflicts.length > 0,
      };
    });

    const selected =
      roomViews.find((viewItem) => viewItem.room.id === selectedRoomId) ??
      roomViews.find((viewItem) => viewItem.activeCase) ??
      roomViews.find((viewItem) => viewItem.room.isActive) ??
      roomViews[0] ??
      null;

    return {
      roomViews,
      selected,
      axis,
      todaySchedules,
      activeRooms,
      ready: activeRooms.filter((room) => room.status === 'AVAILABLE').length,
      inUse: activeRooms.filter((room) => room.status === 'OCCUPIED').length,
      out: activeRooms.filter(
        (room) => room.status === 'MAINTENANCE' || room.status === 'DISABLED',
      ).length,
      conflicts: roomViews.filter((item) => item.conflict).length,
    };
  }, [now, rooms, schedules, selectedRoomId]);

  return (
    <Panel labelledBy="theatre-operations" className="h-full" tone="primary">
      <PanelHeader
        id="theatre-operations"
        title="Theatre operations"
        caption="Room state and the live theatre day. Select a theatre to read its cases."
        aside={
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <CountTag tone="positive">{view.ready} ready</CountTag>
            <CountTag tone="warning">{view.inUse} in use</CountTag>
            <CountTag tone={view.out ? 'critical' : 'neutral'}>{view.out} out</CountTag>
          </div>
        }
      />

      {error ? <PanelError message={error} onRetry={onRetry} /> : null}

      {!error && rooms.length === 0 ? (
        <PanelEmpty
          title="No theatres configured"
          description="The operating theatre register returned no rooms. Theatre operations cannot be assessed."
        />
      ) : null}

      {!error && rooms.length > 0 ? (
        <>
          <div className="border-rule-soft flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5">
            <p className="text-ink-secondary text-[11px]">
              {view.activeRooms.length} active theatre
              {view.activeRooms.length === 1 ? '' : 's'} · {view.todaySchedules.length} case
              {view.todaySchedules.length === 1 ? '' : 's'} today
            </p>
            <p
              className={`text-[11px] font-semibold ${
                view.conflicts ? 'text-danger' : 'text-success'
              }`}
            >
              {view.conflicts
                ? `${view.conflicts} theatre conflict${view.conflicts === 1 ? '' : 's'}`
                : 'No theatre conflicts'}
            </p>
          </div>

          <div className="grid gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {view.roomViews.map(({ room, todayCases, activeCase, nextCase, bookedMinutes, conflict }) => {
              const roomState = ROOM_STATUS[room.isActive ? room.status : 'DISABLED'];
              const selected = view.selected?.room.id === room.id;
              const tone =
                !room.isActive
                  ? 'neutral'
                  : room.status === 'AVAILABLE'
                    ? 'success'
                    : room.status === 'OCCUPIED'
                      ? 'primary'
                      : room.status === 'MAINTENANCE'
                        ? 'warning'
                        : 'neutral';

              const segments = todayCases.flatMap((schedule) => {
                const start = minutesOfDay(schedule.startTime);
                const end = minutesOfDay(schedule.endTime);
                if (start === null || end === null) return [];

                const left = Math.max(0, view.axis.pct(start));

                return [
                  {
                    id: schedule.id,
                    left,
                    width: Math.max(1.5, view.axis.pct(end) - left),
                    className: SCHEDULE_STATUS[schedule.status].rail,
                    label: `${schedule.procedure} ${formatTimeRange(
                      schedule.startTime,
                      schedule.endTime,
                    )}`,
                  },
                ];
              });

              return (
                <TheatreStatusCard
                  key={room.id}
                  code={room.code}
                  name={room.name}
                  descriptor={`${todayCases.length} case${
                    todayCases.length === 1 ? '' : 's'
                  } today`}
                  statusLabel={room.isActive ? roomState.label : 'Offline'}
                  tone={tone}
                  live={Boolean(activeCase)}
                  primaryLabel={
                    activeCase ? 'In theatre' : nextCase ? 'Next case' : 'Theatre day'
                  }
                  primaryLine={
                    activeCase
                      ? `${formatClock(activeCase.startTime)} · ${activeCase.procedure}`
                      : nextCase
                        ? `${formatClock(nextCase.startTime)} · ${nextCase.procedure}`
                        : 'No active or upcoming case'
                  }
                  secondaryLine={room.department?.name ?? 'No department recorded'}
                  bookedLabel={bookedMinutes > 0 ? formatDuration(bookedMinutes) : undefined}
                  segments={segments}
                  selected={selected}
                  onSelect={() => setSelectedRoomId(room.id)}
                  alert={conflict ? 'Overlap on today’s list' : undefined}
                />
              );
            })}
          </div>

          {view.selected ? (
            <div id="theatre-room-detail" className="border-rule-soft border-t px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-ink-muted text-[10px] font-semibold tracking-[0.08em] uppercase">
                    Selected theatre
                  </p>
                  <p className="text-ink mt-0.5 text-[13px] font-semibold">
                    {view.selected.room.code} · {view.selected.room.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                      ROOM_STATUS[view.selected.room.status].soft
                    } ${ROOM_STATUS[view.selected.room.status].text}`}
                  >
                    <span
                      className={`${ROOM_STATUS[view.selected.room.status].dot} h-1.5 w-1.5 rounded-full`}
                      aria-hidden="true"
                    />
                    {view.selected.room.isActive
                      ? ROOM_STATUS[view.selected.room.status].label
                      : 'Inactive'}
                  </span>
                  <Link
                    href="/ot-rooms"
                    className="text-primary text-[10.5px] font-semibold hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-[11px] sm:grid-cols-4">
                <div>
                  <dt className="text-ink-subtle">Department</dt>
                  <dd className="text-ink mt-0.5 truncate font-medium">
                    {view.selected.room.department?.name ?? 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-subtle">Capacity</dt>
                  <dd className="text-ink mt-0.5 font-medium">
                    {view.selected.room.capacity ?? 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-subtle">Booked today</dt>
                  <dd className="text-ink mt-0.5 font-medium">
                    {formatDuration(view.selected.bookedMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-subtle">Next case</dt>
                  <dd className="text-ink mt-0.5 truncate font-medium">
                    {view.selected.nextCase
                      ? `${formatClock(view.selected.nextCase.startTime)} · ${
                          view.selected.nextCase.procedure
                        }`
                      : 'None queued'}
                  </dd>
                </div>
              </dl>

              {view.selected.todayCases.length > 0 ? (
                <ol className="divide-rule-soft mt-3 divide-y border-t border-rule-soft">
                  {view.selected.todayCases.map((schedule) => {
                    const status = SCHEDULE_STATUS[schedule.status];

                    return (
                      <li key={schedule.id}>
                        <Link
                          href={`/schedules/${schedule.id}`}
                          className="group flex items-center gap-3 py-2 text-[11.5px]"
                        >
                          <span className="text-ink-secondary w-[5.6rem] shrink-0 font-mono text-[10.5px] tabular-nums">
                            {formatTimeRange(schedule.startTime, schedule.endTime)}
                          </span>
                          <span className="text-ink min-w-0 flex-1 truncate font-medium">
                            {schedule.procedure}
                          </span>
                          <span
                            className={`${status.tone} hidden rounded-full px-2 py-0.5 text-[9.5px] font-semibold sm:inline`}
                          >
                            {status.label}
                          </span>
                          <ArrowRight
                            size={12}
                            weight="bold"
                            className="text-ink-subtle group-hover:text-primary shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-ink-muted mt-3 border-t border-rule-soft pt-3 text-[11px]">
                  No cases booked in this theatre today.
                </p>
              )}

              {view.selected.room.status === 'OCCUPIED' && !view.selected.activeCase ? (
                <p className="bg-warning-soft text-warning mt-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[10.5px]">
                  The room register says occupied, but no case is marked in progress in the loaded
                  theatre list.
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}
