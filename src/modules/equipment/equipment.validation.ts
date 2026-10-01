import { z } from "zod";

export const equipmentIdSchema = z.object({
  id: z.string().uuid(),
});

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(1).max(150),

  category: z.string().trim().min(1).max(100),

  serialNumber: z
    .string()
    .trim()
    .max(100)
    .optional(),

  departmentId: z
    .string()
    .uuid()
    .optional(),

  maintenanceDueAt: z
    .coerce
    .date()
    .optional(),
});