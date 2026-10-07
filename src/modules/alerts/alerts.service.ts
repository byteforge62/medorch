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
import { recordAudit } from "@/modules/audit/audit.service";
import { findUserById } from "@/modules/users/user.repository";
import { findScheduleById } from "@/modules/schedules/schedule.repository";

export async function getAlerts(
  filter: FindAlertsFilter,
  requestingUser: { id: string; role: UserRole },
) {
  // Non-ADMIN users can only see their own alerts
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

  if (requestingUser.role !== "ADMIN" && alert.userId !== requestingUser.id) {
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

  const alert = await createAlertRecord(data);

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "Alert",
    entityId: alert.id,
    description: `Alert "${alert.title}" was created for user ${targetUser.name || targetUser.email}.`,
    metadata: {
      alertId: alert.id,
      recipientUserId: data.userId,
      severity: alert.severity,
      type: alert.type,
    },
  });

  return alert;
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

  const updateData: {
    title?: string;
    message?: string;
    severity?: AlertSeverity;
    isRead?: boolean;
    readAt?: Date | null;
  } = { ...data };

  if (data.isRead !== undefined) {
    if (data.isRead && !alert.isRead) {
      updateData.readAt = new Date();
    } else if (!data.isRead) {
      updateData.readAt = null;
    }
  }

  const updatedAlert = await updateAlertRecord(id, updateData);

  await recordAudit({
    userId: requestingUser.id,
    action: "UPDATE",
    entity: "Alert",
    entityId: updatedAlert.id,
    description: `Alert "${updatedAlert.title}" was updated.`,
    metadata: {
      alertId: updatedAlert.id,
      changes: data,
    },
  });

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

  const updatedAlert = await markAlertAsReadRecord(id);

  await recordAudit({
    userId: requestingUser.id,
    action: "UPDATE",
    entity: "Alert",
    entityId: updatedAlert.id,
    description: `Alert "${updatedAlert.title}" was marked as read.`,
    metadata: {
      alertId: updatedAlert.id,
      read: true,
    },
  });

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

  const result = await markAllAlertsAsReadForUser(targetUserId);

  if (result.count > 0) {
    await recordAudit({
      userId: requestingUser.id,
      action: "UPDATE",
      entity: "Alert",
      entityId: targetUserId,
      description: `${result.count} alert(s) were marked as read.`,
      metadata: {
        targetUserId,
        affectedCount: result.count,
        operation: "MARK_ALL_READ",
      },
    });
  }

  return result;
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

  await deleteAlertRecord(id);

  await recordAudit({
    userId: requestingUser.id,
    action: "DELETE",
    entity: "Alert",
    entityId: id,
    description: `Alert "${alert.title}" was deleted.`,
  });

  return { success: true };
}
