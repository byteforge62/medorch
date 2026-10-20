import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "../audit/audit.repository";

export async function findSchedules() {
  return prisma.schedule.findMany({
    orderBy: {
      scheduledDate: "desc",
    },
    select: {
      id: true,
      patientId: true,
      departmentId: true,
      otRoomId: true,
      surgeonId: true,
      createdById: true,
      procedure: true,
      scheduledDate: true,
      startTime: true,
      endTime: true,
      status: true,
      priority: true,
      clinicalNotes: true,
      createdAt: true,
      updatedAt: true,

      patient: {
        select: {
          id: true,
          patientCode: true,
          name: true,
          phone: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },

      otRoom: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      },

      surgeon: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function findSchedulesForSurgeon(userId: string) {
  return prisma.schedule.findMany({
    where: {
      surgeonId: userId,
    },
    orderBy: [
      { scheduledDate: "asc" },
      { startTime: "asc" },
    ],
    select: {
      id: true,
      procedure: true,
      scheduledDate: true,
      startTime: true,
      endTime: true,
      status: true,
      priority: true,
      patient: {
        select: {
          name: true,
          patientCode: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
      otRoom: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });
}

export async function findScheduleById(id: string) {
  return prisma.schedule.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      patientId: true,
      departmentId: true,
      otRoomId: true,
      surgeonId: true,
      createdById: true,
      procedure: true,
      scheduledDate: true,
      startTime: true,
      endTime: true,
      status: true,
      priority: true,
      clinicalNotes: true,
      createdAt: true,
      updatedAt: true,

      patient: {
        select: {
          id: true,
          patientCode: true,
          name: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },

      otRoom: {
        select: {
          id: true,
          name: true,
          code: true,
          capacity: true,
          status: true,
          isActive: true,
        },
      },

      surgeon: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      staff: {
        select: {
          id: true,
          userId: true,
          role: true,
          assignedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      equipment: {
        select: {
          id: true,
          equipmentId: true,
          assignedAt: true,
          releasedAt: true,

          equipment: {
            select: {
              id: true,
              name: true,
              category: true,
              serialNumber: true,
              status: true,
            },
          },
        },
      },

      notes: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          authorId: true,
          content: true,
          createdAt: true,
          updatedAt: true,

          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function createSchedule(data: {
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  createdById: string;
  procedure: string;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  priority?:
  | "ELECTIVE"
  | "URGENT"
  | "EMERGENCY";
  clinicalNotes?: string;
}) {
  return prisma.schedule.create({
    data,
    select: {
      id: true,
      patientId: true,
      departmentId: true,
      otRoomId: true,
      surgeonId: true,
      createdById: true,
      procedure: true,
      scheduledDate: true,
      startTime: true,
      endTime: true,
      status: true,
      priority: true,
      clinicalNotes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateSchedule(
  id: string,
  data: {
    patientId?: string;
    departmentId?: string;
    otRoomId?: string;
    surgeonId?: string;
    procedure?: string;
    scheduledDate?: Date;
    startTime?: Date;
    endTime?: Date;
    priority?:
    | "ELECTIVE"
    | "URGENT"
    | "EMERGENCY";
    clinicalNotes?: string | null;
  },
  actorUserId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.update({
      where: { id },
      data,
      select: {
        id: true,
        patientId: true,
        departmentId: true,
        otRoomId: true,
        surgeonId: true,
        createdById: true,
        procedure: true,
        scheduledDate: true,
        startTime: true,
        endTime: true,
        status: true,
        priority: true,
        clinicalNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog(
      {
        userId: actorUserId,
        action: "UPDATE",
        entity: "Schedule",
        entityId: schedule.id,
        description: `Schedule for procedure "${schedule.procedure}" was updated.`,
        metadata: {
          scheduleId: schedule.id,
        },
      },
      tx,
    );

    return schedule;
  });
}

export async function updateScheduleStatus(
  id: string,
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "DELAYED",
  expectedStatus:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "DELAYED",
  actorUserId?: string
) {
  return prisma.$transaction(async (tx) => {
    const update = await tx.schedule.updateMany({
      where: {
        id,
        status: expectedStatus,
      },
      data: {
        status,
      },
    });

    if (update.count !== 1) {
      const schedule = await tx.schedule.findUnique({
        where: { id },
        select: { id: true },
      });

      throw new Error(
        schedule ? "SCHEDULE_STATUS_CONFLICT" : "SCHEDULE_NOT_FOUND",
      );
    }

    const schedule = await tx.schedule.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        procedure: true,
        scheduledDate: true,
        startTime: true,
        endTime: true,
        status: true,
        priority: true,
        updatedAt: true,
      },
    });

    const auditAction =
      status === "COMPLETED"
        ? "COMPLETE"
        : status === "CANCELLED"
          ? "CANCEL"
          : "UPDATE";

    await createAuditLog(
      {
        userId: actorUserId,
        action: auditAction,
        entity: "Schedule",
        entityId: schedule.id,
        description: `Schedule status changed to ${status}.`,
        metadata: { status },
      },
      tx,
    );

    return schedule;
  });
}

export async function findPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    select: { id: true },
  });
}

export async function findDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    select: {
      id: true,
      isActive: true,
    },
  });
}

export async function findOTRoomForSchedule(id: string) {
  return prisma.oTRoom.findUnique({
    where: { id },
    select: {
      id: true,
      departmentId: true,
      status: true,
      isActive: true,
    },
  });
}

export async function findSurgeonById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });
}

export async function findScheduleConflicts(data: {
  patientId: string;
  otRoomId: string;
  surgeonId: string;
  startTime: Date;
  endTime: Date;
  excludeScheduleId?: string;
}) {
  return prisma.schedule.findMany({
    where: {
      id: data.excludeScheduleId
        ? { not: data.excludeScheduleId }
        : undefined,

      status: {
        notIn: ["CANCELLED", "COMPLETED"],
      },

      startTime: {
        lt: data.endTime,
      },

      endTime: {
        gt: data.startTime,
      },

      OR: [
        {
          otRoomId: data.otRoomId,
        },
        {
          surgeonId: data.surgeonId,
        },
        {
          patientId: data.patientId,
        }
      ],
    },

    select: {
      id: true,
      otRoomId: true,
      surgeonId: true,
      patientId: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });
}


export async function findSchedulesForStaff(userId: string) {
  return prisma.scheduleStaff.findMany({
    where: {
      userId,
    },
    orderBy: {
      assignedAt: "asc",
    },
    select: {
      id: true,
      role: true,
      assignedAt: true,
      schedule: {
        select: {
          id: true,
          procedure: true,
          scheduledDate: true,
          startTime: true,
          endTime: true,
          status: true,
          priority: true,
          patient: {
            select: {
              name: true,
              patientCode: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
          otRoom: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });
}


export async function findScheduleStaff(
  scheduleId: string,
) {
  return prisma.scheduleStaff.findMany({
    where: {
      scheduleId,
    },
    orderBy: {
      assignedAt: "asc",
    },
    select: {
      id: true,
      scheduleId: true,
      userId: true,
      role: true,
      assignedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });
}


export async function isUserAssignedToSchedule(
  scheduleId: string,
  userId: string,
) {
  const assignment = await prisma.scheduleStaff.findFirst({
    where: {
      scheduleId,
      userId,
    },
    select: {
      id: true,
    },
  });

  return assignment !== null;
}

export async function findUserForStaffAssignment(
  userId: string,
) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      status: true,
      doctorProfile: {
        select: {
          id: true,
          specialization: true,
          licenseNumber: true,
        }
      }
    },
  });
}

export async function createScheduleStaff(
  data: {
    scheduleId: string;
    userId: string;
    role:
    | "SURGEON"
    | "NURSE"
    | "ANESTHETIST"
    | "TECHNICIAN"
    | "OTHER";
  },
) {
  return prisma.scheduleStaff.create({
    data,
    select: {
      id: true,
      scheduleId: true,
      userId: true,
      role: true,
      assignedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

export async function deleteScheduleStaff(id: string, scheduleId: string) {
  return prisma.scheduleStaff.delete({
    where: {
      id,
      scheduleId,
    },
  });
}

export async function findScheduleEquipment(
  scheduleId: string,
) {
  return prisma.scheduleEquipment.findMany({
    where: {
      scheduleId,
    },
    orderBy: {
      assignedAt: "asc",
    },
    select: {
      id: true,
      scheduleId: true,
      equipmentId: true,
      assignedAt: true,
      releasedAt: true,

      equipment: {
        select: {
          id: true,
          name: true,
          category: true,
          serialNumber: true,
          status: true,
        },
      },
    },
  });
}

export async function findEquipmentForAssignment(
  equipmentId: string,
) {
  return prisma.equipment.findUnique({
    where: {
      id: equipmentId,
    },
    select: {
      id: true,
      name: true,
      status: true,
      departmentId: true,
    },
  });
}

export async function createScheduleEquipment(data: {
  scheduleId: string;
  equipmentId: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Claim the equipment only if it is still available.
    const claim = await tx.equipment.updateMany({
      where: {
        id: data.equipmentId,
        status: "AVAILABLE",
      },
      data: {
        status: "IN_USE",
      },
    });

    if (claim.count !== 1) {
      const equipment = await tx.equipment.findUnique({
        where: {
          id: data.equipmentId,
        },
        select: {
          id: true,
        },
      });

      if (!equipment) {
        throw new Error("EQUIPMENT_NOT_FOUND");
      }

      throw new Error("EQUIPMENT_UNAVAILABLE");
    }

    // Create the assignment in the same transaction.
    return tx.scheduleEquipment.create({
      data,
      select: {
        id: true,
        scheduleId: true,
        equipmentId: true,
        assignedAt: true,
        releasedAt: true,
        equipment: {
          select: {
            id: true,
            name: true,
            category: true,
            serialNumber: true,
            status: true,
          },
        },
      },
    });
  });
}


export async function releaseScheduleEquipment(
  id: string,
  scheduleId: string,
) {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.scheduleEquipment.findUnique({
      where: { id },
      select: {
        id: true,
        scheduleId: true,
        equipmentId: true,
        assignedAt: true,
        releasedAt: true,
      },
    });

    if (!assignment || assignment.scheduleId !== scheduleId) {
      throw new Error("EQUIPMENT_ASSIGNMENT_NOT_FOUND");
    }

    if (assignment.releasedAt !== null) {
      throw new Error("EQUIPMENT_ALREADY_RELEASED");
    }

    const released = await tx.scheduleEquipment.updateMany({
      where: {
        id,
        scheduleId,
        releasedAt: null,
      },
      data: {
        releasedAt: new Date(),
      },
    });

    if (released.count !== 1) {
      throw new Error("EQUIPMENT_ALREADY_RELEASED");
    }

    const activeAssignments = await tx.scheduleEquipment.count({
      where: {
        equipmentId: assignment.equipmentId,
        releasedAt: null,
      },
    });

    if (activeAssignments === 0) {
      await tx.equipment.updateMany({
        where: {
          id: assignment.equipmentId,
          status: "IN_USE",
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    return {
      ...assignment,
      releasedAt: new Date(),
    };
  });
}


export async function findScheduleNotes(
  scheduleId: string,
) {
  return prisma.scheduleNote.findMany({
    where: {
      scheduleId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      scheduleId: true,
      authorId: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function createScheduleNote(
  data: {
    scheduleId: string;
    authorId: string;
    content: string;
  },
) {
  return prisma.scheduleNote.create({
    data,
    select: {
      id: true,
      scheduleId: true,
      authorId: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function updateScheduleNote(
  id: string,
  content: string,
) {
  return prisma.scheduleNote.update({
    where: {
      id,
    },
    data: {
      content,
    },
    select: {
      id: true,
      scheduleId: true,
      authorId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findScheduleNoteById(id: string) {
  return prisma.scheduleNote.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      scheduleId: true,
      authorId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteScheduleNote(id: string) {
  return prisma.scheduleNote.delete({
    where: {
      id,
    },
  });
}