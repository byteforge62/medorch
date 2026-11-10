/*======================================================================
  Clinical direction — sample theatre day
  ======================================================================
  Interface preview only. These rows exist to show the shape of the
  product: no patient names, no patient identifiers, no outcome data.
  Every room, case and record below is synthetic and labelled as such
  in the UI.

  Fields follow the deployed schema: OTRoom (code, department, state),
  Schedule (procedure, start, duration, status, priority), ScheduleStaff
  (role), ScheduleEquipment (set) and AuditLog (actor, action, entity).
====================================================================== */

export type CaseStatus =
  | 'In progress'
  | 'Confirmed'
  | 'Delayed'
  | 'Scheduled'
  | 'Completed';

export type RoomState = 'In use' | 'Ready' | 'Turnover' | 'Maintenance';

export type TheatreCase = {
  id: string;
  procedure: string;
  short: string;
  start: number; // minutes from 08:00
  duration: number;
  status: CaseStatus;
  priority: 'Elective' | 'Urgent' | 'Emergency';
  surgeon: string;
  anaesthetist: string;
  team: string;
  set: string;
};

export type TheatreRoom = {
  code: string;
  name: string;
  department: string;
  state: RoomState;
  cases: TheatreCase[];
};

export type TheatreDay = {
  key: string;
  label: string;
  short: string;
  updated: string;
  rooms: TheatreRoom[];
};

const tueRooms: TheatreRoom[] = [
  {
    code: 'OT-01',
    name: 'General surgery',
    department: 'General surgery',
    state: 'In use',
    cases: [
      {
        id: 'c-2481',
        short: 'Cholecystectomy',
        procedure: 'Laparoscopic cholecystectomy',
        start: 0,
        duration: 110,
        status: 'In progress',
        priority: 'Elective',
        surgeon: 'Consultant surgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating',
        set: 'L-07 · Laparoscopy',
      },
      {
        id: 'c-2482',
        short: 'Hernia repair',
        procedure: 'Inguinal hernia repair',
        start: 145,
        duration: 75,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'H-02 · Hernia',
      },
      {
        id: 'c-2483',
        short: 'Laparotomy',
        procedure: 'Emergency laparotomy',
        start: 330,
        duration: 95,
        status: 'Scheduled',
        priority: 'Emergency',
        surgeon: 'On-call surgeon',
        anaesthetist: 'On-call anaesthetist',
        team: 'Scrub + circulating',
        set: 'E-01 · Emergency',
      },
    ],
  },
  {
    code: 'OT-02',
    name: 'Neurosurgery',
    department: 'Neurosurgery',
    state: 'In use',
    cases: [
      {
        id: 'c-2490',
        short: 'Craniotomy',
        procedure: 'Craniotomy · tumour resection',
        start: 30,
        duration: 240,
        status: 'In progress',
        priority: 'Urgent',
        surgeon: 'Consultant neurosurgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating ×2',
        set: 'N-04 · Neuro',
      },
      {
        id: 'c-2491',
        short: 'VP shunt',
        procedure: 'VP shunt insertion',
        start: 330,
        duration: 80,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant neurosurgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'N-02 · Shunt',
      },
    ],
  },
  {
    code: 'OT-03',
    name: 'Orthopaedics',
    department: 'Orthopaedics',
    state: 'Turnover',
    cases: [
      {
        id: 'c-2470',
        short: 'Knee arthroplasty',
        procedure: 'Total knee arthroplasty',
        start: 60,
        duration: 95,
        status: 'Delayed',
        priority: 'Elective',
        surgeon: 'Consultant orthopaedic surgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating',
        set: 'O-11 · Knee',
      },
      {
        id: 'c-2471',
        short: 'Shoulder',
        procedure: 'Shoulder arthroscopy',
        start: 210,
        duration: 60,
        status: 'Scheduled',
        priority: 'Elective',
        surgeon: 'Consultant orthopaedic surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'O-03 · Shoulder',
      },
      {
        id: 'c-2472',
        short: 'Hip revision',
        procedure: 'Hip revision',
        start: 360,
        duration: 120,
        status: 'Scheduled',
        priority: 'Urgent',
        surgeon: 'Consultant orthopaedic surgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating ×2',
        set: 'O-15 · Hip',
      },
    ],
  },
  {
    code: 'OT-04',
    name: 'Paediatrics',
    department: 'Paediatrics',
    state: 'Ready',
    cases: [
      {
        id: 'c-2461',
        short: 'Appendicectomy',
        procedure: 'Paediatric appendicectomy',
        start: 15,
        duration: 70,
        status: 'Completed',
        priority: 'Emergency',
        surgeon: 'Consultant paediatric surgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating',
        set: 'P-02 · Paediatric',
      },
      {
        id: 'c-2462',
        short: 'Hydrocele',
        procedure: 'Hydrocele repair',
        start: 120,
        duration: 45,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant paediatric surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'P-03 · Paediatric',
      },
      {
        id: 'c-2463',
        short: 'EUA',
        procedure: 'Examination under anaesthesia',
        start: 225,
        duration: 30,
        status: 'Scheduled',
        priority: 'Elective',
        surgeon: 'Consultant paediatric surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub',
        set: 'P-01 · Basic',
      },
    ],
  },
];

