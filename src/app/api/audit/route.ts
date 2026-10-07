import { z } from "zod";
import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getAuditLogs } from "@/modules/audit/audit.service";
import type { AuditAction } from "@/generated/prisma/client";

const auditQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z
    .enum([
      "CREATE",
      "UPDATE",
      "DELETE",
      "LOGIN",
      "LOGOUT",
      "APPROVE",
      "REJECT",
      "CANCEL",
      "COMPLETE",
    ])
    .optional(),
  entity: z.string().trim().min(1).max(100).optional(),
  entityId: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  const { response } = await authorizeApiRole(
    ["ADMIN"],
    requestId,
  );

  if (response) {
    return response;
  }

  const url = new URL(request.url);

  const parsed = auditQuerySchema.safeParse({
    userId: url.searchParams.get("userId") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
    entity: url.searchParams.get("entity") ?? undefined,
    entityId: url.searchParams.get("entityId") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return apiError(
      "Invalid audit query parameters.",
      400,
      parsed.error.flatten(),
      requestId,
    );
  }

  try {
    const auditLogs = await getAuditLogs({
      ...parsed.data,
      action: parsed.data.action as AuditAction | undefined,
    });

    return apiSuccess(auditLogs, 200);
  } catch (error) {
    console.error(
      `[${requestId}] Failed to fetch audit logs:`,
      error,
    );

    return apiError(
      "Failed to fetch audit logs.",
      500,
      undefined,
      requestId,
    );
  }
}