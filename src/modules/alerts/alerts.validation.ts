import { z } from "zod";

export const alertIdSchema = z.object({
  id: z.string().uuid(),
});

export const getAlertsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  isRead: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  severity: z
    .enum(["INFO", "WARNING", "CRITICAL"])
    .optional(),
  type: z
    .enum(["SCHEDULE", "RESOURCE", "SYSTEM", "MAINTENANCE"])
    .optional(),
});

export const createAlertSchema = z.object({
  userId: z.string().uuid(),
  scheduleId: z.string().uuid().nullable().optional(),
  type: z.enum(["SCHEDULE", "RESOURCE", "SYSTEM", "MAINTENANCE"]),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(1000),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]).optional().default("INFO"),
});

export const updateAlertSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().min(1).max(1000).optional(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]).optional(),
  isRead: z.boolean().optional(),
});
