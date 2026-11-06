export type WorkspaceScheduleStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

export type WorkspaceSchedulePriority = 'ELECTIVE' | 'URGENT' | 'EMERGENCY';

export type WorkspaceStaffRole =
  | 'SURGEON'
  | 'NURSE'
  | 'ANESTHETIST'
  | 'TECHNICIAN'
  | 'OTHER';

export type WorkspaceRoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'DISABLED';

export interface WorkspacePatientRef {
  id: string;
  name: string;
  patientCode: string;
}

export interface WorkspaceDepartmentRef {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface WorkspaceRoom {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName?: string | null;
  capacity?: number | null;
  status: WorkspaceRoomStatus;
  isActive: boolean;
}

export interface WorkspaceSurgeonRef {
  id: string;
  name: string;
  status?: string;
}

export interface WorkspaceStaffAssignment {
  id: string;
  userId: string;
  role: WorkspaceStaffRole;
  assignedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface WorkspaceEquipmentAssignment {
  id: string;
  equipmentId: string;
  assignedAt: string;
  releasedAt: string | null;
  equipment: {
    id: string;
    name: string;
    category: string;
    serialNumber: string | null;
    status: string;
  };
}

export interface WorkspaceSchedule {
  id: string;
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: WorkspaceScheduleStatus;
  priority: WorkspaceSchedulePriority;
  clinicalNotes: string | null;
  patient: WorkspacePatientRef | null;
  department: WorkspaceDepartmentRef | null;
  otRoom: {
    id: string;
    name: string;
    code: string;
    departmentId: string;
    status: WorkspaceRoomStatus;
    isActive: boolean;
  } | null;
  surgeon: WorkspaceSurgeonRef | null;
  staff: WorkspaceStaffAssignment[];
  equipment: WorkspaceEquipmentAssignment[];
}

export interface WorkspacePatientOption {
  id: string;
  name: string;
  patientCode: string;
}

export interface WorkspaceDoctorOption {
  id: string;
  userId: string;
  name: string;
  departmentId: string | null;
  specialization: string | null;
}

export interface ScheduleWorkspaceCapabilities {
  canCreate: boolean;
  canEdit: boolean;
  canManageStatus: boolean;
  canManageStaff: boolean;
  canManageEquipment: boolean;
  canManageNotes: boolean;
}

export interface ScheduleWorkspaceData {
  role: 'ADMIN' | 'DOCTOR' | 'OT_STAFF';
  scope: 'ALL' | 'ASSIGNED';
  schedules: WorkspaceSchedule[];
  rooms: WorkspaceRoom[];
  departments: WorkspaceDepartmentRef[];
  patients: WorkspacePatientOption[];
  doctors: WorkspaceDoctorOption[];
  capabilities: ScheduleWorkspaceCapabilities;
  todayKey: string;
  generatedAt: string;
}
