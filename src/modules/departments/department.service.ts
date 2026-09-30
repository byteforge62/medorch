import {findDepartmentById,findDepartments,createDepartment,updateDepartment} from "./department.repository";

export async function getDepartments() {
  return findDepartments();
}

export async function getDepartmentById(id: string) {
  return findDepartmentById(id);
}

export async function createNewDepartment(data: {
  name: string;
  description?: string;
  headDoctor?: string;
  isActive?: boolean;
}){
  return createDepartment(data);
}

export async function updateExistingDepartment(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    headDoctorId?: string | null;
    isActive?: boolean;
  },
) {
  return updateDepartment(id, data);
}