const wedRooms: TheatreRoom[] = [
  {
    code: 'OT-01',
    name: 'General surgery',
    department: 'General surgery',
    state: 'Ready',
    cases: [
      {
        id: 'c-2510',
        short: 'Fundoplication',
        procedure: 'Laparoscopic fundoplication',
        start: 30,
        duration: 130,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant surgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating',
        set: 'L-02 · Laparoscopy',
      },
      {
        id: 'c-2511',
        short: 'Thyroidectomy',
        procedure: 'Thyroidectomy',
        start: 240,
        duration: 100,
        status: 'Scheduled',
        priority: 'Elective',
        surgeon: 'Consultant surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'H-05 · Head and neck',
      },
    ],
  },
  {
    code: 'OT-02',
    name: 'Neurosurgery',
    department: 'Neurosurgery',
    state: 'Ready',
    cases: [
      {
        id: 'c-2520',
        short: 'Discectomy',
        procedure: 'Lumbar discectomy',
        start: 0,
        duration: 105,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant neurosurgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating',
        set: 'N-01 · Spine',
      },
      {
        id: 'c-2521',
        short: 'ACDF',
        procedure: 'Anterior cervical discectomy',
        start: 165,
        duration: 150,
        status: 'Scheduled',
        priority: 'Urgent',
        surgeon: 'Consultant neurosurgeon',
        anaesthetist: 'Consultant anaesthetist',
        team: 'Scrub + circulating ×2',
        set: 'N-06 · Spine',
      },
    ],
  },
  {
    code: 'OT-03',
    name: 'Orthopaedics',
    department: 'Orthopaedics',
    state: 'Ready',
    cases: [
      {
        id: 'c-2530',
        short: 'Carpal tunnel',
        procedure: 'Carpal tunnel release',
        start: 30,
        duration: 45,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant orthopaedic surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'O-08 · Hand',
      },
      {
        id: 'c-2531',
        short: 'Fasciectomy',
        procedure: 'Dupuytren’s fasciectomy',
        start: 180,
        duration: 90,
        status: 'Scheduled',
        priority: 'Elective',
        surgeon: 'Consultant orthopaedic surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'O-09 · Hand',
      },
    ],
  },
  {
    code: 'OT-04',
    name: 'Paediatrics',
    department: 'Paediatrics',
    state: 'Ready',
    cases: [
      {
        id: 'c-2540',
        short: 'Hernia repair',
        procedure: 'Paediatric hernia repair',
        start: 60,
        duration: 55,
        status: 'Confirmed',
        priority: 'Elective',
        surgeon: 'Consultant paediatric surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'P-03 · Paediatric',
      },
      {
        id: 'c-2541',
        short: 'Tonsillectomy',
        procedure: 'Tonsillectomy',
        start: 180,
        duration: 50,
        status: 'Scheduled',
        priority: 'Elective',
        surgeon: 'Consultant paediatric surgeon',
        anaesthetist: 'Staff anaesthetist',
        team: 'Scrub + circulating',
        set: 'P-05 · ENT',
      },
    ],
  },
];

export const theatreDays: TheatreDay[] = [
  {
    key: 'tue',
    label: 'Tuesday 4 November',
    short: 'Tue 4',
    updated: '10:24',
    rooms: tueRooms,
  },
  {
    key: 'wed',
    label: 'Wednesday 5 November',
    short: 'Wed 5',
    updated: '17:06',
    rooms: wedRooms,
  },
];

export const dayStart = 8 * 60; // 08:00
export const dayEnd = 16 * 60; // 16:00
export const dayMinutes = dayEnd - dayStart;

