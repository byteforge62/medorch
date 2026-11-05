/*======================================================================
  Sample records for the three creative concepts
  ======================================================================
  Shapes come from the Prisma schema that is actually deployed:

    OTRoom           code, name, department, capacity, status
    Schedule         procedure, priority, status, startTime, endTime
    ScheduleStaff    surgeon / anaesthetist / nurse / technician
    ScheduleEquipment assignment and release
    Equipment        category, serial, availability, maintenanceDueAt
    AuditLog         action, entity, actor, description, createdAt

  Every value below is synthetic. Each concept labels its preview as
  sample data; none of it may be presented as a live theatre or a real
  clinician, patient or hospital.
====================================================================== */

export const DAY_START = 8 * 60;
export const DAY_END = 16 * 60;

export type RoomCondition = 'In progress' | 'Available' | 'Turnover' | 'Delayed';
export type CaseStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'In progress'
  | 'Delayed'
  | 'Completed'
  | 'Cancelled';
export type Priority = 'Elective' | 'Urgent' | 'Emergency';

export interface CaseBlock {
  kind: 'case';
  id: string;
  procedure: string;
  status: CaseStatus;
  priority: Priority;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  patientCode: string;
  surgeon: string;
  anaesthetist: string;
  scrub: string;
  circulating: string;
  recovery: string;
  equipment: { name: string; state: 'Assigned' | 'Available' | 'Maintenance' }[];
  note: string;
}

export interface HoldBlock {
  kind: 'hold';
  id: string;
  label: string;
  detail: string;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  tone: 'neutral' | 'warning';
}

export type DayBlock = CaseBlock | HoldBlock;

export interface TheatreRoom {
  code: string;
  name: string;
  specialty: string;
  department: string;
  capacity: number;
  condition: RoomCondition;
  conditionDetail: string;
  occupancy: number;
  turnover: string;
  nextEvent: string;
  blocks: DayBlock[];
}

const t = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const lapChole: CaseBlock = {
  kind: 'case',
  id: 'case-2481',
  procedure: 'Laparoscopic cholecystectomy',
  status: 'In progress',
  priority: 'Elective',
  start: '08:00',
  end: '09:50',
  startMin: t('08:00'),
  endMin: t('09:50'),
  patientCode: 'MR-2481',
  surgeon: 'Consultant surgeon · General surgery',
  anaesthetist: 'Anaesthetist · on list',
  scrub: 'Scrub practitioner · set checked',
  circulating: 'Circulating nurse · OT staff scope',
  recovery: 'Recovery lead · handover pending',
  equipment: [
    { name: 'Laparoscopy set · L-04', state: 'Assigned' },
    { name: 'Camera stack · Tower 2', state: 'Assigned' },
    { name: 'Back-up set · L-07', state: 'Available' },
  ],
  note: 'Case opened at 08:04. Set check recorded before the patient entered the room.',
};

const hernia: CaseBlock = {
  kind: 'case',
  id: 'case-2502',
  procedure: 'Inguinal hernia repair',
  status: 'Confirmed',
  priority: 'Elective',
  start: '10:15',
  end: '11:30',
  startMin: t('10:15'),
  endMin: t('11:30'),
  patientCode: 'MR-2502',
  surgeon: 'Consultant surgeon · General surgery',
  anaesthetist: 'Anaesthetist · assigned to window',
  scrub: 'Scrub practitioner · assignment pending',
  circulating: 'Circulating nurse · OT-01',
  recovery: 'Recovery lead · not yet requested',
  equipment: [
    { name: 'Hernia set · H-02', state: 'Assigned' },
    { name: 'Camera stack · Tower 2', state: 'Available' },
  ],
  note: 'Follows the open case; turnover of 25 minutes is held in the schedule.',
};

