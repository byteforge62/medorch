import z from "zod";

export const userIdSchema = z.object({
    id: z.string().uuid(),
})

export const createUserSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    phone: z.string().trim().min(7).max(20).optional(),
    role: z.enum(["ADMIN","DOCTOR","OT_STAFF","PATIENT"]),
    status: z.enum(["PENDING","ACTIVE","SUSPENDED","REJECTED"]).optional()
})

export const patientRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(12, "Password must contain at least 12 characters.")
    .max(128),
  phone: z.string().trim().min(7).max(20).optional(),
});

export type PatientRegistrationInput = z.infer<
  typeof patientRegistrationSchema
>;