import { z } from "zod";

export const patientIdSchema = z.object({
  id: z.string().uuid(),
});