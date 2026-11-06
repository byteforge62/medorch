'use client';

import React from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

import type {
  WorkspaceDepartmentRef,
  WorkspaceRoom,
  WorkspaceSchedulePriority,
  WorkspaceScheduleStatus,
} from '@/modules/schedules/schedule-workspace.types';

export interface ScheduleWorkspaceFilters {
  search: string;
  status: WorkspaceScheduleStatus | '';
  priority: WorkspaceSchedulePriority | '';
  departmentId: string;
  theatreId: string;
}

export const EMPTY_SCHEDULE_FILTERS: ScheduleWorkspaceFilters = {
  search: '',
  status: '',
  priority: '',
  departmentId: '',
  theatreId: '',
};

const controlClass =
  'block min-h-9 w-full min-w-0 rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-ink-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function ScheduleToolbar({
  filters,
  onFilterChange,
  departments,
  rooms,
  resultCount,
  totalCount,
}: {
  filters: ScheduleWorkspaceFilters;
  onFilterChange: (filters: ScheduleWorkspaceFilters) => void;
  departments: WorkspaceDepartmentRef[];
  rooms: WorkspaceRoom[];
  resultCount: number;
  totalCount: number;
}) {
  const activeCount = Object.values(filters).filter(
    (value) => value.trim().length > 0,
  ).length;

  const update = (
    key: keyof ScheduleWorkspaceFilters,
    value: string,
  ) => {
    const next = { ...filters, [key]: value };

    if (
      key === 'departmentId' &&
      next.theatreId &&
      !rooms.some(
        (room) =>
          room.id === next.theatreId &&
          room.departmentId === value,
      )
    ) {
      next.theatreId = '';
    }

    onFilterChange(next);
  };

  return (
    <section
      aria-label="Filter the theatre day"
      className="border-border bg-surface border-b"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="eyebrow">Lens</p>
          <span className="text-ink-subtle font-mono text-[10px] tabular-nums">
            {resultCount} of {totalCount} procedures
          </span>
        </div>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => onFilterChange(EMPTY_SCHEDULE_FILTERS)}
            className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X size={11} weight="bold" aria-hidden="true" />
            Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
          </button>
        ) : (
          <span className="text-ink-subtle font-mono text-[10px] uppercase">
            All accessible cases
          </span>
        )}
      </div>

      <div className="grid gap-2.5 px-4 pb-3.5 sm:grid-cols-2 sm:px-5 xl:grid-cols-[minmax(12rem,1.5fr)_repeat(4,minmax(0,1fr))]">
        <label className="relative block min-w-0">
          <span className="sr-only">Search procedures</span>
          <MagnifyingGlass
            size={14}
            className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Procedure, patient, surgeon, theatre"
            className={`${controlClass} pl-8`}
          />
        </label>

        <label className="block min-w-0">
          <span className="sr-only">Theatre</span>
          <select
            value={filters.theatreId}
            onChange={(event) => update('theatreId', event.target.value)}
            className={controlClass}
          >
            <option value="">All theatres</option>
            {rooms
              .filter(
                (room) =>
                  !filters.departmentId ||
                  room.departmentId === filters.departmentId,
              )
              .map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} · {room.name}
                </option>
              ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="sr-only">Department</span>
          <select
            value={filters.departmentId}
            onChange={(event) =>
              update('departmentId', event.target.value)
            }
            className={controlClass}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="sr-only">Status</span>
          <select
            value={filters.status}
            onChange={(event) => update('status', event.target.value)}
            className={controlClass}
          >
            <option value="">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DELAYED">Delayed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <label className="block min-w-0">
          <span className="sr-only">Priority</span>
          <select
            value={filters.priority}
            onChange={(event) => update('priority', event.target.value)}
            className={controlClass}
          >
            <option value="">All priorities</option>
            <option value="ELECTIVE">Elective</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </label>
      </div>
    </section>
  );
}
