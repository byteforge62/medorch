'use client';

import React, { useMemo } from 'react';
import { Clock, MapPin } from '@phosphor-icons/react';

import type {
  WorkspaceRoom,
  WorkspaceSchedule,
  WorkspaceScheduleStatus,
} from '@/modules/schedules/schedule-workspace.types';
import {
  SCHEDULE_BLOCK_TONE,
  SCHEDULE_RAIL_TONE,
  SCHEDULE_STATUS_LABEL,
  PRIORITY_LABEL,
  ROOM_STATUS_DOT,
  ROOM_STATUS_LABEL,
  ROOM_STATUS_TONE,
  buildTimeAxis,
  durationMinutes,
  formatClock,
  formatDuration,
  formatTimeRange,
  scheduleDayBounds,
} from './schedule-workspace-format';

const LEGEND: WorkspaceScheduleStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'DELAYED',
  'COMPLETED',
  'CANCELLED',
];

function hourTicks(startHour: number, endHour: number) {
  const ticks: number[] = [];
  for (let hour = startHour; hour <= endHour; hour += 1) {
    ticks.push(hour);
  }
  return ticks;
}

function laneState(
  room: WorkspaceRoom,
  cases: WorkspaceSchedule[],
  isToday: boolean,
  now: Date | null,
) {
  if (!room.isActive) {
    return {
      label: 'Offline',
      tone: 'text-ink-muted',
      dot: 'bg-ink-subtle',
      unavailable: true,
    };
  }

  if (room.status === 'MAINTENANCE' || room.status === 'DISABLED') {
    return {
      label: ROOM_STATUS_LABEL[room.status],
      tone: ROOM_STATUS_TONE[room.status],
      dot: ROOM_STATUS_DOT[room.status],
      unavailable: true,
    };
  }

  const nowMs = now?.getTime();
  const live = isToday
    ? cases.some(
        (schedule) =>
          schedule.status === 'IN_PROGRESS' &&
          nowMs !== undefined &&
          new Date(schedule.startTime).getTime() <= nowMs &&
          new Date(schedule.endTime).getTime() > nowMs,
      )
    : false;

  if (live) {
    return {
      label: 'In procedure',
      tone: 'text-secondary',
      dot: 'bg-brass',
      unavailable: false,
    };
  }

  if (room.status === 'OCCUPIED') {
    return {
      label: 'Register: in use',
      tone: 'text-warning',
      dot: 'bg-warning',
      unavailable: false,
    };
  }

  if (!isToday && cases.length > 0) {
    return {
      label: 'Scheduled',
      tone: 'text-primary',
      dot: 'bg-primary',
      unavailable: false,
    };
  }

  return {
    label: 'Available',
    tone: 'text-success',
    dot: 'bg-success',
    unavailable: false,
  };
}

function StatusLegend() {
  return (
    <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 lg:flex">
      {LEGEND.map((status) => (
        <span
          key={status}
          className="text-ink-muted inline-flex items-center gap-1.5 text-[9.5px]"
        >
          <span
            className={`${SCHEDULE_RAIL_TONE[status]} h-1.5 w-1.5 rounded-full`}
            aria-hidden="true"
          />
          {SCHEDULE_STATUS_LABEL[status]}
        </span>
      ))}
    </div>
  );
}

function EmptyBand({
  dayCount,
  visibleCount,
  dateKey,
}: {
  dayCount: number;
  visibleCount: number;
  dateKey: string;
}) {
  return (
    <div className="border-rule bg-surface-subtle/35 border-b px-4 py-3 sm:px-5">
      <p className="text-ink text-[11.5px] font-medium">
        {dayCount === 0
          ? 'No procedures are booked on this date.'
          : `${visibleCount} of ${dayCount} procedures match the current lens.`}
      </p>
      <p className="text-ink-muted mt-0.5 text-[10.5px]">
        {dayCount === 0
          ? 'The theatre lanes remain visible so availability is still readable. Use the date controls to move through the week.'
          : 'Clear or change the theatre, department, status, priority or search controls to broaden the view.'}
      </p>
      <span className="sr-only">Selected date {dateKey}</span>
    </div>
  );
}

