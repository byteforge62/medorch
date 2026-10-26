"use client";

import React from "react";

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

export function ScheduleFilters({
  filters,
  onFilterChange,
  departments,
  otRooms,
  onReset,
}: ScheduleFiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  const labelClassName =
    "mb-1.5 block text-xs font-medium text-foreground-muted";

  const controlClassName =
    "block min-h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  const availableRoomsCount = otRooms.filter(
    (room) => !filters.departmentId || room.departmentId === filters.departmentId,
  ).length;

  return (
    <section
      aria-label="Filter schedules"
      className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
          Filter Schedules
        </h2>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="schedule-status" className={labelClassName}>
            Status
          </label>
          <select
            id="schedule-status"
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
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
            onChange={(e) => handleChange("priority", e.target.value)}
            className={controlClassName}
          >
            <option value="">All priorities</option>
            <option value="ELECTIVE">Elective</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="schedule-date" className={labelClassName}>
            Date
          </label>
          <input
            id="schedule-date"
            type="date"
            value={filters.date}
            onChange={(e) => handleChange("date", e.target.value)}
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
            onChange={(e) => handleChange("departmentId", e.target.value)}
            className={controlClassName}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-w-0">
        <label htmlFor="schedule-room" className={labelClassName}>
          OT Room
        </label>
        <select
          id="schedule-room"
          value={filters.otRoomId}
          onChange={(e) => handleChange("otRoomId", e.target.value)}
          className={controlClassName}
        >
          <option value="">All OT Rooms</option>
          {otRooms
            .filter(
              (room) =>
                !filters.departmentId || room.departmentId === filters.departmentId,
            )
            .map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
                {room.code ? ` (${room.code})` : ''}
              </option>
            ))}
        </select>
      </div>

      {availableRoomsCount === 0 && filters.departmentId !== '' && (
        <p className="text-sm text-danger">
          No OT rooms available for the selected department.
        </p>
      )}
    </section>
  );
}