const craniotomy: CaseBlock = {
  kind: 'case',
  id: 'case-2467',
  procedure: 'Craniotomy · tumour resection',
  status: 'In progress',
  priority: 'Urgent',
  start: '08:30',
  end: '12:30',
  startMin: t('08:30'),
  endMin: t('12:30'),
  patientCode: 'MR-2467',
  surgeon: 'Consultant surgeon · Neurosurgery',
  anaesthetist: 'Anaesthetist · neuro list',
  scrub: 'Scrub practitioner · micro set checked',
  circulating: 'Circulating nurse · OT-02',
  recovery: 'Recovery lead · ICU bed requested',
  equipment: [
    { name: 'Microscope · Neuro set', state: 'Assigned' },
    { name: 'Cranial drill · N-11', state: 'Assigned' },
  ],
  note: 'Long case: the room is closed for the rest of the day after turnover.',
};

const kneeHeld: CaseBlock = {
  kind: 'case',
  id: 'case-2479',
  procedure: 'Total knee arthroplasty',
  status: 'Delayed',
  priority: 'Elective',
  start: '09:00',
  end: '10:20',
  startMin: t('09:00'),
  endMin: t('10:20'),
  patientCode: 'MR-2479',
  surgeon: 'Consultant surgeon · Orthopaedics',
  anaesthetist: 'Anaesthetist · reassigned',
  scrub: 'Scrub practitioner · available',
  circulating: 'Circulating nurse · OT-03',
  recovery: 'Recovery lead · aware',
  equipment: [
    { name: 'Knee set · K-03', state: 'Assigned' },
    { name: 'Tourniquet · T-05', state: 'Maintenance' },
  ],
  note: 'Held at 09:00 with a recorded reason: tourniquet service window overlaps the start.',
};

const shoulder: CaseBlock = {
  kind: 'case',
  id: 'case-2511',
  procedure: 'Shoulder arthroscopy',
  status: 'Scheduled',
  priority: 'Elective',
  start: '11:30',
  end: '12:30',
  startMin: t('11:30'),
  endMin: t('12:30'),
  patientCode: 'MR-2511',
  surgeon: 'Consultant surgeon · Orthopaedics',
  anaesthetist: 'Anaesthetist · window requested',
  scrub: 'Scrub practitioner · not yet assigned',
  circulating: 'Circulating nurse · OT-03',
  recovery: 'Recovery lead · not yet requested',
  equipment: [{ name: 'Arthroscopy stack · A-08', state: 'Assigned' }],
  note: 'Waiting on the held case to be re-planned before the room is confirmed.',
};

const appendicectomy: CaseBlock = {
  kind: 'case',
  id: 'case-2498',
  procedure: 'Appendicectomy',
  status: 'Completed',
  priority: 'Emergency',
  start: '09:45',
  end: '10:35',
  startMin: t('09:45'),
  endMin: t('10:35'),
  patientCode: 'MR-2498',
  surgeon: 'Consultant surgeon · Paediatrics',
  anaesthetist: 'Anaesthetist · paediatric list',
  scrub: 'Scrub practitioner · set released',
  circulating: 'Circulating nurse · OT-04',
  recovery: 'Recovery lead · handover recorded',
  equipment: [{ name: 'Paediatric set · P-01', state: 'Available' }],
  note: 'Completed 10:35. Set released and the room returned to available.',
};

