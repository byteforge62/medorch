"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { ScheduleStatus } from "./ScheduleStatusBadge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScheduleStatusUpdateResult = {
  id: string;
  status: ScheduleStatus;
  procedure?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  updatedAt?: string;
};

interface StatusAction {
  /** Target status when this action is clicked */
  targetStatus: ScheduleStatus;
  /** Button label */
  label: string;
  /** Button variant */
  variant: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** If true, show a confirmation dialog before proceeding */
  requiresConfirmation?: boolean;
  /** Custom confirmation message. Falls back to a default. */
  confirmMessage?: string;
}

interface ScheduleStatusActionsProps {
  scheduleId: string;
  currentStatus: ScheduleStatus;
  /** Called after a successful status update with the new status */
  onStatusUpdated: (scheduleId: string, newStatus: ScheduleStatus) => void;
}

// ---------------------------------------------------------------------------
// UX hints: which actions are relevant for a given current status.
// NOTE: the backend is the authoritative source for allowed transitions.
//       These mappings are for UI clarity only — the backend will reject
//       any invalid transition regardless.
// ---------------------------------------------------------------------------
const STATUS_ACTIONS: Record<ScheduleStatus, StatusAction[]> = {
  SCHEDULED: [
    {
      targetStatus: "CONFIRMED",
      label: "Confirm",
      variant: "primary",
    },
    {
      targetStatus: "CANCELLED",
      label: "Cancel",
      variant: "danger",
      requiresConfirmation: true,
      confirmMessage:
        "Are you sure you want to cancel this scheduled procedure? This action cannot be undone.",
    },
  ],
  CONFIRMED: [
    {
      targetStatus: "IN_PROGRESS",
      label: "Start Procedure",
      variant: "primary",
    },
    {
      targetStatus: "DELAYED",
      label: "Mark Delayed",
      variant: "secondary",
      requiresConfirmation: true,
      confirmMessage:
        "Mark this procedure as delayed? You can resume it later.",
    },
    {
      targetStatus: "CANCELLED",
      label: "Cancel",
      variant: "danger",
      requiresConfirmation: true,
      confirmMessage:
        "Are you sure you want to cancel this confirmed procedure? This action cannot be undone.",
    },
  ],
  IN_PROGRESS: [
    {
      targetStatus: "COMPLETED",
      label: "Mark Complete",
      variant: "primary",
      requiresConfirmation: true,
      confirmMessage:
        "Mark this procedure as completed? This will finalise the schedule.",
    },
    {
      targetStatus: "DELAYED",
      label: "Mark Delayed",
      variant: "secondary",
      requiresConfirmation: true,
      confirmMessage: "Mark this in-progress procedure as delayed?",
    },
  ],
  DELAYED: [
    {
      targetStatus: "CONFIRMED",
      label: "Re-confirm",
      variant: "primary",
    },
    {
      targetStatus: "IN_PROGRESS",
      label: "Resume",
      variant: "primary",
    },
    {
      targetStatus: "CANCELLED",
      label: "Cancel",
      variant: "danger",
      requiresConfirmation: true,
      confirmMessage:
        "Are you sure you want to cancel this delayed procedure? This action cannot be undone.",
    },
  ],
  // Terminal states — no further actions
  COMPLETED: [],
  CANCELLED: [],
};

const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid status transition request.",
  401: "You are not authorised to perform this action.",
  403: "You do not have permission to change this schedule's status.",
  404: "Schedule not found. It may have been deleted.",
  409: "This status transition is not allowed for the current schedule state.",
  500: "A server error occurred. Please try again.",
};

// ---------------------------------------------------------------------------
// Confirmation dialog (accessible, keyboard-navigable)
// ---------------------------------------------------------------------------

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the confirm button when the dialog opens
  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, []);

  // Trap focus within dialog and close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Icon */}
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <svg
            className="h-5 w-5 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h3
          id="confirm-dialog-title"
          className="mt-3 text-center text-base font-bold text-slate-900 dark:text-white"
        >
          Confirm Action
        </h3>

        <p
          id="confirm-dialog-message"
          className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400"
        >
          {message}
        </p>

        <div className="mt-5 flex items-center justify-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Go Back
          </Button>
          <Button
            ref={confirmButtonRef}
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
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ScheduleStatusActions({
  scheduleId,
  currentStatus,
  onStatusUpdated,
}: ScheduleStatusActionsProps) {
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actions = STATUS_ACTIONS[currentStatus] ?? [];

  // Nothing to show for terminal states
  if (actions.length === 0) {
    return null;
  }

  const executeTransition = async (action: StatusAction) => {
    setError(null);
    setIsSubmitting(true);
    setPendingAction(null);

    try {
      await apiClient.patch<ScheduleStatusUpdateResult>(
        `/api/schedules/${scheduleId}/status`,
        { status: action.targetStatus },
      );
      onStatusUpdated(scheduleId, action.targetStatus);
    } catch (err) {
      if (err instanceof ApiClientError) {
        const mapped = ERROR_MESSAGES[err.status];
        setError(mapped ?? err.message ?? "An unexpected error occurred.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (action: StatusAction) => {
    setError(null);
    if (action.requiresConfirmation) {
      setPendingAction(action);
    } else {
      executeTransition(action);
    }
  };

  return (
    <>
      {/* Confirmation dialog */}
      {pendingAction && (
        <ConfirmDialog
          message={
            pendingAction.confirmMessage ??
            `Are you sure you want to change the status to "${pendingAction.label}"?`
          }
          onConfirm={() => executeTransition(pendingAction)}
          onCancel={() => setPendingAction(null)}
        />
      )}

      <div className="space-y-2">
        {/* Inline error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
          >
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.targetStatus}
              type="button"
              variant={action.variant}
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              aria-label={`${action.label} schedule`}
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
