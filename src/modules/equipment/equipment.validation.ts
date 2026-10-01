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


export const updateEquipmentSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),

  category: z.string().trim().min(1).max(100).optional(),

  serialNumber: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional(),

  departmentId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  maintenanceDueAt: z
    .coerce
    .date()
    .nullable()
    .optional(),
});

export const updateEquipmentStatusSchema = z.object({
  status: z.enum([
    "AVAILABLE",
    "IN_USE",
    "MAINTENANCE",
    "RETIRED",
  ]),
});