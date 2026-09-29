import {findDepartmentById,findDepartments,} from "./department.repository";

export async function getDepartments() {
  return findDepartments();
}

export async function getDepartmentById(id: string) {
  return findDepartmentById(id);
}