export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';
export type ScheduleStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';
export type SchedulePriority = 'ELECTIVE' | 'URGENT' | 'EMERGENCY';
export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType = 'SCHEDULE' | 'RESOURCE' | 'SYSTEM' | 'MAINTENANCE';
export type UserRole = 'ADMIN' | 'DOCTOR' | 'OT_STAFF' | 'PATIENT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
export type StaffRole = 'SURGEON' | 'NURSE' | 'ANESTHETIST' | 'TECHNICIAN' | 'OTHER';
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'COMPLETE';

export type DepartmentRef = {
  id?: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  capacity: number | null;
  status: RoomStatus;
  isActive: boolean;
  department?: DepartmentRef | null;
};

export type Schedule = {
  id: string;
  patientId?: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  procedure: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  priority: SchedulePriority;
  department?: { id: string; name: string } | null;
  otRoom?: { id: string; name: string; code: string; status?: RoomStatus } | null;
  surgeon?: { id: string; name: string; email?: string } | null;
};

export type ScheduleStaffAssignment = {
  id: string;
  userId: string;
  role: StaffRole;
  user: {
    id: string;
    name: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
  };
};

export type ScheduleEquipmentAssignment = {
  id: string;
  equipmentId: string;
  releasedAt: string | null;
  equipment: {
    id: string;
    name: string;
    category: string;
    serialNumber: string | null;
    status: EquipmentStatus;
  };
};

export type ScheduleDetail = Schedule & {
  staff: ScheduleStaffAssignment[];
  equipment: ScheduleEquipmentAssignment[];
};

export type Equipment = {
  id: string;
  name: string;
  category: string;
  serialNumber: string | null;
  status: EquipmentStatus;
  departmentId: string | null;
  maintenanceDueAt: string | null;
  department?: DepartmentRef | null;
};

export type AlertRecord = {
  id: string;
  userId: string;
  scheduleId: string | null;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  schedule?: {
    id: string;
    procedure: string;
    scheduledDate: string;
    status: string;
  } | null;
};

export type Doctor = {
  id: string;
  userId: string;
  departmentId: string | null;
  specialization: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    status: UserStatus;
  };
  department?: DepartmentRef | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  doctorProfile?: { id: string } | null;
};

export type AuditLog = {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  description: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type AuditResponse = {
  items: AuditLog[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
};

export type DashboardSource =
  | 'rooms'
  | 'schedules'
  | 'equipment'
  | 'alerts'
  | 'doctors'
  | 'users'
  | 'audit'
  | 'details';

export type DashboardErrors = Partial<Record<DashboardSource, string>>;

export type DashboardData = {
  rooms: Room[];
  schedules: Schedule[];
  details: Record<string, ScheduleDetail>;
  equipment: Equipment[];
  alerts: AlertRecord[];
  doctors: Doctor[];
  users: User[];
  audit: AuditLog[];
  auditTotal: number;
};
