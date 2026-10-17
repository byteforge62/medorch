"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type Schedule = {
  id: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
  priority: "ELECTIVE" | "URGENT" | "EMERGENCY";
  patient?: {
    name: string;
    patientCode: string;
  };
  otRoom?: {
    name: string;
  };
  surgeon?: {
    name: string;
  };
};

type ScheduleFilter = "TODAY" | "UPCOMING" | "ALL";


export function RecentSchedulesList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] =
    useState<ScheduleFilter>("TODAY");


  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSchedules = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSchedules() {
      try {
        setError(null);
        const data = await apiClient.get<Schedule[]>('/api/schedules');

        if (!cancelled) {
          setSchedules(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch schedules:', err);
          setError('Failed to load schedules');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSchedules();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);


  const getStatusBadge = (status: Schedule["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return <Badge variant="warning">In Progress</Badge>;
      case "CONFIRMED":
        return <Badge variant="info">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelled</Badge>;
      case "DELAYED":
        return <Badge variant="warning">Delayed</Badge>;
      case "SCHEDULED":
      default:
        return <Badge variant="neutral">Scheduled</Badge>;
    }
  };

  const getPriorityBadge = (priority: Schedule["priority"]) => {
    switch (priority) {
      case "EMERGENCY":
        return <Badge variant="danger">Emergency</Badge>;
      case "URGENT":
        return <Badge variant="warning">Urgent</Badge>;
      case "ELECTIVE":
      default:
        return <Badge variant="neutral">Elective</Badge>;
    }
  };


  const sortedSchedules = [...schedules].sort((a, b) => {
    const priorityOrder = {
      EMERGENCY: 0,
      URGENT: 1,
      ELECTIVE: 2,
    };

    const activeOrder = (status: Schedule["status"]) =>
      status === "IN_PROGRESS" ? 0 : 1;

    const aTerminal =
      a.status === "COMPLETED" || a.status === "CANCELLED";
    const bTerminal =
      b.status === "COMPLETED" || b.status === "CANCELLED";

    if (aTerminal !== bTerminal) {
      return aTerminal ? 1 : -1;
    }

    if (!aTerminal && activeOrder(a.status) !== activeOrder(b.status)) {
      return activeOrder(a.status) - activeOrder(b.status);
    }

    if (!aTerminal && priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return (
      new Date(a.startTime).getTime() -
      new Date(b.startTime).getTime()
    );
  });


  const toLocalDateKey = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const todayKey = toLocalDateKey(now.toISOString());

  const filteredSchedules = sortedSchedules.filter((schedule) => {
    const scheduleDate = toLocalDateKey(schedule.scheduledDate);

    if (activeFilter === "ALL") return true;

    if (activeFilter === "TODAY") {
      return scheduleDate === todayKey;
    }

    return (
      scheduleDate > todayKey &&
      schedule.status !== "COMPLETED" &&
      schedule.status !== "CANCELLED"
    );
  });



  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Surgical Procedures Schedule</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">
            Upcoming & active operations
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            fetchSchedules();
          }}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Refresh
        </button>


        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["TODAY", "UPCOMING", "ALL"] as ScheduleFilter[]).map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={isActive}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                >
                  {filter === "TODAY"
                    ? "Today"
                    : filter === "UPCOMING"
                      ? "Upcoming"
                      : "All"}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredSchedules.length}{" "}
            {filteredSchedules.length === 1 ? "schedule" : "schedules"}
          </span>
        </div>

      </CardHeader>

      {isLoading ? (
        <LoadingState message="Loading surgical schedules..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSchedules} />
      ) : filteredSchedules.length === 0 ? (
        <EmptyState
          title="No Schedules Found"
          description={
            activeFilter === "TODAY"
              ? "No procedures are scheduled for today."
              : activeFilter === "UPCOMING"
                ? "No upcoming procedures found."
                : "No procedures are currently available."
          }
        />
      ) : (
        <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {schedule.procedure}
                  </span>
                  {getPriorityBadge(schedule.priority)}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {schedule.otRoom?.name && (
                    <span>Room: {schedule.otRoom.name}</span>
                  )}

                  {schedule.surgeon?.name && (
                    <span>Surgeon: {schedule.surgeon.name}</span>
                  )}

                  {schedule.patient?.patientCode && (
                    <span>Patient ID: {schedule.patient.patientCode}</span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between space-y-1 sm:mt-0 sm:flex-col sm:items-end">
                {getStatusBadge(schedule.status)}
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
