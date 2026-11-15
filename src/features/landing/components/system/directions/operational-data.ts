/*======================================================================
  Operational sample records for the three landing directions
  ======================================================================
  These describe the shape of the Theatres, Schedules, Equipment and
  Accounts modules. Every record is sample data: no hospital, clinician or
  patient is real, and each surface that renders them is labelled Preview.
====================================================================== */

export type RoomStateName = 'In progress' | 'Available' | 'Turnover' | 'Delayed';

export const roomRows: {
  room: string;
  specialty: string;
  state: RoomStateName;
  occupancy: number;
  case: string;
  next: string;
  turnover: string;
}[] = [
  {
    room: 'OT-01',
    specialty: 'General surgery',
    state: 'In progress',
    occupancy: 78,
    case: 'Laparoscopic cholecystectomy · 08:00',
    next: '10:15 · Inguinal hernia repair',
    turnover: '25 min',
  },
  {
    room: 'OT-02',
    specialty: 'Neurosurgery',
    state: 'In progress',
    occupancy: 92,
    case: 'Craniotomy · tumour resection · 08:30',
    next: '13:00 · Turnover, then closed',
    turnover: '40 min',
  },
  {
    room: 'OT-03',
    specialty: 'Orthopaedics',
    state: 'Turnover',
    occupancy: 12,
    case: 'Total knee arthroplasty · held at 09:00',
    next: '11:30 · Shoulder arthroscopy',
    turnover: '20 min',
  },
  {
    room: 'OT-04',
    specialty: 'Paediatrics',
    state: 'Available',
    occupancy: 0,
    case: 'Appendicectomy · completed 09:45',
    next: '12:15 · Set check, bay 4',
    turnover: '30 min',
  },
];

export const roomStateTone = {
  'In progress': 'attention',
  Available: 'positive',
  Turnover: 'info',
  Delayed: 'critical',
} as const;

/* A single case, decomposed into the people and the set it holds. */
export const caseTeam: {
  role: string;
  detail: string;
  held: boolean;
}[] = [
  { role: 'Consultant surgeon', detail: 'General surgery · confirmed', held: true },
  { role: 'Anaesthetist', detail: 'Assigned to window', held: true },
  { role: 'Scrub practitioner', detail: 'Instrument set checked', held: true },
  { role: 'Circulating nurse', detail: 'OT staff scope · OT-01', held: true },
  { role: 'Recovery lead', detail: 'Handover not yet logged', held: false },
];

export const caseSets: {
  name: string;
  state: 'available' | 'in-use' | 'maintenance';
  detail: string;
}[] = [
  {
    name: 'Laparoscopy set · L-04',
    state: 'in-use',
    detail: 'Sterile · checked 08:12 · OT-01',
  },
  {
    name: 'Camera stack · Tower 2',
    state: 'in-use',
    detail: 'Assigned to the open case',
  },
  {
    name: 'Back-up set · L-07',
    state: 'available',
    detail: 'Held in sterile store',
  },
];

export const coordinationEvents: {
  time: string;
  title: string;
  detail: string;
  tone: 'accent' | 'neutral' | 'attention';
}[] = [
  {
    time: '09:42',
    title: 'State → In progress',
    detail: 'OT-01 · actor recorded',
    tone: 'accent',
  },
  {
    time: '09:38',
    title: 'Imaging stack assigned',
    detail: 'OT-01 · equipment entry',
    tone: 'neutral',
  },
  {
    time: '09:31',
    title: 'Case held · reason recorded',
    detail: 'OT-03 · 09:00 arthroplasty',
    tone: 'attention',
  },
  {
    time: '09:12',
    title: 'Cover confirmed',
    detail: 'Anaesthetist · 10:15 window',
    tone: 'neutral',
  },
];

/* Day lanes for the operational board — hours are 08:00 to 16:00. */
export const dayLanes: {
  room: string;
  state: RoomStateName;
  blocks: { start: number; span: number; label: string }[];
}[] = [
  {
    room: 'OT-01',
    state: 'In progress',
    blocks: [
      { start: 8, span: 1.8, label: 'Cholecystectomy' },
      { start: 10.25, span: 1.25, label: 'Hernia repair' },
      { start: 13, span: 1.5, label: 'Set check' },
    ],
  },
  {
    room: 'OT-02',
    state: 'In progress',
    blocks: [
      { start: 8.5, span: 4, label: 'Craniotomy · resection' },
      { start: 13, span: 1.25, label: 'Turnover' },
    ],
  },
  {
    room: 'OT-03',
    state: 'Turnover',
    blocks: [
      { start: 9, span: 0.5, label: 'Held' },
      { start: 11.5, span: 1, label: 'Arthroscopy' },
      { start: 14.5, span: 0.75, label: 'Set check' },
    ],
  },
  {
    room: 'OT-04',
    state: 'Available',
    blocks: [
      { start: 9.75, span: 1.15, label: 'Appendicectomy' },
      { start: 12.25, span: 0.75, label: 'Bay 4 · service' },
    ],
  },
];