export const theatreRooms: TheatreRoom[] = [
  {
    code: 'OT-01',
    name: 'Theatre 01',
    specialty: 'General surgery',
    department: 'Surgery',
    capacity: 6,
    condition: 'In progress',
    conditionDetail: 'Case open · started 08:04',
    occupancy: 78,
    turnover: '25 min',
    nextEvent: '10:15 · Inguinal hernia repair',
    blocks: [
      lapChole,
      hernia,
      {
        kind: 'hold',
        id: 'hold-ot01',
        label: 'Set check · L-07',
        detail: 'Sterile store handover',
        start: '13:00',
        end: '13:45',
        startMin: t('13:00'),
        endMin: t('13:45'),
        tone: 'neutral',
      },
    ],
  },
  {
    code: 'OT-02',
    name: 'Theatre 02',
    specialty: 'Neurosurgery',
    department: 'Neurosurgery',
    capacity: 8,
    condition: 'In progress',
    conditionDetail: 'Long case · room closed after',
    occupancy: 92,
    turnover: '40 min',
    nextEvent: '12:30 · Turnover, then closed',
    blocks: [
      craniotomy,
      {
        kind: 'hold',
        id: 'hold-ot02',
        label: 'Turnover · then closed',
        detail: 'Deep clean requested',
        start: '12:30',
        end: '16:00',
        startMin: t('12:30'),
        endMin: t('16:00'),
        tone: 'warning',
      },
    ],
  },
  {
    code: 'OT-03',
    name: 'Theatre 03',
    specialty: 'Orthopaedics',
    department: 'Orthopaedics',
    capacity: 6,
    condition: 'Turnover',
    conditionDetail: 'Case held · reason recorded',
    occupancy: 12,
    turnover: '20 min',
    nextEvent: '11:30 · Shoulder arthroscopy',
    blocks: [
      kneeHeld,
      {
        kind: 'hold',
        id: 'hold-ot03',
        label: 'Turnover',
        detail: 'Set exchange',
        start: '10:20',
        end: '11:30',
        startMin: t('10:20'),
        endMin: t('11:30'),
        tone: 'neutral',
      },
      shoulder,
    ],
  },
  {
    code: 'OT-04',
    name: 'Theatre 04',
    specialty: 'Paediatrics',
    department: 'Paediatrics',
    capacity: 5,
    condition: 'Available',
    conditionDetail: 'Room returned at 10:40',
    occupancy: 0,
    turnover: '30 min',
    nextEvent: '12:15 · Set check, bay 4',
    blocks: [
      appendicectomy,
      {
        kind: 'hold',
        id: 'hold-ot04',
        label: 'Set check · bay 4',
        detail: 'Ready for the afternoon list',
        start: '12:15',
        end: '12:45',
        startMin: t('12:15'),
        endMin: t('12:45'),
        tone: 'neutral',
      },
    ],
  },
];

export const equipmentRegister = [
  {
    name: 'Laparoscopy set · L-04',
    category: 'Instrument set',
    serial: 'INS-L04-221',
    state: 'In use' as const,
    location: 'OT-01',
    serviceDue: 'Service recorded 08:12',
  },
  {
    name: 'Camera stack · Tower 2',
    category: 'Imaging',
    serial: 'CAM-T2-118',
    state: 'In use' as const,
    location: 'OT-01',
    serviceDue: 'Last service 12 days ago',
  },
  {
    name: 'Microscope · Neuro set',
    category: 'Imaging',
    serial: 'MIC-N-044',
    state: 'In use' as const,
    location: 'OT-02',
    serviceDue: 'Service current',
  },
  {
    name: 'Tourniquet · T-05',
    category: 'Theatre device',
    serial: 'TRQ-005',
    state: 'Maintenance' as const,
    location: 'Sterile store',
    serviceDue: 'Service window open',
  },
  {
    name: 'Arthroscopy stack · A-08',
    category: 'Imaging',
    serial: 'ART-008',
    state: 'Available' as const,
    location: 'Equipment store',
    serviceDue: 'Service current',
  },
  {
    name: 'Paediatric set · P-01',
    category: 'Instrument set',
    serial: 'INS-P01-033',
    state: 'Available' as const,
    location: 'Sterile store',
    serviceDue: 'Released 10:40',
  },
];

