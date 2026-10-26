'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScheduleStatus } from './ScheduleStatusBadge';

export type ScheduleStatusUpdateResult = {
  id: string;
  status: ScheduleStatus;
};

interface StatusAction {
  targetStatus: ScheduleStatus;
  label: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  requiresConfirmation?: boolean;
  confirmMessage?: string;
}

export interface ScheduleStatusActionsProps {
  scheduleId: string;
  currentStatus: ScheduleStatus;
  onStatusUpdated: (scheduleId: string, newStatus: ScheduleStatus) => void;
  scheduleLabel?: string;
}

const STATUS_ACTIONS: Record<ScheduleStatus, StatusAction[]> = {
  SCHEDULED: [
    { targetStatus: 'CONFIRMED', label: 'Confirm', variant: 'primary' },
    { targetStatus: 'CANCELLED', label: 'Cancel', variant: 'danger', requiresConfirmation: true },
  ],
  CONFIRMED: [
    { targetStatus: 'IN_PROGRESS', label: 'Start Procedure', variant: 'primary' },
    { targetStatus: 'DELAYED', label: 'Mark Delayed', variant: 'secondary', requiresConfirmation: true },
    { targetStatus: 'CANCELLED', label: 'Cancel', variant: 'danger', requiresConfirmation: true },
  ],
  IN_PROGRESS: [
    { targetStatus: 'COMPLETED', label: 'Mark complete', variant: 'primary', requiresConfirmation: true },
  ],
  DELAYED: [
    { targetStatus: 'IN_PROGRESS', label: 'Resume', variant: 'primary' },
    { targetStatus: 'COMPLETED', label: 'Mark complete', variant: 'primary' },
    { targetStatus: 'CANCELLED', label: 'Cancel', variant: 'danger', requiresConfirmation: true },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Screen-reader name for a status action button. Confirmation and
 * cancellation operate on the schedule itself, so those names name the
 * schedule; the remaining transitions act on the procedure.
 */
function statusActionAriaLabel(
  action: StatusAction,
  scheduleLabel?: string,
): string {
  const targetsSchedule =
    action.targetStatus === 'CONFIRMED' || action.targetStatus === 'CANCELLED';

  const suffix = targetsSchedule ? ' schedule' : '';

  return scheduleLabel
    ? `${action.label}${suffix} for ${scheduleLabel}`
    : `${action.label}${suffix}`;
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-confirm-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-border-strong bg-surface p-6 shadow-lg">
        <h3
          id="status-confirm-title"
          className="mt-1 text-center text-sm font-semibold text-foreground"
        >
          Confirm procedure status change
        </h3>
        <p className="mt-2 text-center text-sm text-foreground-muted">
          {message}
        </p>
        <div className="mt-5 flex flex-col-reverse items-center gap-3 sm:flex-row justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            Go back
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>

  )
}

export function ScheduleStatusActions({ scheduleId, currentStatus, onStatusUpdated, scheduleLabel }: ScheduleStatusActionsProps) {
  const [pendingAction, setPendingAction] = React.useState<StatusAction | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const actions = STATUS_ACTIONS[currentStatus] ?? [];

  if (actions.length === 0) return null;

  const activateAction = (action: StatusAction) => {
    setError(null);
    if (action.requiresConfirmation) {
      setPendingAction(action);
    } else {
      setIsSubmitting(true);
      fetch(`/api/schedules/${scheduleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action.targetStatus }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data: unknown) => {
              const message =
                data && typeof data === 'object' && 'error' in data
                  ? (data.error as string)
                  : 'Unable to update the procedure status.';
              throw new Error(message);
            });
          }

          return res.json();
        })
        .then(() => onStatusUpdated(scheduleId, action.targetStatus))
        .catch((caught: unknown) =>
          setError(
            caught instanceof Error
              ? caught.message
              : 'An unexpected error occurred.',
          ),
        )
        .finally(() => setIsSubmitting(false));

    }
  };

  if (pendingAction) {
    return (
      <ConfirmDialog
        message={pendingAction.confirmMessage ?? 'Are you sure you want to proceed?'}
        onConfirm={() => {
          activateAction(pendingAction);
          setPendingAction(null);
        }}
        onCancel={() => setPendingAction(null)}
      />
    );
  }

  return (
    <fieldset className="space-y-3 border border-border border-l-4 border-l-primary rounded-md bg-surface-muted p-4">
      <legend className="sr-only">Change procedure status</legend>
      {error && (
        <div
          role="alert"
          className="rounded-md border border-danger-border bg-danger-soft p-3 text-sm font-medium text-danger"
        >
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.targetStatus}
            type="button"
            variant={action.variant}
            size="sm"
            isLoading={isSubmitting}
            aria-label={statusActionAriaLabel(action, scheduleLabel)}
            onClick={() => activateAction(action)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
