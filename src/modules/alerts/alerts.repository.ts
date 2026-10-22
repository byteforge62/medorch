import { prisma } from "@/lib/db/prisma";
import type { AlertType, AlertSeverity } from "@/generated/prisma/client";
import { createAuditLog } from "@/modules/audit/audit.repository";

export type FindAlertsFilter = {
  userId?: string;
  isRead?: boolean;
  severity?: AlertSeverity;
  type?: AlertType;
};

export async function findAlerts(filter: FindAlertsFilter) {
  const where: {
    userId?: string;
    isRead?: boolean;
    severity?: AlertSeverity;
    type?: AlertType;
  } = {};

  if (filter.userId) where.userId = filter.userId;
  if (filter.isRead !== undefined) where.isRead = filter.isRead;
  if (filter.severity) where.severity = filter.severity;
  if (filter.type) where.type = filter.type;

  return prisma.alert.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      userId: true,
      scheduleId: true,
      type: true,
      title: true,
      message: true,
      severity: true,
      isRead: true,
      readAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      schedule: {
        select: {
          id: true,
          procedure: true,
          scheduledDate: true,
          status: true,
        },
      },
    },
  });
}

export async function findAlertById(id: string) {
  return prisma.alert.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      scheduleId: true,
      type: true,
      title: true,
      message: true,
      severity: true,
      isRead: true,
      readAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      schedule: {
        select: {
          id: true,
          procedure: true,
          scheduledDate: true,
          status: true,
        },
      },
    },
  });
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
  recipientLabel: string,
) {
  return prisma.$transaction(async (tx) => {
    const alert = await tx.alert.create({
      data: {
        userId: data.userId,
        scheduleId: data.scheduleId,
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity,
      },
      select: {
        id: true,
        userId: true,
        scheduleId: true,
        type: true,
        title: true,
        message: true,
        severity: true,
        isRead: true,
        readAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        schedule: {
          select: {
            id: true,
            procedure: true,
            scheduledDate: true,
            status: true,
          },
        },
      },
    });

    await createAuditLog(
      {
        userId: actorUserId,
        action: "CREATE",
        entity: "Alert",
        entityId: alert.id,
        description: `Alert "${alert.title}" was created for user ${recipientLabel}.`,
        metadata: {
          alertId: alert.id,
          recipientUserId: data.userId,
          severity: alert.severity,
          type: alert.type,
        },
      },
      tx,
    );

    return alert;
  });
}

export async function updateAlert(
  id: string,
  data: {
    title?: string;
    message?: string;
    severity?: AlertSeverity;
    isRead?: boolean;
    readAt?: Date | null;
  },
  userId?: string,
  actorUserId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.alert.updateMany({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    const { readAt, ...changes } = data;
    const alert = await tx.alert.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        userId: true,
        scheduleId: true,
        type: true,
        title: true,
        message: true,
        severity: true,
        isRead: true,
        readAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        schedule: {
          select: {
            id: true,
            procedure: true,
            scheduledDate: true,
            status: true,
          },
        },
      },
    });

    await createAuditLog(
      {
        userId: actorUserId,
        action: "UPDATE",
        entity: "Alert",
        entityId: id,
        description: `Alert "${alert.title}" was updated.`,
        metadata: {
          alertId: id,
          changes: {
            ...changes,
            ...(readAt !== undefined
              ? { readAt: readAt?.toISOString() ?? null }
              : {}),
          },
        },
      },
      tx,
    );

    return alert;
  });
}

export async function markAlertAsRead(
  id: string,
  actorUserId: string,
  userId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.alert.updateMany({
      where: {
        id,
        isRead: false,
        ...(userId ? { userId } : {}),
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count === 1) {
      const alert = await tx.alert.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          userId: true,
          scheduleId: true,
          type: true,
          title: true,
          message: true,
          severity: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      });

      await createAuditLog(
        {
          userId: actorUserId,
          action: "UPDATE",
          entity: "Alert",
          entityId: id,
          description: `Alert "${alert.title}" was marked as read.`,
          metadata: {
            alertId: id,
            read: true,
          },
        },
        tx,
      );

      return alert;
    }

    return tx.alert.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
      select: {
        id: true,
        userId: true,
        scheduleId: true,
        type: true,
        title: true,
        message: true,
        severity: true,
        isRead: true,
        readAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        schedule: {
          select: {
            id: true,
            procedure: true,
            scheduledDate: true,
            status: true,
          },
        },
      },
    });
  });
}

export async function markAllAlertsAsReadForUser(
  userId: string,
  actorUserId: string,
) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.alert.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count > 0) {
      await createAuditLog(
        {
          userId: actorUserId,
          action: "UPDATE",
          entity: "Alert",
          entityId: userId,
          description: `${result.count} alert(s) were marked as read.`,
          metadata: {
            targetUserId: userId,
            affectedCount: result.count,
            operation: "MARK_ALL_READ",
          },
        },
        tx,
      );
    }

    return result;
  });
}

export async function deleteAlert(
  id: string,
  actorUserId: string,
  userId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const alert = await tx.alert.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });

    if (!alert) {
      return null;
    }

    const result = await tx.alert.deleteMany({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });

    if (result.count !== 1) {
      return null;
    }

    await createAuditLog(
      {
        userId: actorUserId,
        action: "DELETE",
        entity: "Alert",
        entityId: id,
        description: `Alert "${alert.title}" was deleted.`,
      },
      tx,
    );

    return alert;
  });
}
