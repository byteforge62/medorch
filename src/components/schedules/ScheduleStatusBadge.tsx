"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { SCHEDULE_STATUS } from "@/lib/operational-status";

export type ScheduleStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED";

export type SchedulePriority = "ELECTIVE" | "URGENT" | "EMERGENCY";

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
  className?: string;
}

/*
 * One variant per state, matching the shared operational contract:
 * a cancelled case is withdrawn (neutral), a delayed case is a broken
 * commitment (danger), and an in-progress case is expected work (warning).
 */
const STATUS_VARIANT: Record<
  ScheduleStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  SCHEDULED: "neutral",
  CONFIRMED: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
  DELAYED: "danger",
};

export function ScheduleStatusBadge({
  status,
  className = "",
}: ScheduleStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "neutral"} className={className}>
      {SCHEDULE_STATUS[status]?.label ?? "Scheduled"}
    </Badge>
  );
}

interface SchedulePriorityBadgeProps {
  priority: SchedulePriority;
  className?: string;
}

export function SchedulePriorityBadge({
  priority,
  className = "",
}: SchedulePriorityBadgeProps) {
  switch (priority) {
    case "EMERGENCY":
      return (
        <Badge variant="danger" className={className}>
          Emergency
        </Badge>
      );
    case "URGENT":
      return (
        <Badge variant="warning" className={className}>
          Urgent
        </Badge>
      );
    case "ELECTIVE":
    default:
      return (
        <Badge variant="neutral" className={className}>
          Elective
        </Badge>
      );
  }
}
