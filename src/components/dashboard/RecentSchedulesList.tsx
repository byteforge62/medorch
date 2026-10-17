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

export function RecentSchedulesList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


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
      </CardHeader>

      {isLoading ? (
        <LoadingState message="Loading surgical schedules..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSchedules} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No Schedules Found"
          description="No procedures currently scheduled."
        />
      ) : (
        <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
          {schedules.map((schedule) => (
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
                <div className="space-x-3 text-xs text-slate-500">
                  <span>Patient: {schedule.patient?.name || 'N/A'}</span>
                  <span>•</span>
                  <span>Surgeon: {schedule.surgeon?.name || 'Unassigned'}</span>
                  <span>•</span>
                  <span>Room: {schedule.otRoom?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between space-y-1 sm:mt-0 sm:flex-col sm:items-end">
                {getStatusBadge(schedule.status)}
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(schedule.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
