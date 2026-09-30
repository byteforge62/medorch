import { z } from "zod";

export const departmentIdSchema = z.object({
  id: z.string().uuid(),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters.").max(100, "Department name must not exceed 100 characters."),
  description: z.string().trim().max(500, "Description must not exceed 500 characters.").optional(),
  headDoctorId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters.").max(100, "Department name must not exceed 100 characters.").optional(),
  description: z.string().trim().max(500, "Description must not exceed 500 characters.").nullable().optional(),
  headDoctorId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});