export function ScheduleTimeline({
  schedules,
  allDaySchedules,
  rooms,
  dateKey,
  todayKey,
  now,
  selectedId,
  conflictScheduleIds,
  onSelect,
}: {
  schedules: WorkspaceSchedule[];
  allDaySchedules: WorkspaceSchedule[];
  rooms: WorkspaceRoom[];
  dateKey: string;
  todayKey: string;
  now: Date | null;
  selectedId: string | null;
  conflictScheduleIds: Set<string>;
  onSelect: (scheduleId: string) => void;
}) {
  const isToday = dateKey === todayKey;

  const lanes = useMemo(() => {
    const byId = new Map(rooms.map((room) => [room.id, room]));

    for (const schedule of allDaySchedules) {
      if (schedule.otRoom && !byId.has(schedule.otRoom.id)) {
        byId.set(schedule.otRoom.id, {
          id: schedule.otRoom.id,
          name: schedule.otRoom.name,
          code: schedule.otRoom.code,
          departmentId: schedule.otRoom.departmentId,
          departmentName: schedule.department?.name ?? null,
          status: schedule.otRoom.status,
          isActive: schedule.otRoom.isActive,
        });
      }
    }

    return [...byId.values()]
      .filter(
        (room) =>
          room.isActive ||
          allDaySchedules.some(
            (schedule) => schedule.otRoomId === room.id,
          ),
      )
      .sort((left, right) => left.code.localeCompare(right.code))
      .map((room) => {
        const cases = schedules
          .filter((schedule) => schedule.otRoomId === room.id)
          .sort(
            (left, right) =>
              new Date(left.startTime).getTime() -
              new Date(right.startTime).getTime(),
          );
        const allCases = allDaySchedules.filter(
          (schedule) => schedule.otRoomId === room.id,
        );

        return {
          room,
          cases,
          allCases,
          state: laneState(room, allCases, isToday, now),
        };
      });
  }, [allDaySchedules, isToday, now, rooms, schedules]);

  const axis = useMemo(
    () => buildTimeAxis(allDaySchedules, dateKey, isToday ? now : null),
    [allDaySchedules, dateKey, isToday, now],
  );

  const ticks = hourTicks(axis.startHour, axis.endHour);
  const nowMinute = now
    ? now.getHours() * 60 + now.getMinutes()
    : null;
  const nowInside =
    isToday &&
    nowMinute !== null &&
    nowMinute >= axis.startHour * 60 &&
    nowMinute <= axis.endHour * 60;
  const nowPct = nowInside ? axis.pct(nowMinute) : null;

  return (
    <section
      aria-labelledby="theatre-day-heading"
      className="border-rule bg-surface overflow-hidden border"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="theatre-day-heading"
              className="font-display text-ink text-[18px] leading-none font-medium"
            >
              Theatre day
            </h2>
            <span className="text-ink-subtle font-mono text-[9.5px] uppercase">
              {lanes.length} theatres ·{' '}
              {schedules.length === allDaySchedules.length
                ? schedules.length
                : `${schedules.length} of ${allDaySchedules.length}`}{' '}
              {schedules.length === 1 ? 'procedure' : 'procedures'}
            </span>
          </div>
          <p className="text-ink-muted mt-1 flex items-center gap-1.5 text-[10.5px]">
            <Clock size={11} aria-hidden="true" />
            Local theatre time · blocks are positioned by recorded start and
            end.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusLegend />
          <p className="text-ink-subtle text-[8.5px]">
            Select a block to read the case.
          </p>
        </div>
      </div>

      {schedules.length !== allDaySchedules.length ? (
        <EmptyBand
          dayCount={allDaySchedules.length}
          visibleCount={schedules.length}
          dateKey={dateKey}
        />
      ) : allDaySchedules.length === 0 ? (
        <EmptyBand
          dayCount={0}
          visibleCount={0}
          dateKey={dateKey}
        />
      ) : null}

      {/* Desktop / tablet time-positioned board. */}
      <div
        className="hidden overflow-x-auto md:block"
        data-schedule-timeline
      >
        <div className="min-w-[760px] pb-1">
          <div className="border-rule grid grid-cols-[10.5rem_minmax(0,1fr)] border-b">
            <div className="text-ink-subtle flex items-end px-4 pb-2 text-[9px] font-semibold tracking-[0.08em] uppercase">
              Theatre / local
            </div>
            <div className="relative h-8">
              {ticks.map((hour) => {
                const pct = axis.pct(hour * 60);
                const nearNow =
                  nowMinute !== null &&
                  Math.abs(hour * 60 - nowMinute) < 45;
                const showLabel =
                  !nearNow &&
                  (hour === axis.startHour ||
                    hour === axis.endHour ||
                    (hour - axis.startHour) % 2 === 0);

                return (
                  <React.Fragment key={hour}>
                    <span
                      className="bg-rule absolute top-0 bottom-0 w-px"
                      style={{ left: `${pct}%` }}
                      aria-hidden="true"
                    />
                    {showLabel ? (
                      <span
                        className="text-ink-subtle absolute bottom-1.5 -translate-x-1/2 font-mono text-[9px] tabular-nums"
                        style={{
                          left: `${Math.min(97, Math.max(3, pct))}%`,
                        }}
                      >
                        {String(hour).padStart(2, '0')}:00
                      </span>
                    ) : null}
                  </React.Fragment>
                );
              })}

              {nowPct !== null && now ? (
                <span
                  className="bg-danger absolute top-1 bottom-0 z-10 w-px"
                  style={{ left: `${nowPct}%` }}
                  aria-hidden="true"
                >
                  <span className="bg-danger text-foreground-inverse absolute top-0 left-1 rounded-sm px-1 py-0.5 font-mono text-[8px] leading-none whitespace-nowrap tabular-nums">
                    Now {formatClock(now)}
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          {lanes.map(({ room, cases, allCases, state }) => (
            <div
              key={room.id}
              className="border-rule grid grid-cols-[10.5rem_minmax(0,1fr)] border-b last:border-b-0"
              data-theatre-lane={room.code}
            >
              <div
                className={`min-w-0 px-4 py-3 ${
                  state.unavailable ? 'bg-surface-subtle/45' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`${state.dot} h-1.5 w-1.5 shrink-0 rounded-full`}
                    aria-hidden="true"
                  />
                  <p className="text-ink truncate font-mono text-[10.5px] font-semibold">
                    {room.code}
                  </p>
                </div>
                <p className="text-ink-secondary mt-0.5 truncate text-[10.5px] font-medium">
                  {room.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className={`text-[9px] font-semibold ${state.tone}`}>
                    {state.label}
                  </span>
                  <span className="text-ink-subtle text-[9px]">
                    {allCases.length} case{allCases.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div
                className={`relative min-h-[5.25rem] ${
                  state.unavailable
                    ? 'bg-[repeating-linear-gradient(135deg,var(--surface-subtle)_0,var(--surface-subtle)_7px,var(--sheet)_7px,var(--sheet)_14px)]'
                    : 'bg-surface'
                }`}
              >
                {ticks.map((hour) => (
                  <span
                    key={hour}
                    className="bg-rule-soft absolute top-0 bottom-0 w-px"
                    style={{ left: `${axis.pct(hour * 60)}%` }}
                    aria-hidden="true"
                  />
                ))}

                {nowPct !== null ? (
                  <span
                    className="bg-danger/65 absolute top-0 bottom-0 z-10 w-px"
                    style={{ left: `${nowPct}%` }}
                    aria-hidden="true"
                  />
                ) : null}

                {cases.length === 0 ? (
                  <p className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[9.5px]">
                    {state.unavailable
                      ? 'Theatre unavailable'
                      : allCases.length > 0
                        ? 'No cases match the lens'
                        : 'No procedures booked'}
                  </p>
                ) : null}

                {cases.map((schedule) => {
                  const bounds = scheduleDayBounds(
                    schedule.startTime,
                    schedule.endTime,
                    dateKey,
                  );

                  if (!bounds) return null;

                  const left = axis.pct(bounds.startMinute);
                  const width = axis.pct(bounds.endMinute) - left;
                  const selected = selectedId === schedule.id;
                  const conflict = conflictScheduleIds.has(schedule.id);
                  const duration = durationMinutes(
                    schedule.startTime,
                    schedule.endTime,
                  );

                  return (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={() => onSelect(schedule.id)}
                      aria-pressed={selected}
                      aria-label={`${schedule.procedure}, ${formatTimeRange(
                        schedule.startTime,
                        schedule.endTime,
                      )}, ${room.code}, ${
                        SCHEDULE_STATUS_LABEL[schedule.status]
                      }, ${PRIORITY_LABEL[schedule.priority]} priority${
                        conflict ? ', resource conflict' : ''
                      }`}
                      title={`${schedule.procedure} · ${formatTimeRange(
                        schedule.startTime,
                        schedule.endTime,
                      )} · ${formatDuration(duration)} · ${
                        SCHEDULE_STATUS_LABEL[schedule.status]
                      }${
                        schedule.patient
                          ? ` · ${schedule.patient.name}`
                          : ''
                      }`}
                      className={`${SCHEDULE_BLOCK_TONE[schedule.status]} absolute top-2 z-20 flex h-[4.3rem] overflow-hidden rounded-[5px] border text-left shadow-xs transition-[box-shadow,border-color] focus-visible:z-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        selected
                          ? 'ring-primary ring-2 ring-offset-1 ring-offset-white'
                          : ''
                      } ${
                        conflict
                          ? 'border-danger border-dashed'
                          : ''
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        minWidth: '2px',
                      }}
                      data-schedule-id={schedule.id}
                    >
                      <span
                        className={`${SCHEDULE_RAIL_TONE[schedule.status]} absolute inset-y-0 left-0 w-[3px]`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 pl-2.5 pr-1.5 py-1">
                        <span className="block truncate text-[10px] leading-tight font-semibold">
                          {schedule.procedure}
                        </span>
                        <span className="mt-1 block truncate font-mono text-[8.5px] leading-tight tabular-nums opacity-80">
                          {formatTimeRange(
                            schedule.startTime,
                            schedule.endTime,
                          )}{' '}
                          · {formatDuration(duration)}
                        </span>
                        <span className="mt-0.5 block truncate text-[9px] leading-tight font-medium opacity-80">
                          {SCHEDULE_STATUS_LABEL[schedule.status]}
                          {schedule.priority !== 'ELECTIVE'
                            ? ` · ${PRIORITY_LABEL[schedule.priority]}`
                            : ''}
                        </span>
                      </span>
                      {schedule.priority === 'EMERGENCY' ? (
                        <span
                          className="bg-danger absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {lanes.length === 0 ? (
            <p className="text-ink-muted px-5 py-8 text-sm">
              No theatres match the current theatre or department filter.
            </p>
          ) : null}
        </div>
      </div>

      {/* Mobile: exact-position lane minimaps + readable agenda. */}
      <div className="md:hidden" data-schedule-mobile>
        <div className="border-rule divide-rule border-t">
          {lanes.map(({ room, cases, allCases, state }) => (
            <div key={room.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-ink truncate font-mono text-[10.5px] font-semibold">
                    {room.code}
                  </p>
                  <p className="text-ink-muted truncate text-[10px]">
                    {room.name}
                  </p>
                </div>
                <span className={`text-[9px] font-semibold ${state.tone}`}>
                  {state.label}
                </span>
              </div>

              <div
                className="bg-surface-subtle relative mt-2 h-3.5 overflow-hidden rounded-sm"
                aria-hidden="true"
              >
                {ticks
                  .filter((hour) => hour % 3 === 0)
                  .map((hour) => (
                    <span
                      key={hour}
                      className="bg-rule absolute top-0 bottom-0 w-px"
                      style={{ left: `${axis.pct(hour * 60)}%` }}
                    />
                  ))}
                {cases.map((schedule) => {
                  const bounds = scheduleDayBounds(
                    schedule.startTime,
                    schedule.endTime,
                    dateKey,
                  );
                  if (!bounds) return null;

                  const left = axis.pct(bounds.startMinute);
                  const width = axis.pct(bounds.endMinute) - left;

                  return (
                    <span
                      key={schedule.id}
                      className={`${SCHEDULE_RAIL_TONE[schedule.status]} absolute inset-y-0 opacity-85 ${
                        selectedId === schedule.id
                          ? 'ring-1 ring-primary'
                          : ''
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        minWidth: '2px',
                      }}
                    />
                  );
                })}
                {nowPct !== null ? (
                  <span
                    className="bg-danger absolute top-0 bottom-0 z-10 w-px"
                    style={{ left: `${nowPct}%` }}
                  />
                ) : null}
              </div>

              {cases.length === 0 ? (
                <p className="text-ink-subtle mt-1 text-[9.5px]">
                  {state.unavailable
                    ? 'Theatre unavailable'
                    : allCases.length > 0
                      ? 'No cases match the lens'
                      : 'No procedures booked'}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="border-rule border-t">
          <div className="flex items-center justify-between px-4 py-2.5">
            <p className="eyebrow">Day agenda</p>
            <span className="text-ink-subtle font-mono text-[9.5px] tabular-nums">
              {schedules.length} case{schedules.length === 1 ? '' : 's'}
            </span>
          </div>

          {schedules.length === 0 ? (
            <p className="text-ink-muted border-rule border-t px-4 py-5 text-[11px]">
              No procedures match the current lens.
            </p>
          ) : (
            <ul className="border-rule divide-rule divide-y border-t">
              {schedules.map((schedule) => {
                const selected = selectedId === schedule.id;
                const conflict = conflictScheduleIds.has(schedule.id);

                return (
                  <li key={schedule.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(schedule.id)}
                      aria-pressed={selected}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
                        selected
                          ? 'bg-primary-soft/60'
                          : 'hover:bg-surface-subtle/60'
                      }`}
                    >
                      <span className="text-ink-secondary w-[4.4rem] shrink-0 pt-0.5 font-mono text-[10px] leading-snug tabular-nums">
                        {formatTimeRange(
                          schedule.startTime,
                          schedule.endTime,
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start gap-1.5">
                          <span className="text-ink block min-w-0 truncate text-[11.5px] font-semibold">
                            {schedule.procedure}
                          </span>
                          {conflict ? (
                            <span
                              className="bg-danger mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                              aria-label="Resource conflict"
                            />
                          ) : null}
                        </span>
                        <span className="text-ink-muted mt-0.5 flex items-center gap-1.5 text-[10px]">
                          <MapPin size={10} aria-hidden="true" />
                          {schedule.otRoom?.code ?? 'Unassigned'} ·{' '}
                          {SCHEDULE_STATUS_LABEL[schedule.status]}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
