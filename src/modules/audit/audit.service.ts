import type { AuditAction, Prisma } from "@/generated/prisma/client";
import { createAuditLog, findAuditLogs } from "./audit.repository";
import type { FindAuditLogsOptions } from "./audit.repository";

type RecordAuditData = {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAudit(
  data: RecordAuditData,
) {
  return createAuditLog(data);
}

export async function getAuditLogs(
  options: FindAuditLogsOptions = {},
) {
  return findAuditLogs(options);
}