import { z } from "zod";

export const patientIdSchema = z.object({
  id: z.string().uuid(),
});

export const createPatientSchema = z.object({
  patientCode: z.string().trim().min(1).max(50),
  userId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(150),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().trim().max(30).optional(),
  medicalHistory: z.string().trim().optional()
})

export const updatePatientSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  gender: z.string().trim().max(30).nullable().optional(),
  medicalHistory: z.string().trim().nullable().optional(),
});