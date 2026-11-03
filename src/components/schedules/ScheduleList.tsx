"use client";

import React from "react";
import { ScheduleCard, ScheduleItem } from "./ScheduleCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScheduleStatus } from "./ScheduleStatusBadge";

interface ScheduleListProps {
  schedules: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  canManageSchedules?: boolean;
  onEdit?: (schedule: ScheduleItem) => void;
  onStatusUpdated?: (scheduleId: string, newStatus: ScheduleStatus) => void;
}

/**
 * ScheduleList — the board itself: a ruled table-like list with a printed
 * column header so the eye can track date, assignment and status vertically.
 * Rows are separated by hairlines instead of stacked as individual cards.
 */
export function ScheduleList({
  schedules,
  isLoading,
  error,
  onRetry,
  canManageSchedules = false,
  onEdit,
  onStatusUpdated,
}: ScheduleListProps) {
  if (isLoading) {
    return <LoadingState message="Loading surgical schedules..." />;
  }

  if (error) {
    return (
      <ErrorState title="Failed to load schedules" message={error} onRetry={onRetry} />
    );
  }

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="No schedules found"
        description="There are no surgical schedules matching your current filter criteria."
      />
    );
  }

  return (
    <section aria-label="Schedule board" className="border border-border">
      <div
        aria-hidden="true"
        className="border-border hidden bg-surface-subtle border-b px-5 py-2 lg:flex lg:items-center lg:gap-6"
      >
        <span className="eyebrow w-44 shrink-0">Date / time</span>
        <span className="eyebrow flex-1">Procedure &amp; assignment</span>
        <span className="eyebrow shrink-0">Actions</span>
      </div>

      <ul className="bg-border divide-y divide-border">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            canManageSchedules={canManageSchedules}
            onEdit={onEdit}
            onStatusUpdated={onStatusUpdated}
          />
        ))}
      </ul>
    </section>
  );
}