export function clock(minutesFromOpen: number) {
  const total = dayStart + minutesFromOpen;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export const statusStyle: Record<
  CaseStatus,
  { bar: string; dot: string; text: string }
> = {
  'In progress': {
    bar: 'bg-[var(--pine-soft)] border-[var(--primary)] text-[var(--primary-deep)]',
    dot: 'bg-[var(--primary)]',
    text: 'text-[var(--primary)]',
  },
  Confirmed: {
    bar: 'bg-[var(--success-soft)] border-[var(--success)] text-[var(--success)]',
    dot: 'bg-[var(--success)]',
    text: 'text-[var(--success)]',
  },
  Delayed: {
    bar: 'bg-[var(--warning-soft)] border-[var(--warning)] text-[var(--warning)]',
    dot: 'bg-[var(--warning)]',
    text: 'text-[var(--warning)]',
  },
  Scheduled: {
    bar: 'bg-[var(--surface-subtle)] border-[var(--rule-strong)] text-[var(--ink-secondary)]',
    dot: 'bg-[var(--ink-subtle)]',
    text: 'text-[var(--ink-muted)]',
  },
  Completed: {
    bar: 'bg-[var(--success-soft)] border-[var(--success)] text-[var(--success)]',
    dot: 'bg-[var(--success)]',
    text: 'text-[var(--success)]',
  },
};

export const roomStateStyle: Record<RoomState, { dot: string; text: string }> = {
  'In use': { dot: 'bg-[var(--primary)]', text: 'text-[var(--primary-deep)]' },
  Ready: { dot: 'bg-[var(--success)]', text: 'text-[var(--success)]' },
  Turnover: { dot: 'bg-[var(--warning)]', text: 'text-[var(--warning)]' },
  Maintenance: { dot: 'bg-[var(--vermilion)]', text: 'text-[var(--vermilion-deep)]' },
};

/* Modules: ten domains, each with its own responsibility. */
export type ModuleRecord = {
  id: string;
  name: string;
  owns: string;
  users: string;
  holds: string[];
  access: string;
};

export const modules: ModuleRecord[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    owns: 'The operational picture for the signed-in role: open cases, room state, recent schedules and active alerts.',
    users: 'Administrator · Doctor · OT staff',
    holds: [
      'Open cases by theatre and status',
      'Room availability and state',
      'Recent schedules and active alerts',
    ],
    access: 'Composed from the modules the role can already read. No new data exposure.',
  },
  {
    id: 'ot-rooms',
    name: 'OT Rooms',
    owns: 'Room identity and availability: code, department ownership, capacity, current state and the day’s occupancy.',
    users: 'Administrator · OT staff',
    holds: [
      'Available, occupied, turnover and maintenance state',
      'Department ownership and capacity',
      'Cases scheduled into the room',
    ],
    access: 'Administrators manage rooms. Theatre and clinical roles read room state.',
  },
  {
    id: 'schedules',
    name: 'Schedules',
    owns: 'The booking itself: procedure, priority, start and end time, status, assigned staff, equipment and notes.',
    users: 'Administrator · Doctor · OT staff',
    holds: [
      'Six states from Scheduled to Completed',
      'Staff roles and equipment assignments',
      'Room and surgeon overlap checks',
    ],
    access: 'Administrators create cases. Doctors and theatre staff work within the schedule permissions they are given.',
  },
  {
    id: 'doctors',
    name: 'Doctors',
    owns: 'The clinician directory: specialty, department, profile and the cases a surgeon is assigned to.',
    users: 'Administrator · Doctor · OT staff',
    holds: [
      'Specialty and department',
      'Profile and availability',
      'Assigned and upcoming cases',
    ],
    access: 'Directory reads are available to clinical and theatre roles; profile management is administrative.',
  },
  {
    id: 'patients',
    name: 'Patients',
    owns: 'The patient registry and the clinical record attached to a patient, kept separate from the theatre schedule.',
    users: 'Administrator · Doctor',
    holds: [
      'Registry identity and contact detail',
      'Clinical notes and record fields',
      'Linked schedules and appointments',
    ],
    access: 'Clinical detail requires patients:clinical:read. OT staff and patients do not receive registry access.',
  },
  {
    id: 'equipment',
    name: 'Equipment',
    owns: 'Instrument sets and devices: category, serial, availability, maintenance due date and assignment to a case.',
    users: 'Administrator · OT staff',
    holds: [
      'Available, in use and maintenance state',
      'Maintenance due dates',
      'Case assignment and release',
    ],
    access: 'Readable by clinical and theatre roles. Case assignment is administrative.',
  },
  {
    id: 'departments',
    name: 'Departments',
    owns: 'Organisational structure: departments, heads, member doctors, theatres and equipment ownership.',
    users: 'Administrator · clinical roles',
    holds: [
      'Department head and members',
      'Rooms owned by the department',
      'Equipment and schedules by department',
    ],
    access: 'Readable across clinical roles; structure is changed by administrators only.',
  },
  {
    id: 'alerts',
    name: 'Alerts',
    owns: 'Prioritised operational attention: what needs a decision, who owns it and whether it is resolved.',
    users: 'All four roles',
    holds: [
      'Severity and linked case',
      'Owner and resolution state',
      'Role-scoped visibility',
    ],
    access: 'Own alerts for patients; clinical and theatre roles see the alerts they are entitled to.',
  },
  {
    id: 'accounts',
    name: 'Accounts',
    owns: 'Access administration: registration, email verification, approval, role and account status.',
    users: 'Administrator',
    holds: [
      'Pending, active and suspended accounts',
      'Role assignment and approval',
      'Verification state',
    ],
    access: 'Administrative only. Approval is a deliberate step, not an automatic grant.',
  },
  {
    id: 'audit',
    name: 'Audit trail',
    owns: 'The chronological record of what happened: actor, action, entity, timestamp and the context of the change.',
    users: 'Administrator',
    holds: [
      'Attributed actions across modules',
      'Search and date filtering',
      'Read-only history of changes',
    ],
    access: 'Requires audit:read. Read-only in the application.',
  },
];

