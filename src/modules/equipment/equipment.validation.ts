import { z } from "zod";

export const equipmentIdSchema = z.object({
  id: z.string().uuid(),
});