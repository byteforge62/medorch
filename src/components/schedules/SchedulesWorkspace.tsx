'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';

import type {
  ScheduleWorkspaceData,
  WorkspaceSchedule,
} from '@/modules/schedules/schedule-workspace.types';
import {
  conflictsForSchedule,
  detectScheduleConflicts,
} from '@/modules/schedules/schedule-conflicts';
import { ScheduleDayHeader, type DayBrief } from './ScheduleDayHeader';
import { ScheduleWeekStrip } from './ScheduleWeekStrip';
import {
  EMPTY_SCHEDULE_FILTERS,
  type ScheduleWorkspaceFilters,
  ScheduleToolbar,
} from './ScheduleToolbar';
import { ScheduleTimeline } from './ScheduleTimeline';
import { ScheduleConflictPanel } from './ScheduleConflictPanel';
import { ScheduleInspector } from './ScheduleInspector';
import { ScheduleForm } from './ScheduleForm';
import {
  SCHEDULE_STATUS_LABEL,
  addDaysLocal,
  formatClock,
  formatDateShort,
  localDateKey,
  parseLocalDateKey,
  scheduleIntersectsDate,
  weekDatesFor,
} from './schedule-workspace-format';

function briefFor(
  daySchedules: WorkspaceSchedule[],
  rooms: ScheduleWorkspaceData['rooms'],
  selectedDateKey: string,
  todayKey: string,
  now: Date | null,
) {
  const active = daySchedules.filter(
    (schedule) => schedule.status !== 'CANCELLED',
  );
  const bookedRoomIds = new Set(
    active.map((schedule) => schedule.otRoomId).filter(Boolean),
  );
  const availableRooms = rooms.filter(
    (room) => room.isActive && room.status === 'AVAILABLE',
  );
  const freeTheatres = availableRooms.filter(
    (room) => !bookedRoomIds.has(room.id),
  ).length;
  const isToday = selectedDateKey === todayKey;

  const inUseTheatres = isToday && now
    ? new Set(
        active
          .filter(
            (schedule) =>
              schedule.status === 'IN_PROGRESS' &&
              new Date(schedule.startTime).getTime() <= now.getTime() &&
              new Date(schedule.endTime).getTime() > now.getTime(),
          )
          .map((schedule) => schedule.otRoomId),
      ).size
    : 0;

  const brief: DayBrief = {
    procedures: active.length,
    bookedTheatres: bookedRoomIds.size,
    freeTheatres,
    inUseTheatres,
    pending: active.filter((schedule) => schedule.status === 'SCHEDULED')
      .length,
    conflicts: detectScheduleConflicts(active).length,
  };

  return brief;
}

function matchesFilters(
  schedule: WorkspaceSchedule,
  filters: ScheduleWorkspaceFilters,
) {
  if (filters.status && schedule.status !== filters.status) {
    return false;
  }

  if (filters.priority && schedule.priority !== filters.priority) {
    return false;
  }

  if (filters.departmentId && schedule.departmentId !== filters.departmentId) {
    return false;
  }

  if (filters.theatreId && schedule.otRoomId !== filters.theatreId) {
    return false;
  }

  const search = filters.search.trim().toLowerCase();

  if (!search) return true;

  return [
    schedule.procedure,
    schedule.patient?.name,
    schedule.patient?.patientCode,
    schedule.surgeon?.name,
    schedule.otRoom?.code,
    schedule.otRoom?.name,
    schedule.department?.name,
  ]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(search));
}

