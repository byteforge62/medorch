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