"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";

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

export function ScheduleStatusBadge({
  status,
  className = "",
}: ScheduleStatusBadgeProps) {
  switch (status) {
    case "IN_PROGRESS":
      return (
        <Badge variant="warning" className={className}>
          In Progress
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="info" className={className}>
          Confirmed
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="success" className={className}>
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="danger" className={className}>
          Cancelled
        </Badge>
      );
    case "DELAYED":
      return (
        <Badge variant="warning" className={className}>
          Delayed
        </Badge>
      );
    case "SCHEDULED":
    default:
      return (
        <Badge variant="neutral" className={className}>
          Scheduled
        </Badge>
      );
  }
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
