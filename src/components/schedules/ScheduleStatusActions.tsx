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
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
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
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel',
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage:
        'Cancel this theatre schedule? The case will be closed as cancelled.',
      confirmLabel: 'Cancel schedule',
      confirmVariant: 'danger',
    },
  ],
  CONFIRMED: [
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Start procedure',
      variant: 'primary',
    },
    {
      targetStatus: 'DELAYED',
      label: 'Mark delayed',
      variant: 'secondary',
      requiresConfirmation: true,
      confirmMessage:
        'Mark this procedure delayed? The theatre allocation stays recorded.',
      confirmLabel: 'Mark delayed',
    },
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel',
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage:
        'Cancel this theatre schedule? The case will be closed as cancelled.',
      confirmLabel: 'Cancel schedule',
      confirmVariant: 'danger',
    },
  ],
  IN_PROGRESS: [
    {
      targetStatus: 'DELAYED',
      label: 'Mark delayed',
      variant: 'secondary',
      requiresConfirmation: true,
      confirmMessage:
        'Mark this running procedure delayed? The theatre allocation stays recorded.',
      confirmLabel: 'Mark delayed',
    },
    {
      targetStatus: 'COMPLETED',
      label: 'Mark complete',
      variant: 'primary',
      requiresConfirmation: true,
      confirmMessage:
        'Mark this procedure complete? This closes the case and cannot be reversed.',
      confirmLabel: 'Mark complete',
    },
  ],
  DELAYED: [
    {
      targetStatus: 'CONFIRMED',
      label: 'Reconfirm',
      variant: 'secondary',
    },
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Resume',
      variant: 'primary',
    },
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel',
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage:
        'Cancel this delayed theatre schedule? The case will be closed as cancelled.',
      confirmLabel: 'Cancel schedule',
      confirmVariant: 'danger',
    },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

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
  title,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
}: {
  message: string;
  title: string;
  confirmLabel: string;
  confirmVariant: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const id = React.useId();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="bg-foreground/45 fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
            return;
          }

          if (event.key !== 'Tab' || !cardRef.current) return;

          const focusable = Array.from(
            cardRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href]',
            ),
          ).filter((element) => element.offsetParent !== null);

          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        className="border-border-strong bg-surface w-full max-w-sm rounded-[var(--radius-panel)] border p-5 shadow-xl"
      >
        <p className="eyebrow">Case status</p>
        <h3
          id={`${id}-title`}
          className="text-foreground mt-1.5 text-sm font-semibold"
        >
          {title}
        </h3>
        <p
          id={`${id}-message`}
          className="text-foreground-muted mt-2 text-[12px] leading-relaxed"
        >
          {message}
        </p>
        <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            Go back
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleStatusActions({
  scheduleId,
  currentStatus,
  onStatusUpdated,
  scheduleLabel,
}: ScheduleStatusActionsProps) {
  const [pendingAction, setPendingAction] =
    React.useState<StatusAction | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const actions = STATUS_ACTIONS[currentStatus] ?? [];

  if (actions.length === 0) return null;

  const submitAction = async (action: StatusAction) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schedules/${scheduleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action.targetStatus }),
      });

      if (!response.ok) {
        let message = 'Unable to update the procedure status.';

        try {
          const data: unknown = await response.json();
          if (
            data &&
            typeof data === 'object' &&
            'error' in data &&
            typeof data.error === 'string'
          ) {
            message = data.error;
          }
        } catch {
          // Keep the generic message when the server did not return JSON.
        }

        throw new Error(message);
      }

      onStatusUpdated(scheduleId, action.targetStatus);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'An unexpected error occurred.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activateAction = (
    action: StatusAction,
    trigger: HTMLButtonElement,
  ) => {
    setError(null);
    triggerRef.current = trigger;

    if (action.requiresConfirmation) {
      setPendingAction(action);
      return;
    }

    void submitAction(action);
  };

  if (pendingAction) {
    return (
      <ConfirmDialog
        title={`${pendingAction.label}?`}
        message={
          pendingAction.confirmMessage ??
          'Are you sure you want to change this case?'
        }
        confirmLabel={pendingAction.confirmLabel ?? 'Confirm'}
        confirmVariant={pendingAction.confirmVariant ?? 'primary'}
        onConfirm={() => {
          const action = pendingAction;
          setPendingAction(null);
          void submitAction(action);
        }}
        onCancel={() => {
          setPendingAction(null);
          window.setTimeout(() => triggerRef.current?.focus(), 0);
        }}
      />
    );
  }

  return (
    <fieldset className="border-rule/80 bg-surface/70 rounded-[var(--radius-control)] border p-2.5">
      <legend className="sr-only">Change procedure status</legend>
      {error ? (
        <div
          role="alert"
          className="border-danger-border bg-danger-soft text-danger mb-2 rounded-[var(--radius-control)] border p-2 text-[10.5px] font-medium"
        >
          {error}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.targetStatus}
            type="button"
            variant={action.variant}
            size="sm"
            isLoading={isSubmitting}
            aria-label={statusActionAriaLabel(action, scheduleLabel)}
            onClick={(event) => activateAction(action, event.currentTarget)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
