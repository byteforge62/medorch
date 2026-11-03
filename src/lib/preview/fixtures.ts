/*======================================================================
  Preview fixtures — ISOLATED, SYNTHETIC, NEVER PERSISTED
  ======================================================================
  PostgreSQL is unreachable in this environment, so the authenticated
  screens cannot be reached through the real session. This module lets the
  *real* page components render by answering their API calls with fixtures.

  Hard rules:
    - nothing here is written anywhere; the stub exists only in the browser
    - every value is obviously synthetic (names below are invented)
    - the preview frame labels the surface as synthetic on screen
    - this module is imported only by /preview/* routes
====================================================================== */

function dayOffset(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return date;
}

function iso(days: number) {
  return dayOffset(days).toISOString();
}

/** `YYYY-MM-DD` — the shape the schedule screens slice from the date. */
function ymd(days: number) {
  const date = dayOffset(days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function at(days: number, hour: number, minute = 0) {
  const date = dayOffset(days);
  date.setHours(hour, minute, 0, 0);

  return date.toISOString();
}

const DEPARTMENTS = [
  { id: 'dep-1', name: 'General Surgery', description: 'Abdominal, trauma and emergency general surgery.' },
  { id: 'dep-2', name: 'Orthopaedics', description: 'Elective joint replacement and sports injury.' },
  { id: 'dep-3', name: 'Cardiothoracic', description: 'Cardiac and thoracic procedures.' },
  { id: 'dep-4', name: 'Neurosurgery', description: 'Cranial and spinal procedures.' },
];

const PATIENTS = [
  { id: 'pat-1', patientCode: 'MR-2041', name: 'Ira Devan', email: 'ira.devan@example.test', phone: '+91 90000 11041', dateOfBirth: '1978-04-12', gender: 'FEMALE' },
  { id: 'pat-2', patientCode: 'MR-2042', name: 'Nikhil Rao', email: 'nikhil.rao@example.test', phone: '+91 90000 11042', dateOfBirth: '1991-09-03', gender: 'MALE' },
  { id: 'pat-3', patientCode: 'MR-2043', name: 'Sana Qureshi', email: 'sana.qureshi@example.test', phone: '+91 90000 11043', dateOfBirth: '1965-01-27', gender: 'FEMALE' },
  { id: 'pat-4', patientCode: 'MR-2044', name: 'Arjun Menon', email: 'arjun.menon@example.test', phone: null, dateOfBirth: '1987-11-19', gender: 'MALE' },
  { id: 'pat-5', patientCode: 'MR-2045', name: 'Leela Iyer', email: 'leela.iyer@example.test', phone: '+91 90000 11045', dateOfBirth: '1954-06-30', gender: 'FEMALE' },
  { id: 'pat-6', patientCode: 'MR-2046', name: 'Tomas Feld', email: 'tomas.feld@example.test', phone: '+91 90000 11046', dateOfBirth: '2001-02-08', gender: 'MALE' },
  { id: 'pat-7', patientCode: 'MR-2047', name: 'Rhea Kapadia', email: 'rhea.kapadia@example.test', phone: '+91 90000 11047', dateOfBirth: '1996-07-14', gender: 'FEMALE' },
  { id: 'pat-8', patientCode: 'MR-2048', name: 'Omar Hadid', email: 'omar.hadid@example.test', phone: '+91 90000 11048', dateOfBirth: '1972-03-22', gender: 'MALE' },
];

const DOCTORS = [
  { id: 'doc-1', userId: 'usr-1', departmentId: 'dep-1', specialization: 'Hepatobiliary surgery', licenseNumber: 'MCI-88214', createdAt: iso(-420), user: { id: 'usr-1', name: 'Dr. Anaya Sharma', email: 'anaya.sharma@medorch.test', phone: '+91 90000 21001', status: 'ACTIVE' }, department: DEPARTMENTS[0] },
  { id: 'doc-2', userId: 'usr-2', departmentId: 'dep-2', specialization: 'Joint reconstruction', licenseNumber: 'MCI-77310', createdAt: iso(-380), user: { id: 'usr-2', name: 'Dr. Kabir Nair', email: 'kabir.nair@medorch.test', phone: '+91 90000 21002', status: 'ACTIVE' }, department: DEPARTMENTS[1] },
  { id: 'doc-3', userId: 'usr-3', departmentId: 'dep-3', specialization: 'Adult cardiac surgery', licenseNumber: 'MCI-64119', createdAt: iso(-300), user: { id: 'usr-3', name: 'Dr. Meera Vaz', email: 'meera.vaz@medorch.test', phone: '+91 90000 21003', status: 'ACTIVE' }, department: DEPARTMENTS[2] },
  { id: 'doc-4', userId: 'usr-4', departmentId: 'dep-4', specialization: 'Spinal neurosurgery', licenseNumber: 'MCI-55902', createdAt: iso(-240), user: { id: 'usr-4', name: 'Dr. Ivan Petrov', email: 'ivan.petrov@medorch.test', phone: null, status: 'PENDING' }, department: DEPARTMENTS[3] },
  { id: 'doc-5', userId: 'usr-5', departmentId: null, specialization: null, licenseNumber: null, createdAt: iso(-90), user: { id: 'usr-5', name: 'Dr. Hana Ito', email: 'hana.ito@medorch.test', phone: '+91 90000 21005', status: 'SUSPENDED' }, department: null },
  { id: 'doc-6', userId: 'usr-6', departmentId: 'dep-1', specialization: 'Emergency surgery', licenseNumber: 'MCI-91120', createdAt: iso(-30), user: { id: 'usr-6', name: 'Dr. Samuel Oduya', email: 'samuel.oduya@medorch.test', phone: '+91 90000 21006', status: 'ACTIVE' }, department: DEPARTMENTS[0] },
];

const ROOMS = [
  { id: 'ot-1', name: 'Theatre One', code: 'OT-01', capacity: 2, status: 'OCCUPIED', isActive: true, department: DEPARTMENTS[0] },
  { id: 'ot-2', name: 'Theatre Two', code: 'OT-02', capacity: 2, status: 'AVAILABLE', isActive: true, department: DEPARTMENTS[1] },
  { id: 'ot-3', name: 'Theatre Three', code: 'OT-03', capacity: 1, status: 'MAINTENANCE', isActive: true, department: DEPARTMENTS[2] },
  { id: 'ot-4', name: 'Theatre Four', code: 'OT-04', capacity: 2, status: 'DISABLED', isActive: false, department: null },
];

function schedule(
  id: string,
  procedure: string,
  days: number,
  start: [number, number],
  end: [number, number],
  status: string,
  priority: string,
  patientIndex: number,
  departmentIndex: number,
  roomIndex: number,
) {
  return {
    id,
    procedure,
    scheduledDate: ymd(days),
    startTime: at(days, start[0], start[1]),
    endTime: at(days, end[0], end[1]),
    status,
    priority,
    patient: {
      name: PATIENTS[patientIndex].name,
      patientCode: PATIENTS[patientIndex].patientCode,
    },
    department: { name: DEPARTMENTS[departmentIndex].name },
    otRoom: { name: ROOMS[roomIndex].name, code: ROOMS[roomIndex].code },
  };
}

const DOCTOR_SCHEDULES = [
  schedule('sch-1', 'Laparoscopic cholecystectomy', 0, [9, 0], [10, 30], 'IN_PROGRESS', 'URGENT', 0, 0, 0),
  schedule('sch-2', 'Incisional hernia repair', 0, [11, 30], [13, 0], 'CONFIRMED', 'ELECTIVE', 1, 0, 0),
  schedule('sch-3', 'Diagnostic laparoscopy', 1, [8, 30], [10, 0], 'SCHEDULED', 'ELECTIVE', 2, 0, 1),
  schedule('sch-4', 'Exploratory laparotomy', 2, [14, 0], [16, 30], 'SCHEDULED', 'EMERGENCY', 3, 0, 0),
  schedule('sch-5', 'Appendicectomy', -1, [10, 0], [11, 15], 'COMPLETED', 'URGENT', 4, 0, 1),
];

const STAFF_ASSIGNMENTS = [
  { id: 'asg-1', role: 'NURSE', assignedAt: iso(-2), schedule: DOCTOR_SCHEDULES[0] },
  { id: 'asg-2', role: 'ANESTHETIST', assignedAt: iso(-2), schedule: DOCTOR_SCHEDULES[1] },
  { id: 'asg-3', role: 'TECHNICIAN', assignedAt: iso(-1), schedule: DOCTOR_SCHEDULES[2] },
  { id: 'asg-4', role: 'NURSE', assignedAt: iso(-1), schedule: DOCTOR_SCHEDULES[3] },
];

const PATIENT_APPOINTMENTS = {
  id: 'pat-1',
  patientCode: 'MR-2041',
  name: 'Ira Devan',
  currentTime: Date.now(),
  schedules: [
    schedule('apr-1', 'Laparoscopic cholecystectomy', 3, [9, 0], [10, 30], 'CONFIRMED', 'ELECTIVE', 0, 0, 0),
    schedule('apr-2', 'Post-operative review', 24, [11, 0], [11, 30], 'SCHEDULED', 'ELECTIVE', 0, 0, 1),
    schedule('apr-3', 'Pre-admission assessment', -14, [10, 0], [10, 45], 'COMPLETED', 'ELECTIVE', 0, 0, 1),
  ],
};

const SCHEDULES = [
  schedule('sch-1', 'Laparoscopic cholecystectomy', 0, [9, 0], [10, 30], 'IN_PROGRESS', 'URGENT', 0, 0, 0),
  schedule('sch-2', 'Incisional hernia repair', 0, [11, 30], [13, 0], 'CONFIRMED', 'ELECTIVE', 1, 0, 0),
  schedule('sch-6', 'Total knee replacement', 0, [10, 0], [12, 30], 'CONFIRMED', 'ELECTIVE', 5, 1, 1),
  schedule('sch-7', 'Coronary bypass', 0, [8, 0], [13, 0], 'COMPLETED', 'EMERGENCY', 2, 2, 2),
  schedule('sch-3', 'Diagnostic laparoscopy', 1, [8, 30], [10, 0], 'SCHEDULED', 'ELECTIVE', 2, 0, 1),
  schedule('sch-4', 'Exploratory laparotomy', 2, [14, 0], [16, 30], 'SCHEDULED', 'EMERGENCY', 3, 0, 0),
];

const EQUIPMENT = [
  { id: 'eq-1', name: 'Anaesthetic machine', category: 'Anaesthesia', status: 'AVAILABLE' },
  { id: 'eq-2', name: 'Electrosurgical unit', category: 'Surgical', status: 'IN_USE' },
  { id: 'eq-3', name: 'Laparoscopic tower', category: 'Endoscopy', status: 'AVAILABLE' },
  { id: 'eq-4', name: 'Patient warming system', category: 'Recovery', status: 'MAINTENANCE' },
  { id: 'eq-5', name: 'C-Arm fluoroscopy', category: 'Imaging', status: 'AVAILABLE' },
];

const USERS = [
  { id: 'usr-1', name: 'Dr. Anaya Sharma', email: 'anaya.sharma@medorch.test', role: 'DOCTOR', status: 'ACTIVE', createdAt: iso(-420) },
  { id: 'usr-2', name: 'Dr. Kabir Nair', email: 'kabir.nair@medorch.test', role: 'DOCTOR', status: 'ACTIVE', createdAt: iso(-380) },
  { id: 'usr-7', name: 'Priya Raman', email: 'priya.raman@medorch.test', role: 'ADMIN', status: 'ACTIVE', createdAt: iso(-500) },
  { id: 'usr-8', name: 'Dev Anand', email: 'dev.anand@medorch.test', role: 'OT_STAFF', status: 'ACTIVE', createdAt: iso(-200) },
  { id: 'usr-9', name: 'Ira Devan', email: 'ira.devan@example.test', role: 'PATIENT', status: 'ACTIVE', createdAt: iso(-120) },
  { id: 'usr-10', name: 'Marcus Vale', email: 'marcus.vale@medorch.test', role: 'OT_STAFF', status: 'SUSPENDED', createdAt: iso(-60) },
];

const AUDIT_LOGS = [
  { id: 'aud-1', action: 'SCHEDULE_CREATED', entity: 'Schedule', entityId: 'sch-1', userId: 'usr-1', createdAt: at(0, 8, 12), user: { name: 'Dr. Anaya Sharma', email: 'anaya.sharma@medorch.test' } },
  { id: 'aud-2', action: 'PATIENT_UPDATED', entity: 'Patient', entityId: 'pat-3', userId: 'usr-7', createdAt: at(0, 7, 45), user: { name: 'Priya Raman', email: 'priya.raman@medorch.test' } },
  { id: 'aud-3', action: 'OT_ROOM_STATUS_CHANGED', entity: 'OTRoom', entityId: 'ot-3', userId: 'usr-8', createdAt: at(-1, 17, 5), user: { name: 'Dev Anand', email: 'dev.anand@medorch.test' } },
  { id: 'aud-4', action: 'USER_SUSPENDED', entity: 'User', entityId: 'usr-10', userId: 'usr-7', createdAt: at(-1, 15, 30), user: { name: 'Priya Raman', email: 'priya.raman@medorch.test' } },
];

const ALERTS = [
  { id: 'alr-1', title: 'Theatre Three out of service', message: 'Facilities recorded unplanned maintenance; allocation blocked.', severity: 'CRITICAL', category: 'OT_ROOM', isRead: false, createdAt: at(0, 6, 40), resourceId: 'ot-3' },
  { id: 'alr-2', title: 'Emergency case added to Theatre One', message: 'Exploratory laparotomy scheduled ahead of elective list.', severity: 'WARNING', category: 'SCHEDULE', isRead: false, createdAt: at(0, 7, 5), resourceId: 'sch-4' },
  { id: 'alr-3', title: 'Anaesthetist assignment pending', message: 'Theatre Two case has no anaesthetist recorded.', severity: 'WARNING', category: 'STAFF', isRead: true, createdAt: at(-1, 16, 20), resourceId: 'sch-2' },
];

/*----------------------------------------------------------------------
  Resolution. Match on a substring of the path so a component query with
  filters still resolves; unknown endpoints answer `[]` so a preview
  degrades to an empty state rather than an error banner.
---------------------------------------------------------------------- */

function resolve(path: string): unknown {
  const p = path.split('?')[0];

  if (p.startsWith('/api/me/schedules')) return DOCTOR_SCHEDULES;
  if (p.startsWith('/api/me/staff-schedules')) return STAFF_ASSIGNMENTS;
  if (p.startsWith('/api/me/appointments')) return PATIENT_APPOINTMENTS;

  if (p === '/api/patients' || p.startsWith('/api/patients/')) return PATIENTS;
  if (p === '/api/doctors' || p.startsWith('/api/doctors/')) return DOCTORS;
  if (p === '/api/departments' || p.startsWith('/api/departments/'))
    return DEPARTMENTS;
  if (p === '/api/ot-rooms' || p.startsWith('/api/ot-rooms/')) return ROOMS;
  if (p.startsWith('/api/users')) return USERS;
  if (p.startsWith('/api/audit')) return AUDIT_LOGS;
  if (p.startsWith('/api/alerts')) return ALERTS;
  if (p === '/api/schedules' || p.startsWith('/api/schedules/'))
    return SCHEDULES;
  if (p === '/api/equipment' || p.startsWith('/api/equipment/'))
    return EQUIPMENT;

  return [];
}

type PreviewWindow = Window & { __medorchPreviewInstalled?: boolean };

export function installPreviewFetch() {
  if (typeof window === 'undefined') return;

  const win = window as PreviewWindow;
  if (win.__medorchPreviewInstalled) return;
  win.__medorchPreviewInstalled = true;

  const originalFetch = win.fetch.bind(win);

  win.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const path = url.startsWith('http')
      ? url.slice(url.indexOf('/', url.indexOf('//') + 2))
      : url;

    if (path.startsWith('/api/')) {
      const data = resolve(path);

      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  };
}
