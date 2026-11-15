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
    'block min-h-9 w-full min-w-0 border border-border-strong bg-surface-subtle text-foreground px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  const availableRoomsCount = otRooms.filter(
    (room) =>
      !filters.departmentId || room.departmentId === filters.departmentId,
  ).length;

  return (
    <section
      aria-label="Filter schedules"
      className="border-border bg-surface min-w-0 border"
    >
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5">
        <h2 className="eyebrow">Filter the board</h2>

        <span className="text-foreground-muted font-mono text-[10px] tracking-[0.14em] uppercase">
          {hasActiveFilters ? 'Filters active' : 'No filters'}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-primary focus-visible:outline-ring text-[11px] font-semibold tracking-[0.1em] uppercase underline-offset-4 hover:underline focus-visible:outline-2"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-2 sm:px-5 lg:grid-cols-3 xl:grid-cols-6">
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
            className={controlClassName}
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
        <p className="border-border border-t px-4 py-2.5 text-sm text-danger sm:px-5">
          No OT rooms are configured for the selected department.
        </p>
      )}
    </section>
  );
}
