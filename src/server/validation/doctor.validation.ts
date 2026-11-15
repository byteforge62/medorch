import { z } from "zod";

export const doctorIdSchema = z.object({
  id: z.string().uuid(),
});

export const createDoctorSchema = z.object({
  userId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  specialization: z.string().trim().max(150).optional(),
  licenseNumber: z.string().trim().max(100).optional(),
});

export const updateDoctorSchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  specialization: z.string().trim().max(150).nullable().optional(),
  licenseNumber: z.string().trim().max(100).nullable().optional()
});

export const updateDoctorStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACTIVE",
    "SUSPENDED",
    "REJECTED",
  ]),
});