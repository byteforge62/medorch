import { z } from "zod";

export const scheduleIdSchema = z.object({
  id: z.string().uuid(),
});

export const createScheduleSchema = z
  .object({
    patientId: z.string().uuid(),

    departmentId: z.string().uuid(),

    otRoomId: z.string().uuid(),

    surgeonId: z.string().uuid(),

    procedure: z
      .string()
      .trim()
      .min(1)
      .max(200),

    scheduledDate: z.coerce.date(),

    startTime: z.coerce.date(),

    endTime: z.coerce.date(),

    priority: z
      .enum([
        "ELECTIVE",
        "URGENT",
        "EMERGENCY",
      ])
      .optional(),

    clinicalNotes: z
      .string()
      .trim()
      .max(5000)
      .optional(),
  })
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: "End time must be after start time.",
      path: ["endTime"],
    },
  );

export const updateScheduleSchema = z
  .object({
    patientId: z.string().uuid().optional(),

    departmentId: z.string().uuid().optional(),

    otRoomId: z.string().uuid().optional(),

    surgeonId: z.string().uuid().optional(),

    procedure: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional(),

    scheduledDate: z.coerce.date().optional(),

    startTime: z.coerce.date().optional(),

    endTime: z.coerce.date().optional(),

    priority: z
      .enum([
        "ELECTIVE",
        "URGENT",
        "EMERGENCY",
      ])
      .optional(),

    clinicalNotes: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }

      return true;
    },
    {
      message: "End time must be after start time.",
      path: ["endTime"],
    },
  );

export const updateScheduleStatusSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "DELAYED",
  ]),
});