function EmptyInspector({
  dayCount,
  roomCount,
  pending,
  onNewSchedule,
  canCreate,
}: {
  dayCount: number;
  roomCount: number;
  pending: number;
  onNewSchedule: () => void;
  canCreate: boolean;
}) {
  return (
    <aside className="border-rule bg-surface hidden overflow-hidden rounded-[var(--radius-panel)] border xl:block">
      <div className="px-4 pt-4 pb-3.5">
        <p className="eyebrow">Case brief</p>
        <h2 className="text-ink mt-2 text-[15px] leading-snug font-semibold tracking-[-0.01em]">
          Select a procedure
        </h2>
        <p className="text-ink-muted mt-1.5 text-[11px] leading-relaxed">
          Choose a block on the theatre timeline or a row in the day agenda to
          read the patient reference, team, equipment and status controls.
        </p>
      </div>

      <dl className="border-rule divide-rule divide-y border-t">
        {[
          { term: 'Procedures this day', value: String(dayCount) },
          { term: 'Theatres in view', value: String(roomCount) },
          { term: 'Awaiting confirmation', value: String(pending) },
        ].map((row) => (
          <div
            key={row.term}
            className="flex items-baseline justify-between gap-3 px-4 py-2.5"
          >
            <dt className="text-ink-subtle text-[9.5px] font-semibold tracking-[0.07em] uppercase">
              {row.term}
            </dt>
            <dd className="text-ink text-[12px] font-semibold tabular-nums">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-rule bg-surface-subtle/35 border-t px-4 py-3.5">
        <p className="text-ink-muted text-[10px] leading-relaxed">
          The timeline plots actual recorded start and end times. Nothing is
          positioned by assumed duration.
        </p>
        {canCreate ? (
          <button
            type="button"
            onClick={onNewSchedule}
            className="text-primary mt-2 text-[10.5px] font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Create a schedule
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export function SchedulesWorkspace({
  data,
  initialDateKey,
  initialDateWasExplicit,
}: {
  data: ScheduleWorkspaceData;
  initialDateKey: string;
  initialDateWasExplicit: boolean;
}) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(data.schedules);
  const [selectedDateKey, setSelectedDateKey] = useState(initialDateKey);
  const [todayKey, setTodayKey] = useState(data.todayKey);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ScheduleWorkspaceFilters>(
    EMPTY_SCHEDULE_FILTERS,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<WorkspaceSchedule | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSchedules(data.schedules);
  }, [data.schedules]);

  useEffect(() => {
    setSelectedDateKey(initialDateKey);
    setSelectedId(null);
  }, [initialDateKey]);

  /*
   * The server cannot know the browser's timezone. The visible day and the
   * "today" marker therefore come from the client clock. Only a request that
   * omitted `?date=` is corrected; an explicit URL date is respected.
   */
  useEffect(() => {
    const clientToday = localDateKey(new Date());
    setTodayKey(clientToday);

    if (initialDateWasExplicit || clientToday === initialDateKey) {
      return;
    }

    if (weekDatesFor(clientToday)[0] === weekDatesFor(initialDateKey)[0]) {
      setSelectedDateKey(clientToday);
      const url = new URL(window.location.href);
      url.searchParams.set('date', clientToday);
      window.history.replaceState(null, '', url);
      return;
    }

    startRefresh(() => {
      router.replace(`/schedules?date=${clientToday}`);
    });
  }, [initialDateKey, initialDateWasExplicit, router, startRefresh]);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    },
    [],
  );

  const announce = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = setTimeout(() => setNotice(null), 6_000);
  }, []);

  const refresh = useCallback(() => {
    startRefresh(() => router.refresh());
  }, [router, startRefresh]);

  const daySchedules = useMemo(
    () =>
      schedules.filter((schedule) =>
        scheduleIntersectsDate(
          schedule.startTime,
          schedule.endTime,
          selectedDateKey,
        ),
      ),
    [schedules, selectedDateKey],
  );

  const activeDaySchedules = useMemo(
    () =>
      daySchedules.filter((schedule) => schedule.status !== 'CANCELLED'),
    [daySchedules],
  );

  const conflicts = useMemo(
    () => detectScheduleConflicts(activeDaySchedules),
    [activeDaySchedules],
  );

  const conflictScheduleIds = useMemo(
    () =>
      new Set(
        conflicts.flatMap((conflict) => conflict.scheduleIds),
      ),
    [conflicts],
  );

  const brief = useMemo(
    () =>
      briefFor(
        daySchedules,
        data.rooms,
        selectedDateKey,
        todayKey,
        now,
      ),
    [data.rooms, daySchedules, now, selectedDateKey, todayKey],
  );

  const filteredSchedules = useMemo(
    () => daySchedules.filter((schedule) => matchesFilters(schedule, filters)),
    [daySchedules, filters],
  );

  const visibleRooms = useMemo(
    () =>
      data.rooms.filter((room) => {
        if (filters.theatreId) {
          return room.id === filters.theatreId;
        }
        if (filters.departmentId) {
          return room.departmentId === filters.departmentId;
        }
        return true;
      }),
    [data.rooms, filters.departmentId, filters.theatreId],
  );

  const weekCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const schedule of schedules) {
      if (schedule.status === 'CANCELLED') continue;
      const key = localDateKey(schedule.startTime);
      counts[key] = (counts[key] ?? 0) + 1;
    }

    return counts;
  }, [schedules]);

  const selectedSchedule = selectedId
    ? schedules.find((schedule) => schedule.id === selectedId) ?? null
    : null;

  const selectedConflicts = selectedSchedule
    ? conflictsForSchedule(conflicts, selectedSchedule.id)
    : [];

  const selectSchedule = useCallback(
    (scheduleId: string) => {
      setSelectedId(scheduleId);
      const schedule = schedules.find((item) => item.id === scheduleId);
      if (schedule) {
        announce(`Showing case brief for ${schedule.procedure}.`);
      }

      if (window.matchMedia('(max-width: 1279px)').matches) {
        window.setTimeout(() => {
          document
            .getElementById('schedule-inspector')
            ?.scrollIntoView({ block: 'start' });
        }, 30);
      }
    },
    [announce, schedules],
  );

  const closeInspector = useCallback(() => {
    const previous = selectedSchedule;
    setSelectedId(null);
    if (previous) {
      announce(`Closed case brief for ${previous.procedure}.`);
      window.setTimeout(() => {
        const target = document.querySelector<HTMLElement>(
          `[data-schedule-id="${previous.id}"]`,
        );
        target?.focus();
      }, 30);
    }
  }, [announce, selectedSchedule]);

  const navigateToDate = useCallback(
    (nextKey: string) => {
      if (!parseLocalDateKey(nextKey)) {
        return;
      }

      const currentWeek = weekDatesFor(selectedDateKey);
      const nextWeek = weekDatesFor(nextKey);

      if (currentWeek[0] === nextWeek[0]) {
        setSelectedDateKey(nextKey);
        setSelectedId(null);
        const url = new URL(window.location.href);
        url.searchParams.set('date', nextKey);
        window.history.replaceState(null, '', url);
        return;
      }

      startRefresh(() => {
        router.push(`/schedules?date=${nextKey}`);
      });
    },
    [router, selectedDateKey, startRefresh],
  );

  const shiftDay = useCallback(
    (delta: number) => {
      const date = parseLocalDateKey(selectedDateKey);
      if (!date) return;
      navigateToDate(localDateKey(addDaysLocal(date, delta)));
    },
    [navigateToDate, selectedDateKey],
  );

  const handleStatusUpdated = useCallback(
    (scheduleId: string, status: WorkspaceSchedule['status']) => {
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === scheduleId ? { ...schedule, status } : schedule,
        ),
      );
      const schedule = schedules.find((item) => item.id === scheduleId);
      announce(
        `${schedule?.procedure ?? 'Case'} is now ${SCHEDULE_STATUS_LABEL[
          status
        ].toLowerCase()}.`,
      );
      refresh();
    },
    [announce, refresh, schedules],
  );

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingSchedule(null);
    announce('Schedule saved. Refreshing the theatre day.');
    refresh();
  }, [announce, refresh]);

  const openCreateForm = useCallback(() => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  }, []);

  return (
    <main className="pb-8">
      <ScheduleDayHeader
        dateKey={selectedDateKey}
        todayKey={todayKey}
        brief={brief}
        canCreate={data.capabilities.canCreate}
        refreshing={isRefreshing}
        onDateChange={navigateToDate}
        onPreviousDay={() => shiftDay(-1)}
        onNextDay={() => shiftDay(1)}
        onToday={() => navigateToDate(todayKey)}
        onNewSchedule={openCreateForm}
        onRefresh={refresh}
      />

      <ScheduleWeekStrip
        dateKey={selectedDateKey}
        todayKey={todayKey}
        counts={weekCounts}
        onSelect={navigateToDate}
      />

      <section className="border-rule bg-surface mb-4 overflow-hidden rounded-[var(--radius-panel)] border">
        <ScheduleToolbar
          filters={filters}
          onFilterChange={setFilters}
          departments={data.departments}
          rooms={data.rooms}
          resultCount={filteredSchedules.length}
          totalCount={daySchedules.length}
        />
      </section>

      <div
        role="status"
        aria-live="polite"
        className={
          notice
            ? 'border-rule bg-surface text-ink-secondary mb-3 flex items-start gap-2 rounded-[var(--radius-control)] border px-3 py-2 text-[11px]'
            : 'sr-only'
        }
      >
        {notice ? (
          <>
            <CheckCircle
              size={13}
              weight="bold"
              className="text-success mt-0.5 shrink-0"
              aria-hidden="true"
            />
            {notice}
          </>
        ) : (
          'No schedule changes in this session.'
        )}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <ScheduleTimeline
            schedules={filteredSchedules}
            allDaySchedules={daySchedules}
            rooms={visibleRooms}
            dateKey={selectedDateKey}
            todayKey={todayKey}
            now={now}
            selectedId={selectedId}
            conflictScheduleIds={conflictScheduleIds}
            onSelect={selectSchedule}
          />

          <ScheduleConflictPanel
            conflicts={conflicts}
            schedules={daySchedules}
            onSelect={selectSchedule}
          />
        </div>

        <div className="min-w-0">
          {selectedSchedule ? (
            <div className="scroll-mt-4 xl:sticky xl:top-4">
              <ScheduleInspector
                schedule={selectedSchedule}
                conflicts={selectedConflicts}
                role={data.role}
                capabilities={data.capabilities}
                onClose={closeInspector}
                onEdit={(schedule) => {
                  setEditingSchedule(schedule);
                  setIsFormOpen(true);
                }}
                onStatusUpdated={handleStatusUpdated}
              />
            </div>
          ) : (
            <EmptyInspector
              dayCount={activeDaySchedules.length}
              roomCount={visibleRooms.length}
              pending={brief.pending}
              canCreate={data.capabilities.canCreate}
              onNewSchedule={openCreateForm}
            />
          )}
        </div>
      </div>

      <footer className="border-rule text-ink-subtle mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[9.5px]">
        <p>
          {data.scope === 'ASSIGNED'
            ? 'Assigned theatre cases only'
            : 'All accessible theatre cases'}{' '}
          · local browser time · {formatDateShort(selectedDateKey)}
        </p>
        <p className="font-mono tabular-nums">
          Prisma read {formatClock(data.generatedAt)} · {schedules.length}{' '}
          cases loaded this week
        </p>
      </footer>

      <ScheduleForm
        key={editingSchedule?.id || (isFormOpen ? 'open' : 'closed')}
        initialSchedule={editingSchedule}
        defaultDate={selectedDateKey}
        patients={data.patients}
        departments={data.departments}
        otRooms={data.rooms}
        doctors={data.doctors}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSchedule(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </main>
  );
}
