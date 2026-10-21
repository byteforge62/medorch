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
    return <ErrorState title="Failed to load schedules" message={error} onRetry={onRetry} />;
  }

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="No Schedules Found"
        description="There are no surgical schedules matching your current filter criteria."
      />
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          canManageSchedules={canManageSchedules}
          onEdit={onEdit}
          onStatusUpdated={onStatusUpdated}
        />
      ))}
    </div>
  );
}
