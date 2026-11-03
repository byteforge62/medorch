'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ScheduleStatusBadge,
  SchedulePriorityBadge,
  ScheduleStatus,
  SchedulePriority,
} from './ScheduleStatusBadge';
import { ScheduleStatusActions } from './ScheduleStatusActions';

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

const railTone: Record<ScheduleStatus, string> = {
  IN_PROGRESS: 'bg-danger',
  DELAYED: 'bg-warning',
  CONFIRMED: 'bg-primary',
  SCHEDULED: 'bg-border-strong',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-border-strong/50',
};

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

interface ScheduleCardProps {
  schedule: ScheduleItem;
  canManageSchedules?: boolean;
  onEdit?: (schedule: ScheduleItem) => void;
  /** Called after a successful status change so the parent list can update. */
  onStatusUpdated?: (
    scheduleId: string,
    newStatus: ScheduleStatus,
  ) => void;
}

/**
 * ScheduleCard — one line on the board, not a card in a grid.
 *
 * Each case is a ruled row with a status rail, a tabular time gutter and the
 * clinical assignment in the middle; status controls and links sit at the end
 * of the line. The row opens into a second strip only when the record carries
 * clinical notes or the user can act on the status, so the list stays dense.
 */
export function ScheduleCard({
  schedule,
  canManageSchedules = false,
  onEdit,
  onStatusUpdated,
}: ScheduleCardProps) {
  const terminal =
    schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED';

  return (
    <li
      className={`bg-surface ${terminal ? 'opacity-70' : ''}`}
      data-card="schedule"
    >
      <div className="relative">
        <span
          className={`absolute top-0 bottom-0 left-0 w-[3px] ${railTone[schedule.status]}`}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-3 py-4 pr-4 pl-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="shrink-0 lg:w-44">
            <p className="text-foreground font-mono text-xs font-semibold tabular-nums">
              {formatDate(schedule.scheduledDate)}
            </p>
            <p className="text-foreground-muted mt-0.5 font-mono text-[11px] tabular-nums">
              {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-foreground text-sm font-semibold">
                {schedule.procedure}
              </h3>
              <SchedulePriorityBadge priority={schedule.priority} />
              <ScheduleStatusBadge status={schedule.status} />
            </div>

            <p className="text-foreground-muted mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
              <span>
                <span className="text-foreground-secondary font-medium">
                  {schedule.patient?.name || 'Patient not assigned'}
                </span>
                {schedule.patient?.patientCode
                  ? ` · ${schedule.patient.patientCode}`
                  : ''}
              </span>
              <span>{schedule.department?.name || 'No department'}</span>
              <span>
                {schedule.otRoom?.name || 'Theatre not assigned'}
                {schedule.otRoom?.code ? ` (${schedule.otRoom.code})` : ''}
              </span>
              <span>{schedule.surgeon?.name || 'Surgeon not assigned'}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`/schedules/${schedule.id}`}
              aria-label={`View details for ${schedule.procedure}`}
              className="border-border-strong text-foreground-secondary hover:bg-surface-subtle inline-flex min-h-9 items-center justify-center border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View details
            </Link>

            {canManageSchedules && onEdit ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(schedule)}
                aria-label={`Edit ${schedule.procedure}`}
              >
                Edit
              </Button>
            ) : null}
          </div>
        </div>

        {schedule.clinicalNotes ? (
          <div className="border-border-surface mx-4 mb-3 border-l-2 bg-surface-subtle/70 py-2 pr-3 pl-3 lg:mx-5">
            <p className="eyebrow">Clinical notes</p>
            <p className="text-foreground-secondary mt-1 line-clamp-2 text-xs leading-relaxed whitespace-pre-wrap">
              {schedule.clinicalNotes}
            </p>
          </div>
        ) : null}

        {canManageSchedules && onStatusUpdated ? (
          <div className="border-border-surface border-t px-4 pt-3 pb-4 lg:px-5">
            <ScheduleStatusActions
              scheduleId={schedule.id}
              scheduleLabel={schedule.procedure}
              currentStatus={schedule.status}
              onStatusUpdated={(scheduleId, newStatus) =>
                onStatusUpdated?.(scheduleId, newStatus)
              }
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}
