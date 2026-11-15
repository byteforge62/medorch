export function getScheduleConstraintConflictMessage(
  error: unknown,
): string | null {
  const details: string[] = [];

  if (error instanceof Error) {
    details.push(error.message);
  }

  if (typeof error === "object" && error !== null) {
    const databaseError = error as {
      code?: unknown;
      meta?: unknown;
    };

    if (typeof databaseError.code === "string") {
      details.push(databaseError.code);
    }

    try {
      details.push(JSON.stringify(databaseError.meta ?? ""));
    } catch {
      // Ignore unprintable error metadata.
    }
  }

  const message = details.join(" ").toLowerCase();

  if (message.includes("schedule_no_room_overlap")) {
    return "The selected operating theatre is already booked during this time.";
  }

  if (message.includes("schedule_no_surgeon_overlap")) {
    return "The selected surgeon is already scheduled during this time.";
  }

  if (message.includes("schedule_no_patient_overlap")) {
    return "This patient already has a procedure scheduled during this time.";
  }

  if (message.includes("23p01") || message.includes("exclusion constraint")) {
    return "This booking conflicts with an existing schedule.";
  }

  return null;
}