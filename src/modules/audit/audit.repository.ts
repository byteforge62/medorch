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