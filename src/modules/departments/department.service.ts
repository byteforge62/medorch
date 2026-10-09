import {
  findDepartmentById,
  findDepartments,
  createDepartment,
  updateDepartment,
} from "./department.repository";

import { recordAudit } from "@/modules/audit/audit.service";

export async function getDepartments() {
  return findDepartments();
}

export async function getDepartmentById(id: string) {
  return findDepartmentById(id);
}

export async function createNewDepartment(
  data: {
    name: string;
    description?: string;
    headDoctorId?: string;
    isActive?: boolean;
  },
  userId?: string,
) {
  const department = await createDepartment(data);

  await recordAudit({
    userId,
    action: "CREATE",
    entity: "Department",
    entityId: department.id,
    description: `Department "${department.name}" was created.`,
  });

  return department;
}

export async function updateExistingDepartment(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    headDoctorId?: string | null;
    isActive?: boolean;
  },
  userId?: string,
) {
  const department = await updateDepartment(id, data);

  await recordAudit({
    userId,
    action: "UPDATE",
    entity: "Department",
    entityId: department.id,
    description: `Department "${department.name}" was updated.`,
  });

  return department;
}

export async function deactivateDepartment(
  id: string,
  userId?: string,
) {
  const department = await updateDepartment(id, {
    isActive: false,
  });

  await recordAudit({
    userId,
    action: "UPDATE",
    entity: "Department",
    entityId: department.id,
    description: `Department "${department.name}" was deactivated.`,
  });

  return department;
}