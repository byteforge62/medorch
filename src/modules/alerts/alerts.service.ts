import {
  findAlerts,
  findAlertById,
  createAlert as createAlertRecord,
  updateAlert as updateAlertRecord,
  markAlertAsRead as markAlertAsReadRecord,
  markAllAlertsAsReadForUser,
  deleteAlert as deleteAlertRecord,
  type FindAlertsFilter,
} from "./alerts.repository";
import type { AlertType, AlertSeverity, UserRole } from "@/generated/prisma/client";
import { findUserById } from "@/modules/users/user.repository";
import { findScheduleById } from "@/modules/schedules/schedule.repository";

export async function getAlerts(
  filter: FindAlertsFilter,
  requestingUser: { id: string; role: UserRole },
) {
  const effectiveFilter = { ...filter };
  if (requestingUser.role !== "ADMIN") {
    effectiveFilter.userId = requestingUser.id;
  }

  return findAlerts(effectiveFilter);
}

export async function getAlertById(
  id: string,
  requestingUser: { id: string; role: UserRole },
) {
  const alert = await findAlertById(id);

  if (!alert) {
    throw new Error("ALERT_NOT_FOUND");
  }

  if (
    requestingUser.role !== "ADMIN" &&
    alert.userId !== requestingUser.id
  ) {
    throw new Error("FORBIDDEN_ALERT_ACCESS");
  }

  return alert;
}

export async function createAlert(
  data: {
    userId: string;
    scheduleId?: string | null;
    type: AlertType;
    title: string;
    message: string;
    severity?: AlertSeverity;
  },
  actorUserId: string,
) {
  const targetUser = await findUserById(data.userId);
  if (!targetUser) {
    throw new Error("USER_NOT_FOUND");
  }

  if (data.scheduleId) {
    const schedule = await findScheduleById(data.scheduleId);
    if (!schedule) {
      throw new Error("SCHEDULE_NOT_FOUND");
    }
  }

  return createAlertRecord(
    data,
    actorUserId,
    targetUser.name || targetUser.email,
  );
}

export async function updateAlertById(
  id: string,
  data: {
    title?: string;
    message?: string;
    severity?: AlertSeverity;
    isRead?: boolean;
  },
  requestingUser: { id: string; role: UserRole },
) {
  const alert = await findAlertById(id);

  if (!alert) {
    throw new Error("ALERT_NOT_FOUND");
  }

  if (
    requestingUser.role !== "ADMIN" &&
    alert.userId !== requestingUser.id
  ) {
    throw new Error("FORBIDDEN_ALERT_ACCESS");
  }

  const updateData = { ...data };

  if (data.isRead !== undefined) {
    Object.assign(updateData, {
      readAt: data.isRead ? new Date() : null,
    });
  }

  const updatedAlert = await updateAlertRecord(
    id,
    updateData,
    requestingUser.role === "ADMIN" ? undefined : requestingUser.id,
    requestingUser.id,
  );

  if (!updatedAlert) {
    throw new Error("ALERT_NOT_FOUND");
  }

  return updatedAlert;
}

export async function markAlertAsReadById(
  id: string,
  requestingUser: { id: string; role: UserRole },
) {
  const alert = await findAlertById(id);

  if (!alert) {
    throw new Error("ALERT_NOT_FOUND");
  }

  if (
    requestingUser.role !== "ADMIN" &&
    alert.userId !== requestingUser.id
  ) {
    throw new Error("FORBIDDEN_ALERT_ACCESS");
  }

  if (alert.isRead) {
    return alert;
  }

  const updatedAlert = await markAlertAsReadRecord(
    id,
    requestingUser.id,
    requestingUser.role === "ADMIN" ? undefined : requestingUser.id,
  );

  if (!updatedAlert) {
    throw new Error("ALERT_NOT_FOUND");
  }
  return updatedAlert;
}

export async function markAllAlertsAsRead(
  targetUserId: string,
  requestingUser: { id: string; role: UserRole },
) {
  if (
    requestingUser.role !== "ADMIN" &&
    targetUserId !== requestingUser.id
  ) {
    throw new Error("FORBIDDEN_ALERT_ACCESS");
  }

  return markAllAlertsAsReadForUser(targetUserId, requestingUser.id);
}

export async function deleteAlertById(
  id: string,
  requestingUser: { id: string; role: UserRole },
) {
  const alert = await findAlertById(id);

  if (!alert) {
    throw new Error("ALERT_NOT_FOUND");
  }

  if (requestingUser.role !== "ADMIN" && alert.userId !== requestingUser.id) {
    throw new Error("FORBIDDEN_ALERT_ACCESS");
  }

  const deletedAlert = await deleteAlertRecord(
    id,
    requestingUser.id,
    requestingUser.role === "ADMIN" ? undefined : requestingUser.id,
  );

  if (!deletedAlert) {
    throw new Error("ALERT_NOT_FOUND");
  }

  return { success: true };
}