export const auditEvents = [
  {
    time: '10:35',
    action: 'COMPLETE',
    entity: 'Schedule · case-2498',
    actor: 'OT staff · OT-04',
    detail: 'Case completed; set P-01 released and room returned to available.',
  },
  {
    time: '09:42',
    action: 'UPDATE',
    entity: 'Schedule · case-2481',
    actor: 'OT staff · OT-01',
    detail: 'Status changed to IN_PROGRESS; actor and room recorded.',
  },
  {
    time: '09:38',
    action: 'UPDATE',
    entity: 'Equipment · CAM-T2-118',
    actor: 'OT staff · OT-01',
    detail: 'Camera stack assigned to the open case.',
  },
  {
    time: '09:31',
    action: 'UPDATE',
    entity: 'Schedule · case-2479',
    actor: 'Administrator',
    detail: 'Case held. Reason recorded: tourniquet service window.',
  },
  {
    time: '09:12',
    action: 'APPROVE',
    entity: 'User · pending account',
    actor: 'Administrator',
    detail: 'Account approved with a doctor scope of 13 permissions.',
  },
];

/* — Suite plan geometry (one drawing sheet, 1000 × 640 units) -------- */

export type SuiteRegionKind = 'theatre' | 'sterile' | 'anaesthesia' | 'team' | 'recovery' | 'equipment';

export interface SuiteRegion {
  id: string;
  label: string;
  kind: SuiteRegionKind;
  x: number;
  y: number;
  w: number;
  h: number;
  roomCode?: string;
  summary: string;
  items: string[];
}

export const suiteRegions: SuiteRegion[] = [
  {
    id: 'ot-01',
    label: 'OT-01 · General surgery',
    kind: 'theatre',
    roomCode: 'OT-01',
    x: 70,
    y: 110,
    w: 200,
    h: 190,
    summary: 'Case open. One case follows; 25-minute turnover held.',
    items: ['Lap. cholecystectomy · in progress', 'Inguinal hernia · confirmed', 'Team of 5 · set L-04 assigned'],
  },
  {
    id: 'ot-02',
    label: 'OT-02 · Neurosurgery',
    kind: 'theatre',
    roomCode: 'OT-02',
    x: 290,
    y: 110,
    w: 200,
    h: 190,
    summary: 'Long urgent case. Room closes after a 40-minute turnover.',
    items: ['Craniotomy · in progress', 'Recovery · ICU bed requested', 'Microscope · assigned'],
  },
  {
    id: 'ot-03',
    label: 'OT-03 · Orthopaedics',
    kind: 'theatre',
    roomCode: 'OT-03',
    x: 510,
    y: 110,
    w: 200,
    h: 190,
    summary: 'Case held for equipment. Afternoon list still provisional.',
    items: ['Total knee · held 09:00', 'Tourniquet · maintenance', 'Shoulder arthroscopy · scheduled'],
  },
  {
    id: 'ot-04',
    label: 'OT-04 · Paediatrics',
    kind: 'theatre',
    roomCode: 'OT-04',
    x: 730,
    y: 110,
    w: 200,
    h: 190,
    summary: 'Room returned to available after an emergency case.',
    items: ['Appendicectomy · completed', 'Paediatric set · released', 'Set check 12:15'],
  },
  {
    id: 'sterile',
    label: 'Sterile store',
    kind: 'sterile',
    x: 70,
    y: 380,
    w: 200,
    h: 170,
    summary: 'Instrument sets behind a controlled handover, one release at a time.',
    items: ['L-07 · held', 'P-01 · released 10:40', 'Tourniquet · in maintenance'],
  },
  {
    id: 'anaesthesia',
    label: 'Anaesthesia bay',
    kind: 'anaesthesia',
    x: 290,
    y: 380,
    w: 170,
    h: 170,
    summary: 'Anaesthetists are assigned to a theatre window, not to a room.',
    items: ['3 of 4 windows covered', 'Neuro list · double-staffed', 'PAEDS · reassignment open'],
  },
  {
    id: 'team',
    label: 'Team base',
    kind: 'team',
    x: 480,
    y: 380,
    w: 160,
    h: 170,
    summary: 'Role scopes follow the assignment, not the person’s title.',
    items: ['Surgeons · 3 scopes', 'OT staff · assigned theatres only', 'Recovery · handover queue'],
  },
  {
    id: 'recovery',
    label: 'Recovery',
    kind: 'recovery',
    x: 650,
    y: 380,
    w: 170,
    h: 170,
    summary: 'Handover is the last record of the case, and the first of the next.',
    items: ['2 handovers pending', 'ICU bed requested · OT-02', 'Discharge · OT-04'],
  },
  {
    id: 'equipment',
    label: 'Equipment',
    kind: 'equipment',
    x: 840,
    y: 380,
    w: 110,
    h: 170,
    summary: 'Availability and service state for every set and device.',
    items: ['A-08 · available', 'T-05 · maintenance', '6 items on register'],
  },
];

