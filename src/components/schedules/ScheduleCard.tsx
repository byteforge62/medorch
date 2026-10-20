
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ScheduleStatusBadge,
  SchedulePriorityBadge,
  ScheduleStatus,
  SchedulePriority,
} from "./ScheduleStatusBadge";
import { ScheduleStatusActions } from "./ScheduleStatusActions";

export type ScheduleItem = {
  id: string;
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  createdById?: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  priority: SchedulePriority;
  clinicalNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  patient?: {
    id: string;
    patientCode?: string;
    name: string;
    phone?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  otRoom?: {
    id: string;
    name: string;
    code?: string;
    status?: string;
  };
  surgeon?: {
    id: string;
    name: string;
    email?: string;
  };
};

interface ScheduleCardProps {
  schedule: ScheduleItem;
  isAdmin?: boolean;
  onEdit?: (schedule: ScheduleItem) => void;
  /** Called after a successful status change so the parent list can update. */
  onStatusUpdated?: (
    scheduleId: string,
    newStatus: ScheduleStatus
  ) => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "Date unavailable";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeStr: string): string => {
  if (!timeStr) return "Time unavailable";

  const date = new Date(timeStr);

  if (Number.isNaN(date.getTime())) {
    // Preserve values already formatted as HH:mm or similar.
    return timeStr;
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function ScheduleCard({
  schedule,
  isAdmin = false,
  onEdit,
  onStatusUpdated,
}: ScheduleCardProps) {
  return (
    <Card className="transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="space-y-4">
        {/* Procedure header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-semibold text-slate-900 dark:text-slate-100">
              {schedule.procedure}
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Scheduled for {formatDate(schedule.scheduledDate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ScheduleStatusBadge status={schedule.status} />
            <SchedulePriorityBadge priority={schedule.priority} />
          </div>
        </div>

        {/* Schedule details */}
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Patient
            </span>
            <span className="mt-1 block break-words text-sm font-medium text-slate-900 dark:text-slate-100">
              {schedule.patient?.name || "Not assigned"}
            </span>
            {schedule.patient?.patientCode && (
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                ID: {schedule.patient.patientCode}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Surgeon
            </span>
            <span className="mt-1 block break-words text-sm font-medium text-slate-900 dark:text-slate-100">
              {schedule.surgeon?.name || "Not assigned"}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Department
            </span>
            <span className="mt-1 block break-words text-sm font-medium text-slate-900 dark:text-slate-100">
              {schedule.department?.name || "Not assigned"}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Operating room
            </span>
            <span className="mt-1 block break-words text-sm font-medium text-slate-900 dark:text-slate-100">
              {schedule.otRoom?.name || "Not assigned"}
              {schedule.otRoom?.code ? ` (${schedule.otRoom.code})` : ""}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Start time
            </span>
            <span className="mt-1 block text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatTime(schedule.startTime)}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              End time
            </span>
            <span className="mt-1 block text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatTime(schedule.endTime)}
            </span>
          </div>
        </div>

        {/* Clinical notes, when available to this user */}
        {schedule.clinicalNotes && (
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Clinical notes
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
              {schedule.clinicalNotes}
            </p>
          </div>
        )}

        {/* Status lifecycle actions — ADMIN only */}
        {isAdmin && onStatusUpdated && (
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <ScheduleStatusActions
              scheduleId={schedule.id}
              currentStatus={schedule.status}
              onStatusUpdated={(scheduleId, newStatus) =>
                onStatusUpdated?.(scheduleId, newStatus)
              }
            />
          </div>
        )}
      </div>

      {/* Card actions */}
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <Link
          href={`/schedules/${schedule.id}`}
          className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          View details
        </Link>

        {isAdmin && onEdit && (
          <Button onClick={() => onEdit(schedule)}>
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
}
