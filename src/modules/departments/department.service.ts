import {findDepartmentById,findDepartments,} from "./department.repository";

export async function getDepartments() {
  return findDepartments();
}

export async function getDepartmentById(id: string) {
  return findDepartmentById(id);
}

export async function createDepartment(data: {
  name: string;
  description?: string;
  headDoctor?: string;
  isActive?: boolean;
}){
  return createDepartment(data);
}