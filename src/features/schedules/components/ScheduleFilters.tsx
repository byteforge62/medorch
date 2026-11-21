'use client';

import React from 'react';

export interface FilterState {
  status: string;
  priority: string;
  date: string;
  departmentId: string;
  otRoomId: string;
  search: string;
}

interface ScheduleFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  departments: { id: string; name: string }[];
  otRooms: {
    id: string;
    name: string;
    code?: string;
    departmentId?: string;
  }[];
  onReset: () => void;
}

/**
 * ScheduleFilters — a control strip rather than a form card.
 *
 * All six controls sit in one responsive row under a mono header so the board
 * itself stays above the fold. The department→room dependency is preserved:
 * changing department clears a room selected under the old department, since
 * it would otherwise silently filter every schedule out.
 */
export function ScheduleFilters({
  filters,
  onFilterChange,
  departments,
  otRooms,
  onReset,
}: ScheduleFiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    const next: FilterState = {
      ...filters,
      [key]: value,
    };

    if (
      key === 'departmentId' &&
      next.otRoomId !== '' &&
      !otRooms.some(
        (room) => room.id === next.otRoomId && room.departmentId === value,
      )
    ) {
      next.otRoomId = '';
    }

    onFilterChange(next);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  const labelClassName = 'eyebrow mb-1.5 block';

  const controlClassName =
    'block min-h-10 w-full min-w-0 rounded-[var(--radius-control)] border border-ice-border bg-white text-ink px-3 py-2 text-[12.5px] shadow-xs outline-none transition-colors placeholder:text-ink-subtle focus-visible:border-cobalt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt';

  const availableRoomsCount = otRooms.filter(
    (room) =>
      !filters.departmentId || room.departmentId === filters.departmentId,
  ).length;

  return (
    <section
      aria-label="Filter schedules"
      className="border-ice-border bg-sheet shadow-xs min-w-0 overflow-hidden rounded-[var(--radius-panel)] border"
    >
      <div className="border-rule-soft bg-porcelain/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <h2 className="ui-kicker">Filter the board</h2>

        <div className="flex items-center gap-3">
          <span className="text-ink-subtle text-[11px]">
            {hasActiveFilters ? 'Filters active' : 'No filters applied'}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-cobalt hover:text-cobalt-hover focus-visible:outline-cobalt rounded-full border border-ice-border bg-white px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3 xl:grid-cols-6">
        <div className="min-w-0 xl:col-span-2">
          <label htmlFor="schedule-search" className={labelClassName}>
            Search
          </label>
          <input
            id="schedule-search"
            type="search"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Procedure, patient, or surgeon"
            className={`${controlClassName} rounded-[var(--radius-pill)] px-3.5`}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="schedule-status" className={labelClassName}>
            Status
          </label>
          <select
            id="schedule-status"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={controlClassName}
          >
            <option value="">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DELAYED">Delayed</option>
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor="schedule-priority" className={labelClassName}>
            Priority
          </label>
          <select
            id="schedule-priority"
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={controlClassName}
          >
            <option value="">All priorities</option>
            <option value="ELECTIVE">Elective</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor="schedule-date" className={labelClassName}>
            Date
          </label>
          <input
            id="schedule-date"
            type="date"
            value={filters.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={controlClassName}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="schedule-department" className={labelClassName}>
            Department
          </label>
          <select
            id="schedule-department"
            value={filters.departmentId}
            onChange={(e) => handleChange('departmentId', e.target.value)}
            className={controlClassName}
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor="schedule-room" className={labelClassName}>
            OT Room
          </label>
          <select
            id="schedule-room"
            value={filters.otRoomId}
            onChange={(e) => handleChange('otRoomId', e.target.value)}
            className={controlClassName}
          >
            <option value="">All OT rooms</option>
            {otRooms
              .filter(
                (room) =>
                  !filters.departmentId ||
                  room.departmentId === filters.departmentId,
              )
              .map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                  {room.code ? ` (${room.code})` : ''}
                </option>
              ))}
          </select>
        </div>
      </div>

      {availableRoomsCount === 0 && filters.departmentId !== '' && (
        <p className="border-rule-soft text-danger border-t px-4 py-2.5 text-[12px] sm:px-5">
          No OT rooms are configured for the selected department.
        </p>
      )}
    </section>
  );
}
