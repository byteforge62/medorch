import { prisma } from "@/lib/db/prisma";
import type { AlertType, AlertSeverity } from "@/generated/prisma/client";

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

export async function createAlert(data: {
  userId: string;
  scheduleId?: string | null;
  type: AlertType;
  title: string;
  message: string;
  severity?: AlertSeverity;
}) {
  return prisma.alert.create({
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
) {
  return prisma.alert.update({
    where: { id },
    data,
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

export async function markAlertAsRead(id: string) {
  return prisma.alert.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
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
    },
  });
}

export async function markAllAlertsAsReadForUser(userId: string) {
  return prisma.alert.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function deleteAlert(id: string) {
  return prisma.alert.delete({
    where: { id },
  });
}
