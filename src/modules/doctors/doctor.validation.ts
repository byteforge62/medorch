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