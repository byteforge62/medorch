
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
  canManageSchedules?: boolean;
  onEdit?: (schedule: ScheduleItem) => void;
  /** Called after a successful status change so the parent list can update. */
  onStatusUpdated?: (
    scheduleId: string,
    newStatus: ScheduleStatus
  ) => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Date unavailable';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeStr: string): string => {
  if (!timeStr) return 'Time unavailable';

  const date = new Date(timeStr);

  if (Number.isNaN(date.getTime())) {
    return timeStr;
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export function ScheduleCard({
  schedule,
  canManageSchedules = false,
  onEdit,
  onStatusUpdated,
}: ScheduleCardProps) {
  return (
    <Card className="transition-colors hover:border-border-strong" data-card="schedule">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="break-words text-base font-semibold text-foreground">
                {schedule.procedure}
              </h3>
              <div className="flex flex-wrap gap-1">
                <ScheduleStatusBadge status={schedule.status} />
                <SchedulePriorityBadge priority={schedule.priority} />
              </div>
            </div>

            <p className="mt-1 text-sm text-foreground-secondary">
              {formatDate(schedule.scheduledDate)}
              {' · '}
              {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 text-sm">
          <dl className="min-w-0">
            <div className="grid gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Patient</dt>
              <dd className="text-sm font-medium text-foreground">
                {schedule.patient?.name || 'Not assigned'}
              </dd>
              {schedule.patient?.patientCode && (
                <dd className="text-xs text-foreground-muted font-mono">
                  {schedule.patient.patientCode}
                </dd>
              )}
            </div>
          </dl>

          <dl className="min-w-0">
            <div className="grid gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Surgeon</dt>
              <dd className="text-sm font-medium text-foreground">
                {schedule.surgeon?.name || 'Not assigned'}
              </dd>
            </div>
          </dl>

          <dl className="min-w-0">
            <div className="grid gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Department</dt>
              <dd className="text-sm font-medium text-foreground">
                {schedule.department?.name || 'Not assigned'}
              </dd>
            </div>
          </dl>

          <dl className="min-w-0">
            <div className="grid gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Operating theatre</dt>
              <dd className="text-sm font-medium text-foreground">
                {schedule.otRoom?.name || 'Not assigned'}
                {schedule.otRoom?.code ? ` (${schedule.otRoom.code})` : ''}
              </dd>
            </div>
          </dl>
        </div>

        {schedule.clinicalNotes && (
          <div className="rounded-lg bg-surface-muted/60 border border-border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Clinical notes
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground-secondary">
              {schedule.clinicalNotes}
            </p>
          </div>
        )}

        {canManageSchedules && onStatusUpdated && (
          <div className="border-t border-border pt-3">
            <ScheduleStatusActions
              scheduleId={schedule.id}
              scheduleLabel={schedule.procedure}
              currentStatus={schedule.status}
              onStatusUpdated={(scheduleId, newStatus) =>
                onStatusUpdated?.(scheduleId, newStatus)
              }
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-3">
        <Link
          href={`/schedules/${schedule.id}`}
          aria-label={`View details for ${schedule.procedure}`}
          className="inline-flex min-h-9 items-center justify-center rounded-md border border-border-strong px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View details
        </Link>

        {canManageSchedules && onEdit && (
          <Button
            onClick={() => onEdit(schedule)}
            aria-label={`Edit ${schedule.procedure}`}
          >
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
}
