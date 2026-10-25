"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScheduleItem } from "./ScheduleCard";
import { ScheduleStatus } from "./ScheduleStatusBadge";
import { ScheduleFilters, FilterState } from "./ScheduleFilters";
import { ScheduleList } from "./ScheduleList";
import {
  ScheduleForm,
  PatientOption,
  DepartmentOption,
  OTRoomOption,
  DoctorOption,
} from "./ScheduleForm";
import { ScheduleCalendar } from './ScheduleCalendar';

export function SchedulePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const canManageSchedules =
    isAdmin || session?.user?.role === "DOCTOR";

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [otRooms, setOtRooms] = useState<OTRoomOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const initialFilters: FilterState = {
    status: "",
    priority: "",
    date: "",
    departmentId: "",
    otRoomId: "",
    search: "",
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ScheduleItem[]>("/api/schedules");
      setSchedules(data || []);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setError("Failed to load surgery schedules from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSchedules() {
      try {
        const data = await apiClient.get<ScheduleItem[]>("/api/schedules");

        if (isMounted) {
          setSchedules(data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch schedules:", err);
          setError("Failed to load surgery schedules from server.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    async function loadReferenceData() {
      const departmentRequest = apiClient.get<DepartmentOption[]>("/api/departments");
      const roomRequest = apiClient.get<OTRoomOption[]>("/api/ot-rooms");

      const patientRequest = canManageSchedules
        ? apiClient.get<PatientOption[]>("/api/patients")
        : Promise.resolve(null);

      const doctorRequest = canManageSchedules
        ? apiClient.get<DoctorOption[]>("/api/doctors")
        : Promise.resolve(null);

      const [deptRes, roomRes, patientRes, doctorRes] = await Promise.allSettled([
        departmentRequest,
        roomRequest,
        patientRequest,
        doctorRequest,
      ]);

      if (!isMounted) return;

      if (deptRes.status === "fulfilled" && deptRes.value) {
        setDepartments(deptRes.value);
      }

      if (roomRes.status === "fulfilled" && roomRes.value) {
        setOtRooms(roomRes.value);
      }

      if (
        patientRes.status === "fulfilled" &&
        patientRes.value
      ) {
        setPatients(patientRes.value);
      }

      if (
        doctorRes.status === "fulfilled" &&
        doctorRes.value
      ) {
        setDoctors(doctorRes.value);
      }
    }

    void loadSchedules();
    void loadReferenceData();

    return () => {
      isMounted = false;
    };
  }, [canManageSchedules]);

  // Client-side filtering logic
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      // Priority filter
      if (filters.priority && item.priority !== filters.priority) {
        return false;
      }
      // Date filter
      if (filters.date) {
        try {
          const itemDate = new Date(item.scheduledDate)
            .toISOString()
            .split("T")[0];
          if (itemDate !== filters.date) {
            return false;
          }
        } catch {
          return false;
        }
      }
      // Department filter
      if (filters.departmentId && item.departmentId !== filters.departmentId) {
        return false;
      }
      // OT Room filter
      if (filters.otRoomId && item.otRoomId !== filters.otRoomId) {
        return false;
      }
      // Search filter (procedure, patient name, surgeon name)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const procMatch = item.procedure.toLowerCase().includes(query);
        const patientMatch = item.patient?.name?.toLowerCase().includes(query);
        const surgeonMatch = item.surgeon?.name?.toLowerCase().includes(query);
        if (!procMatch && !patientMatch && !surgeonMatch) {
          return false;
        }
      }

      return true;
    });
  }, [schedules, filters]);

  const scheduleMetrics = useMemo(
    () => [
      {
        label: "Total procedures",
        value: schedules.length,
        detail: "All accessible schedules",
        accent: "border-l-slate-400",
      },
      {
        label: "Scheduled",
        value: schedules.filter((item) => item.status === "SCHEDULED").length,
        detail: "Awaiting confirmation",
        accent: "border-l-sky-500",
      },
      {
        label: "In progress",
        value: schedules.filter((item) => item.status === "IN_PROGRESS").length,
        detail: "Currently underway",
        accent: "border-l-amber-500",
      },
      {
        label: "Completed",
        value: schedules.filter((item) => item.status === "COMPLETED").length,
        detail: "Finished procedures",
        accent: "border-l-emerald-500",
      },
    ],
    [schedules],
  );

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleStatusUpdated = useCallback(
    (scheduleId: string, newStatus: ScheduleStatus) => {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === scheduleId ? { ...s, status: newStatus } : s,
        ),
      );
      // Background refetch — no loading spinner, filters stay intact
      apiClient
        .get<ScheduleItem[]>("/api/schedules")
        .then((data) => {
          if (data) setSchedules(data);
        })
        .catch((err) => {
          console.error("Background schedule refresh failed:", err);
        });
    },
    [],
  );

  return (
    <main className="space-y-6">
      {/* Header Banner */}          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Surgical Schedules
            </h1>
            <Badge variant="info">{schedules.length} Total</Badge>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            View, schedule, and manage operating theatre procedures and room
            allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div
            role="group"
            aria-label="Schedule view"
            className="inline-flex rounded-lg border border-border-strong p-1"
          >
            <button
              type="button"
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'list'
                ? 'bg-primary text-foreground-inverse'
                : 'text-foreground-secondary hover:bg-surface-muted'
                }`}
            >
              List
            </button>

            <button
              type="button"
              aria-pressed={viewMode === 'calendar'}
              onClick={() => setViewMode('calendar')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'calendar'
                ? 'bg-primary text-foreground-inverse'
                : 'text-foreground-secondary hover:bg-surface-muted'
                }`}
            >
              Calendar
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSchedules}
            isLoading={isLoading}
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button size="sm" onClick={handleOpenCreate}>
              + Create Schedule
            </Button>
          )}
        </div>
      </div>

      <section
        aria-label="Schedule overview"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {scheduleMetrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-xl border border-slate-200 border-l-4 ${metric.accent} bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900`}
          >
            <p className="text-sm font-medium text-foreground-muted">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              {metric.detail}
            </p>
          </div>
        ))}
      </section>
      {/* Filter Section */}
      <ScheduleFilters
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        otRooms={otRooms}
        onReset={handleResetFilters}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm text-slate-600 dark:text-slate-400"
          aria-live="polite"
        >
          Showing{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {filteredSchedules.length}
          </span>{" "}
          of {schedules.length} procedures
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400 dark:hover:bg-slate-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Schedules List */}
      {viewMode === "calendar" ? (
        <ScheduleCalendar
          schedules={filteredSchedules}
          isLoading={isLoading}
          error={error}
          onRetry={fetchSchedules}
        />
      ) : (
        <ScheduleList
          schedules={filteredSchedules}
          isLoading={isLoading}
          error={error}
          onRetry={fetchSchedules}
          canManageSchedules={canManageSchedules}
          onEdit={handleOpenEdit}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Schedule Form Modal */}
      <ScheduleForm
        key={editingSchedule?.id || (isFormOpen ? 'open' : 'closed')}
        initialSchedule={editingSchedule}
        patients={patients}
        departments={departments}
        otRooms={otRooms}
        doctors={doctors}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSchedule(null);
        }}
        onSuccess={fetchSchedules}
      />
    </main>
  );
}
