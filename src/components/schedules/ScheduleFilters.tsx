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
  otRooms: { id: string; name: string; code?: string }[];
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
    "mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400";

  const controlClassName =
    "block min-h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400";

  return (
    <section
      aria-label="Filter schedules"
      className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Filter Schedules
        </h4>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md text-xs font-medium text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        <div className="min-w-0 xl:col-span-2">
          <label htmlFor="schedule-search" className={labelClassName}>
            Search procedures
          </label>
          <input
            id="schedule-search"
            type="search"
            placeholder="Procedure, patient, surgeon..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
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
            onChange={(e) => handleChange("status", e.target.value)}
            className={controlClassName}
          >
            <option value="">All Statuses</option>
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
            <option value="">All Priorities</option>
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
            {otRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} {room.code ? `(${room.code})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}