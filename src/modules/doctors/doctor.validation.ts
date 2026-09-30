import { z } from "zod";

export const doctorIdSchema = z.object({
  id: z.string().uuid(),
});