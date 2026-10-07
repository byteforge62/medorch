import { prisma } from "@/lib/db/prisma";
import type { AuditAction, Prisma } from "@/generated/prisma/client";

type CreateAuditLogData = {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(
  data: CreateAuditLogData,
) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      description: data.description,
      metadata: data.metadata,
    },
  });
}

export interface FindAuditLogsOptions {
  userId?: string;
  action?: AuditAction;
  entity?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}

export async function findAuditLogs(
  options: FindAuditLogsOptions = {},
) {
  const {
    userId,
    action,
    entity,
    entityId,
    limit = 50,
    offset = 0,
  } = options;

  return prisma.auditLog.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
      ...(entityId ? { entityId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
    take: Math.min(limit, 100),
    select: {
      id: true,
      userId: true,
      action: true,
      entity: true,
      entityId: true,
      description: true,
      metadata: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}