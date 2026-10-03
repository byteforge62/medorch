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

export function SchedulePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [otRooms, setOtRooms] = useState<OTRoomOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

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

    apiClient
      .get<ScheduleItem[]>("/api/schedules")
      .then((data) => {
        if (isMounted) {
          setSchedules(data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch schedules:", err);
          setError("Failed to load surgery schedules from server.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    Promise.allSettled([
      apiClient.get<DepartmentOption[]>("/api/departments"),
      apiClient.get<OTRoomOption[]>("/api/ot-rooms"),
      apiClient.get<PatientOption[]>("/api/patients"),
      apiClient.get<DoctorOption[]>("/api/doctors"),
    ]).then(([deptRes, roomRes, patientRes, doctorRes]) => {
      if (!isMounted) return;
      if (deptRes.status === "fulfilled" && deptRes.value) {
        setDepartments(deptRes.value);
      }
      if (roomRes.status === "fulfilled" && roomRes.value) {
        setOtRooms(roomRes.value);
      }
      if (patientRes.status === "fulfilled" && patientRes.value) {
        setPatients(patientRes.value);
      }
      if (doctorRes.status === "fulfilled" && doctorRes.value) {
        setDoctors(doctorRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  /**
   * Optimistically update the status in local state so the UI reflects the
   * change immediately, then do a background refetch to sync server state.
   * Filters and search state are preserved.
   */
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Surgical Schedules
            </h1>
            <Badge variant="purple">{schedules.length} Total</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View, schedule, and manage operating theatre procedures and room allocations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
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

      {/* Filter Section */}
      <ScheduleFilters
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        otRooms={otRooms}
        onReset={handleResetFilters}
      />

      {/* Schedules List */}
      <ScheduleList
        schedules={filteredSchedules}
        isLoading={isLoading}
        error={error}
        onRetry={fetchSchedules}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Schedule Form Modal */}
      <ScheduleForm
        key={editingSchedule?.id || (isFormOpen ? "open" : "closed")}
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
    </div>
  );
}