export const roleScopes = [
  {
    role: 'Administrator',
    count: 25,
    summary: 'Full operational control, including access administration and the audit trail.',
    can: [
      'Manage accounts, approvals and roles',
      'Manage departments, doctors, rooms and equipment',
      'Create and manage every schedule',
      'Read the patient registry and clinical detail',
      'Read the full audit trail',
    ],
    cannot: ['Nothing in the operational domain is withheld.'],
  },
  {
    role: 'Doctor',
    count: 13,
    summary: 'Clinical work on the cases they are responsible for, with the record behind them.',
    can: [
      'Read rooms, equipment and the doctor directory',
      'Read and manage schedules and case notes',
      'Read the patient registry and clinical detail',
      'Create and manage their own alerts',
    ],
    cannot: ['No account administration', 'No audit trail access', 'No department management'],
  },
  {
    role: 'OT staff',
    count: 9,
    summary: 'The theatre day, read clearly — without patient identity or administrative control.',
    can: [
      'Read rooms, equipment and the doctor directory',
      'Read the day’s schedules',
      'Create alerts and manage their own',
    ],
    cannot: ['No patient registry access', 'No schedule changes', 'No audit trail access'],
  },
  {
    role: 'Patient',
    count: 4,
    summary: 'A narrow view of their own care: appointments and their own alert stream.',
    can: [
      'Read their own appointments',
      'Read their own alerts and dismiss them',
    ],
    cannot: ['No clinical records', 'No directory or room data', 'No scheduling control'],
  },
] as const;

export type AuditEntry = {
  time: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
};

export const auditSample: AuditEntry[] = [
  { time: '10:24:08', actor: 'A. Okafor', role: 'OT staff', action: 'Signed in · session started', entity: 'User · OT staff' },
  { time: '10:21:41', actor: 'M. Lindqvist', role: 'Administrator', action: 'Account approved · doctor role', entity: 'User · pending' },
  { time: '10:18:12', actor: 'M. Lindqvist', role: 'Administrator', action: 'Room state changed · turnover', entity: 'OT Room · OT-03' },
  { time: '10:11:57', actor: 'S. Haddad', role: 'Doctor', action: 'Signed in · session started', entity: 'User · Doctor' },
  { time: '10:04:30', actor: 'M. Lindqvist', role: 'Administrator', action: 'Department updated · Orthopaedics', entity: 'Department · Orthopaedics' },
  { time: '09:58:02', actor: 'A. Okafor', role: 'OT staff', action: 'Signed out · session ended', entity: 'User · OT staff' },
  { time: '09:51:19', actor: 'M. Lindqvist', role: 'Administrator', action: 'Equipment registered · Laparoscopy stack', entity: 'Equipment · L-07' },
  { time: '09:47:44', actor: 'R. Mensah', role: 'Patient', action: 'Signed in · session started', entity: 'User · Patient' },
];

export const stackNotes = [
  ['Application', 'Next.js 16 · React 19', 'Server-rendered records with client-side operational views.'],
  ['Data', 'Prisma 7 · PostgreSQL', 'Relational records with schema-enforced relations.'],
  ['Identity', 'NextAuth · JWT sessions', 'Session versioning and server-side permission checks.'],
  ['Validation', 'Zod · server-enforced', 'Every write validated at the API boundary.'],
  ['Audit', 'Attributed event log', 'Actor, action, entity and timestamp kept for review.'],
] as const;
