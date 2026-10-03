"use client";

import React from "react";
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
  /** Called after a successful status change so the parent list can update */
  onStatusUpdated?: (scheduleId: string, newStatus: ScheduleStatus) => void;
}

export function ScheduleCard({
  schedule,
  isAdmin = false,
  onEdit,
  onStatusUpdated,
}: ScheduleCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="hover:border-slate-300 transition-all dark:hover:border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3 flex-1">
          {/* Header row: Procedure + Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {schedule.procedure}
            </h3>
            <ScheduleStatusBadge status={schedule.status} />
            <SchedulePriorityBadge priority={schedule.priority} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
            {/* Patient */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Patient:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {schedule.patient?.name || "N/A"}
              </span>
              {schedule.patient?.patientCode && (
                <span className="text-slate-400 text-[11px]">
                  ({schedule.patient.patientCode})
                </span>
              )}
            </div>

            {/* Surgeon */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Surgeon:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {schedule.surgeon?.name || "Unassigned"}
              </span>
            </div>

            {/* Department */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Department:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {schedule.department?.name || "N/A"}
              </span>
            </div>

            {/* OT Room */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-400 dark:text-slate-500">OT Room:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {schedule.otRoom?.name || "N/A"}
              </span>
              {schedule.otRoom?.code && (
                <span className="text-slate-400 text-[11px]">
                  [{schedule.otRoom.code}]
                </span>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Date:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {formatDate(schedule.scheduledDate)}
              </span>
            </div>

            {/* Timing */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Time:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
              </span>
            </div>
          </div>

          {/* Clinical notes if present */}
          {schedule.clinicalNotes && (
            <div className="rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
                Notes:
              </span>
              <span className="text-slate-700 dark:text-slate-300">
                {schedule.clinicalNotes}
              </span>
            </div>
          )}

          {/* Status lifecycle actions — only for ADMIN users */}
          {isAdmin && onStatusUpdated && (
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Status Actions
              </p>
              <ScheduleStatusActions
                scheduleId={schedule.id}
                currentStatus={schedule.status}
                onStatusUpdated={onStatusUpdated}
              />
            </div>
          )}
        </div>

        {/* Edit action — only for ADMIN users */}
        {isAdmin && onEdit && (
          <div className="pt-2 sm:pt-0 sm:pl-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(schedule)}
              aria-label={`Edit schedule for ${schedule.procedure}`}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