export const suiteRegionLabel: Record<SuiteRegionKind, string> = {
  theatre: 'Theatre',
  sterile: 'Sterile services',
  anaesthesia: 'Anaesthesia',
  team: 'Clinical team',
  recovery: 'Recovery',
  equipment: 'Equipment',
};

/* — Case journey (one case, seven stages) ---------------------------- */

export interface JourneyStage {
  id: string;
  index: string;
  name: string;
  verb: string;
  summary: string;
  module: string;
  state: CaseStatus;
  capability: string;
  records: { label: string; value: string; note?: string }[];
  audit: { time: string; action: string; actor: string; detail: string };
}

export const journeyStages: JourneyStage[] = [
  {
    id: 'booking',
    index: '01',
    name: 'Booking',
    verb: 'The case enters the record',
    summary:
      'A booking is not a calendar entry. It holds a patient, a procedure, a priority and a requested day before any room exists.',
    module: 'Schedules',
    state: 'Scheduled',
    capability: 'Priority is recorded beside the time, so an emergency cannot silently become an elective.',
    records: [
      { label: 'Case', value: 'MR-2481' },
      { label: 'Procedure', value: 'Laparoscopic cholecystectomy' },
      { label: 'Priority', value: 'Elective' },
      { label: 'Requested', value: 'Mon · general list' },
    ],
    audit: {
      time: '07:52',
      action: 'CREATE',
      actor: 'Administrator',
      detail: 'Schedule created for MR-2481 with an elective priority.',
    },
  },
  {
    id: 'confirmation',
    index: '02',
    name: 'Confirmation',
    verb: 'The room and the set are held',
    summary:
      'Confirmation is an act, not a colour. The theatre and the instrument set are checked against what the room already holds.',
    module: 'Theatres · Equipment',
    state: 'Confirmed',
    capability: 'A conflict is surfaced before the day, not discovered in the corridor at 08:00.',
    records: [
      { label: 'Theatre', value: 'OT-01' },
      { label: 'Window', value: '08:00 – 09:50' },
      { label: 'Instrument set', value: 'L-04 · checked' },
      { label: 'Turnover after', value: '25 min' },
    ],
    audit: {
      time: '08:01',
      action: 'UPDATE',
      actor: 'OT staff · OT-01',
      detail: 'Theatre and set confirmed; turnover held in the schedule.',
    },
  },
  {
    id: 'room',
    index: '03',
    name: 'Room allocation',
    verb: 'The room states what it can hold',
    summary:
      'Room state, capacity and the next case are read from the same record. Occupancy is a consequence of the schedule, not a separate chart.',
    module: 'Theatres',
    state: 'Confirmed',
    capability: 'Availability, occupancy and turnover are derived from the schedule rather than maintained by hand.',
    records: [
      { label: 'Room state', value: 'Occupied' },
      { label: 'Capacity', value: '6' },
      { label: 'Occupancy', value: '78%' },
      { label: 'Next case', value: '10:15 · hernia repair' },
    ],
    audit: {
      time: '08:02',
      action: 'UPDATE',
      actor: 'OT staff · OT-01',
      detail: 'Room state read from the schedule; next case and turnover attached.',
    },
  },
  {
    id: 'team',
    index: '04',
    name: 'Team assignment',
    verb: 'Roles, not names, carry the scope',
    summary:
      'The team is attached to the case with a role. What each person can see follows that role, so the record travels with the assignment.',
    module: 'Schedules · Accounts',
    state: 'Confirmed',
    capability: 'OT staff see assigned theatres only; patient detail is redacted outside the clinical scope.',
    records: [
      { label: 'Surgeon', value: 'Consultant · general' },
      { label: 'Anaesthetist', value: 'Assigned to window' },
      { label: 'Scrub', value: 'Set checked' },
      { label: 'Recovery', value: 'Handover pending' },
    ],
    audit: {
      time: '08:02',
      action: 'UPDATE',
      actor: 'Administrator',
      detail: 'Team assigned by role; recovery handover left open.',
    },
  },
  {
    id: 'equipment',
    index: '05',
    name: 'Equipment readiness',
    verb: 'The set is checked before the room',
    summary:
      'Equipment carries availability and service state. A set in maintenance cannot be assigned, and the reason stays on the record.',
    module: 'Equipment',
    state: 'Confirmed',
    capability: 'A set that is out of service is visible before the case starts, not when the trolley arrives.',
    records: [
      { label: 'Assigned', value: 'L-04 · camera stack' },
      { label: 'Back-up', value: 'L-07 · sterile store' },
      { label: 'Service', value: 'Current' },
      { label: 'Released', value: 'At close' },
    ],
    audit: {
      time: '08:12',
      action: 'UPDATE',
      actor: 'OT staff · OT-01',
      detail: 'Set check recorded; camera stack assigned to the case.',
    },
  },
  {
    id: 'procedure',
    index: '06',
    name: 'Procedure',
    verb: 'The day runs against the record',
    summary:
      'When the case opens, the schedule changes state once — attributed to a person and a room. Everything else reads from that state.',
    module: 'Schedules · Dashboard',
    state: 'In progress',
    capability: 'One transition, one actor, one timestamp; the theatre board follows without a second update.',
    records: [
      { label: 'State', value: 'In progress' },
      { label: 'Opened', value: '08:04' },
      { label: 'Priority', value: 'Elective' },
      { label: 'Theatre', value: 'OT-01' },
    ],
    audit: {
      time: '08:04',
      action: 'UPDATE',
      actor: 'OT staff · OT-01',
      detail: 'Case opened. Status changed to IN_PROGRESS; actor and room recorded.',
    },
  },
  {
    id: 'close',
    index: '07',
    name: 'Completion',
    verb: 'The record closes with the case',
    summary:
      'Completion releases the set, returns the room and writes the handover. The audit trail is the case history, not a separate report.',
    module: 'Audit trail · Equipment',
    state: 'Completed',
    capability: 'The completed case, the equipment used and the people involved stay one continuous, attributable record.',
    records: [
      { label: 'Closed', value: '09:50' },
      { label: 'Set', value: 'L-04 · released' },
      { label: 'Room', value: 'Turnover · 25 min' },
      { label: 'Handover', value: 'Recorded' },
    ],
    audit: {
      time: '09:50',
      action: 'COMPLETE',
      actor: 'OT staff · OT-01',
      detail: 'Case completed; set released and turnover opened for the next case.',
    },
  },
];

export const roomConditionTone: Record<
  RoomCondition,
  'attention' | 'positive' | 'info' | 'critical'
> = {
  'In progress': 'attention',
  Available: 'positive',
  Turnover: 'info',
  Delayed: 'critical',
};

export const caseStatusTone: Record<
  CaseStatus,
  'neutral' | 'info' | 'attention' | 'critical' | 'positive'
> = {
  Scheduled: 'neutral',
  Confirmed: 'info',
  'In progress': 'attention',
  Delayed: 'critical',
  Completed: 'positive',
  Cancelled: 'critical',
};

export const priorityTone: Record<Priority, 'neutral' | 'attention' | 'critical'> = {
  Elective: 'neutral',
  Urgent: 'attention',
  Emergency: 'critical',
};

/* The current case in OT-01 — used by the journey concept as its subject. */
export const journeyCase = lapChole;
