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

  const hasActiveFilters =
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    Boolean(filters.date) ||
    Boolean(filters.departmentId) ||
    Boolean(filters.otRoomId) ||
    Boolean(filters.search);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Filter Schedules
        </h4>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Procedure, Patient, Surgeon..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
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

        {/* Priority Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
          >
            <option value="">All Priorities</option>
            <option value="ELECTIVE">Elective</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
          />
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Department
          </label>
          <select
            value={filters.departmentId}
            onChange={(e) => handleChange("departmentId", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* OT Room Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            OT Room
          </label>
          <select
            value={filters.otRoomId}
            onChange={(e) => handleChange("otRoomId", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
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
    </div>
  );
}
