import { z } from "zod";

export const otRoomIdSchema = z.object({
  id: z.string().uuid(),
});