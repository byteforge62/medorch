import { z } from "zod";

export const otRoomIdSchema = z.object({
  id: z.string().uuid(),
});

export const createOTRoomSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().min(1).max(50),
  departmentId: z.string().uuid(),
  capacity: z.number().int().positive().optional()
});

export const updateOTRoomSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  departmentId: z.string().uuid().optional(),
  capacity: z.number().int().positive().nullable().optional()
});

export const updateOTRoomStatusSchema = z.object({
  status: z.enum([
    "AVAILABLE",
    "OCCUPIED",
    "MAINTENANCE",
    "DISABLED",
  ]),
});

export const updateOTRoomActiveSchema = z.object({
  isActive: z.boolean(),
});