'use client';

import React, { useState } from 'react';
import { Funnel, MagnifyingGlass, X } from '@phosphor-icons/react';

import type {
  WorkspaceDepartmentRef,
  WorkspaceRoom,
  WorkspaceSchedulePriority,
  WorkspaceScheduleStatus,
} from '@/types/schedule-workspace.types';

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
  'block min-h-10 w-full min-w-0 rounded-[var(--radius-control)] border border-ice-border bg-white px-3 py-2 text-[12.5px] text-ink shadow-xs outline-none transition-colors placeholder:text-ink-subtle focus-visible:border-cobalt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt';

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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      className="border-ice-border bg-sheet shadow-xs overflow-hidden rounded-[var(--radius-panel)] border"
    >
      <div className="border-rule-soft bg-porcelain/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <p className="ui-kicker">Lens</p>
          <span className="text-ink-subtle text-[11px] tabular-nums">
            {resultCount} of {totalCount}{' '}
            {totalCount === 1 ? 'procedure' : 'procedures'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="schedule-filter-fields"
            className="border-ice-border text-ink-secondary hover:border-cobalt/30 hover:text-cobalt inline-flex min-h-8 items-center gap-1.5 rounded-full border bg-white px-3 text-[11px] font-semibold shadow-xs transition-colors sm:hidden"
          >
            <Funnel size={12} weight="bold" aria-hidden="true" />
            {filtersOpen ? 'Hide filters' : 'Filters'}
            {activeCount > 0 ? (
              <span className="bg-primary text-primary-ink grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] tabular-nums">
                {activeCount}
              </span>
            ) : null}
          </button>

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
            <span className="text-ink-subtle hidden text-[11px] sm:inline">
              All accessible cases
            </span>
          )}
        </div>
      </div>

      <div
        id="schedule-filter-fields"
        className={`grid-cols-1 gap-2.5 px-4 pt-3.5 pb-3.5 sm:grid sm:grid-cols-2 sm:px-5 xl:grid-cols-[minmax(12rem,1.5fr)_repeat(4,minmax(0,1fr))] ${
          filtersOpen ? 'grid' : 'hidden'
        }`}
      >
        <label className="relative block min-w-0 sm:col-span-2 xl:col-span-1">
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
            placeholder="Procedure, patient, surgeon"
            className={`${controlClass} rounded-[var(--radius-pill)] pl-9`}
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
