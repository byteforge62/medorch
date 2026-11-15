/*======================================================================
  Landing content — the application's own vocabulary
  ======================================================================
  Everything here is taken from what the product actually models: the ten
  modules, the six schedule states, the four role scopes, the equipment
  availability states and the audit vocabulary. No hospital customers, no
  clinical statistics, no certifications, no testimonials.

  The schedule and equipment rows are an *interface preview*: illustrative
  records that show the shape of the product. They are labelled as such in
  the UI and must never be presented as live data.
====================================================================== */

export const modules = [
  { code: '01', name: 'Dashboard', note: 'Role-composed operational overview.' },
  { code: '02', name: 'Schedules', note: 'Bookings, status transitions and conflict checks.' },
  { code: '03', name: 'Departments', note: 'Clinical structure and theatre ownership.' },
  { code: '04', name: 'Patients', note: 'Registry, records and scoped clinical access.' },
  { code: '05', name: 'Doctors', note: 'Specialties, assignments and coverage.' },
  { code: '06', name: 'Equipment', note: 'Instrument sets, availability and maintenance.' },
  { code: '07', name: 'Theatres', note: 'Room state, occupancy and turnover.' },
  { code: '08', name: 'Appointments', note: 'The patient-facing schedule view.' },
  { code: '09', name: 'Accounts', note: 'Verification and approval control.' },
  { code: '10', name: 'Audit trail', note: 'Every action, attributed and dated.' },
] as const;

export const scheduleStates = [
  { code: 'SC', label: 'Scheduled', note: 'Booked, resources held.' },
  { code: 'CF', label: 'Confirmed', note: 'Team and theatre agreed.' },
  { code: 'IP', label: 'In progress', note: 'Case open in theatre.' },
  { code: 'DL', label: 'Delayed', note: 'Held with a recorded reason.' },
  { code: 'CN', label: 'Cancelled', note: 'Released, with the reason kept.' },
  { code: 'CP', label: 'Completed', note: 'Closed and auditable.' },
] as const;

export const roles = [
  {
    role: 'Administrator',
    scope: '25 permissions',
    lines: ['Accounts and approvals', 'Full schedule control', 'Audit trail access'],
  },
  {
    role: 'Doctor',
    scope: '13 permissions',
    lines: ['Clinical patient record', 'Schedule and own notes', 'Alert management'],
  },
  {
    role: 'OT staff',
    scope: '9 permissions',
    lines: ['Assigned theatres only', 'Redacted patient detail', 'Read-only resources'],
  },
  {
    role: 'Patient',
    scope: '4 permissions',
    lines: ['Own appointments', 'Own alert stream', 'No clinical exposure'],
  },
] as const;

/* Interface preview: a theatre day, not real patient data. */
export const scheduleRows = [
  {
    room: 'OT-01',
    time: '08:00',
    procedure: 'Laparoscopic cholecystectomy',
    priority: 'Elective',
    duration: '110 min',
    state: 'In progress',
  },
  {
    room: 'OT-01',
    time: '10:15',
    procedure: 'Inguinal hernia repair',
    priority: 'Elective',
    duration: '75 min',
    state: 'Confirmed',
  },
  {
    room: 'OT-02',
    time: '08:30',
    procedure: 'Craniotomy · tumour resection',
    priority: 'Urgent',
    duration: '240 min',
    state: 'In progress',
  },
  {
    room: 'OT-03',
    time: '09:00',
    procedure: 'Total knee arthroplasty',
    priority: 'Elective',
    duration: '95 min',
    state: 'Delayed',
  },
  {
    room: 'OT-03',
    time: '11:30',
    procedure: 'Shoulder arthroscopy',
    priority: 'Elective',
    duration: '60 min',
    state: 'Scheduled',
  },
  {
    room: 'OT-04',
    time: '09:45',
    procedure: 'Paediatric appendicectomy',
    priority: 'Emergency',
    duration: '70 min',
    state: 'Completed',
  },
] as const;

export const equipmentRows = [
  { name: 'Laparoscopy stack · Tower 2', location: 'OT-01', state: 'In use', detail: 'Last service recorded' },
  { name: 'C-arm fluoroscopy · Unit A', location: 'OT-03', state: 'Available', detail: 'Turnover clean complete' },
  { name: 'Microscope · Neuro set', location: 'OT-02', state: 'In use', detail: 'Assigned to open case' },
  { name: 'Anaesthesia machine · Bay 4', location: 'OT-04', state: 'Maintenance', detail: 'Service window open' },
] as const;

/* Audit vocabulary, shown as a preview of the trail. */
export const auditRows = [
  { time: '09:42:18', event: 'Schedule status changed', detail: 'CONFIRMED → IN_PROGRESS · OT-01', actor: 'OT staff' },
  { time: '09:38:04', event: 'Equipment assigned', detail: 'Laparoscopy stack · Tower 2 · OT-01', actor: 'OT staff' },
  { time: '09:31:55', event: 'Case delayed', detail: 'Reason recorded · OT-03 · 09:00', actor: 'Administrator' },
  { time: '09:12:30', event: 'Account approved', detail: 'Doctor scope · 13 permissions', actor: 'Administrator' },
] as const;

/* Real counts, not marketing numbers. */
export const platformFacts = [
  { value: '10', label: 'Operational modules', detail: 'Each owns a domain; all share one record.' },
  { value: '6', label: 'Schedule states', detail: 'Permitted transitions, conflict checked.' },
  { value: '4', label: 'Role scopes', detail: 'Fixed permission matrix per role.' },
  { value: '1', label: 'Audit spine', detail: 'Every action attributed and dated.' },
] as const;

export const workflowSteps = [
  {
    index: '01',
    title: 'Book the case',
    note: 'Time, theatre, priority and clinical team are recorded together, so the booking is complete before it is confirmed.',
  },
  {
    index: '02',
    title: 'Hold the room and set',
    note: 'The theatre and instrument set are checked against the window. A conflict is surfaced before the day, not during it.',
  },
  {
    index: '03',
    title: 'Run the day',
    note: 'State moves from Confirmed to In progress to Completed, each transition written to the audit trail with an actor.',
  },
  {
    index: '04',
    title: 'Close the record',
    note: 'The completed case, the equipment used and the people involved stay one continuous, attributable record.',
  },
] as const;

export const featureItems = [
  {
    code: '02',
    title: 'One schedule, every state',
    note: 'Scheduled, confirmed, in progress, delayed, cancelled, completed — modelled as transitions with conflict checks, not a status dropdown.',
  },
  {
    code: '03',
    title: 'Theatre ownership',
    note: 'Departments own rooms. Availability, turnover and occupancy are read from the same record the schedule uses.',
  },
  {
    code: '06',
    title: 'Instrument readiness',
    note: 'Equipment carries availability and maintenance state, so a set that is out of service is visible before the case starts.',
  },
  {
    code: '09',
    title: 'Accounts that are approved',
    note: 'Registration does not grant access. Verification and approval are an administrative step with an audit entry.',
  },
  {
    code: '10',
    title: 'Attributed by default',
    note: 'Every mutation records who acted, on what, and when — including the status changes that move a theatre day.',
  },
  {
    code: '05',
    title: 'Clinical workforce',
    note: 'Specialty, department and licence are the organising facts about a clinician, not a free-text column.',
  },
] as const;
