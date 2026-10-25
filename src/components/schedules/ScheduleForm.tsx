"use client";

import React, { useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { ScheduleItem } from "./ScheduleCard";
import { SchedulePriority } from "./ScheduleStatusBadge";

export interface PatientOption {
  id: string;
  name: string;
  patientCode: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface OTRoomOption {
  id: string;
  name: string;
  code?: string;
  departmentId: string;
  status?: string;
  isActive?: boolean;
}

export interface DoctorOption {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

interface ScheduleFormProps {
  initialSchedule?: ScheduleItem | null;
  patients: PatientOption[];
  departments: DepartmentOption[];
  otRooms: OTRoomOption[];
  doctors: DoctorOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleForm({
  initialSchedule,
  patients,
  departments,
  otRooms,
  doctors,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleFormProps) {
  const isEditing = Boolean(initialSchedule?.id);

  const [patientId, setPatientId] = useState(() => initialSchedule?.patientId || "");
  const [departmentId, setDepartmentId] = useState(() => initialSchedule?.departmentId || "");
  const [otRoomId, setOtRoomId] = useState(() => initialSchedule?.otRoomId || "");
  const [surgeonId, setSurgeonId] = useState(() => initialSchedule?.surgeonId || "");
  const [procedure, setProcedure] = useState(() => initialSchedule?.procedure || "");
  const [priority, setPriority] = useState<SchedulePriority>(() => initialSchedule?.priority || "ELECTIVE");
  const [clinicalNotes, setClinicalNotes] = useState(() => initialSchedule?.clinicalNotes || "");

  const [scheduledDate, setScheduledDate] = useState(() => {
    if (!initialSchedule?.scheduledDate) {
      return new Date().toISOString().split("T")[0];
    }
    try {
      return new Date(initialSchedule.scheduledDate).toISOString().split("T")[0];
    } catch {
      return "";
    }
  });

  const [startTime, setStartTime] = useState(() => {
    if (!initialSchedule?.startTime) {
      return "09:00";
    }
    try {
      return new Date(initialSchedule.startTime).toTimeString().split(" ")[0].substring(0, 5);
    } catch {
      return "";
    }
  });

  const [endTime, setEndTime] = useState(() => {
    if (!initialSchedule?.endTime) {
      return "10:00";
    }
    try {
      return new Date(initialSchedule.endTime).toTimeString().split(" ")[0].substring(0, 5);
    } catch {
      return "";
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter OT rooms by department if selected
  const availableOtRooms = departmentId
    ? otRooms.filter((room) => room.departmentId === departmentId)
    : otRooms;

  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    if (newDeptId && otRoomId) {
      const room = otRooms.find((r) => r.id === otRoomId);
      if (room && room.departmentId !== newDeptId) {
        setOtRoomId("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError("Please select a patient.");
      return;
    }
    if (!departmentId) {
      setError("Please select a department.");
      return;
    }
    if (!otRoomId) {
      setError("Please select an OT room.");
      return;
    }
    if (!surgeonId) {
      setError("Please select a surgeon.");
      return;
    }
    if (!procedure.trim()) {
      setError("Please enter procedure name.");
      return;
    }
    if (!scheduledDate || !startTime || !endTime) {
      setError("Please specify scheduled date, start time, and end time.");
      return;
    }

    const startDateTime = new Date(`${scheduledDate}T${startTime}:00`);
    const endDateTime = new Date(`${scheduledDate}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        patientId,
        departmentId,
        otRoomId,
        surgeonId,
        procedure: procedure.trim(),
        // The API validates scheduledDate as a plain ISO calendar date
        // (YYYY-MM-DD), so send the raw date string rather than a full
        // datetime. This also avoids a timezone shift moving the date.
        scheduledDate,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        priority,
        clinicalNotes: clinicalNotes.trim() ? clinicalNotes.trim() : undefined,
      };

      if (isEditing && initialSchedule) {
        await apiClient.patch(`/api/schedules/${initialSchedule.id}`, payload);
      } else {
        await apiClient.post("/api/schedules", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save schedule:", err);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while saving the schedule.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border-strong bg-surface p-6 shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Surgery Schedule" : "Create Surgery Schedule"}
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              {isEditing
                ? "Update surgical procedure details and assignments."
                : "Schedule a new surgical operation in an available OT room."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border-strong text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-danger-soft border border-danger-border p-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Procedure Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Procedure Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Laparoscopic Cholecystectomy"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Patient Select */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Patient *
              </label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.patientCode ? `(${p.patientCode})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Surgeon Select */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Surgeon / Doctor *
              </label>            <select required value={surgeonId} onChange={(e) => setSurgeonId(e.target.value)} className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <option value="">Select Surgeon</option>
                {doctors.map((doc) => {
                  const targetUserId = doc.user?.id || doc.userId;
                  return (
                    <option key={doc.id} value={targetUserId}>
                      {doc.user?.name || "Doctor"}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Department Select */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Department *
              </label>            <select required value={departmentId} onChange={(e) => handleDepartmentChange(e.target.value)} className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* OT Room Select */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                OT Room *
              </label>            <select required value={otRoomId} onChange={(e) => setOtRoomId(e.target.value)} className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <option value="">Select OT Room</option>
                {availableOtRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.code ? `[${r.code}]` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Scheduled Date */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as SchedulePriority)}
              className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="ELECTIVE">Elective</option>
              <option value="URGENT">Urgent</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Clinical Notes
            </label>
            <textarea
              rows={3}
              placeholder="Additional medical instructions, precautions, or procedure notes..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="block min-h-10 w-full min-w-0 rounded-lg border border-border-strong bg-surface text-foreground px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? "Save Changes" : "Create Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
