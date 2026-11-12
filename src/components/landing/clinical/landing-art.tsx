import {
  ArrowsLeftRight,
  Bell,
  Buildings,
  CalendarBlank,
  Check,
  CheckCircle,
  Clock,
  ClockCounterClockwise,
  DoorOpen,
  FirstAidKit,
  LinkSimple,
  LockKey,
  Pulse,
  ShieldCheck,
  SquaresFour,
  Stethoscope,
  UserCircle,
  UsersThree,
  Warning,
  Wrench,
} from '@phosphor-icons/react/dist/ssr';

import { modules, roleScopes, theatreDays } from './clinical-data';
import { DayBoard } from './daybook';
import { LandingPhoto, TheatrePlan } from './landing-visuals';

/*======================================================================
  Landing markers and small instruments
====================================================================== */

export function LandingMarker({
  index,
  children,
  tone = 'light',
}: {
  index: string;
  children: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <p
      className={`flex items-center gap-3 font-mono text-[9.5px] tracking-[0.16em] ${
        tone === 'dark' ? 'text-white/60' : 'text-ink-muted'
      }`}
    >
      <span className={tone === 'dark' ? 'text-brand-lavender' : 'text-primary'}>{index}</span>
      <span className={`h-px w-8 ${tone === 'dark' ? 'bg-white/25' : 'bg-rule-strong'}`} />
      <span>{children}</span>
    </p>
  );
}

function StageStatusRail() {
  const day = theatreDays[0];

  return (
    <div className="border-rule bg-sheet/95 rounded-[14px] border px-4 py-3 shadow-[0_12px_30px_rgba(41,36,61,0.08)]">
      <div className="border-rule-soft flex items-center justify-between gap-3 border-b pb-2">
        <span className="text-ink text-[10.5px] font-semibold">Theatre state</span>
        <span className="text-ink-subtle font-mono text-[8px] tracking-[0.08em]">
          SYNTHETIC DAY
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {day.rooms.map((room) => {
          const state = roomStateStyle(room.state);
          return (
            <div key={room.code} className="flex min-w-0 items-center justify-between gap-2">
              <span className="text-ink font-mono text-[9px] font-semibold">{room.code}</span>
              <span className={`flex items-center gap-1 text-[8.5px] ${state.text}`}>
                <span
                  className={`h-1 w-1 rounded-full ${state.dot} ${
                    room.state === 'In use' ? 'landing-pulse' : ''
                  }`}
                  aria-hidden="true"
                />
                {room.state}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function roomStateStyle(state: string) {
  if (state === 'In use') return { dot: 'bg-primary', text: 'text-primary' };
  if (state === 'Ready') return { dot: 'bg-success', text: 'text-success' };
  if (state === 'Turnover') return { dot: 'bg-warning', text: 'text-warning' };
  return { dot: 'bg-danger', text: 'text-danger' };
}

function BundleStrip() {
  const selectedRoom = theatreDays[0].rooms[0];
  const selectedCase = selectedRoom.cases[0];

  return (
    <div className="border-rule bg-sheet flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[14px] border px-4 py-3 shadow-[0_16px_34px_rgba(41,36,61,0.1)]">
      <span className="text-ink-subtle font-mono text-[8px] tracking-[0.12em]">CASE BUNDLE</span>
      <span className="text-ink-secondary flex items-center gap-1.5 text-[10px] font-medium">
        <DoorOpen size={12} weight="duotone" className="text-primary" aria-hidden="true" />
        {selectedRoom.code}
      </span>
      <span className="text-ink-secondary flex items-center gap-1.5 text-[10px] font-medium">
        <UsersThree size={12} weight="duotone" className="text-primary" aria-hidden="true" />
        {selectedCase.team}
      </span>
      <span className="text-ink-secondary flex items-center gap-1.5 text-[10px] font-medium">
        <FirstAidKit size={12} weight="duotone" className="text-primary" aria-hidden="true" />
        {selectedCase.set}
      </span>
      <span className="text-success ml-auto flex items-center gap-1.5 text-[9px] font-semibold">
        <span className="bg-success landing-pulse h-1.5 w-1.5 rounded-full" aria-hidden="true" />
        Attached
      </span>
    </div>
  );
}

/*======================================================================
  Hero stage
  ======================================================================
  A real schedule surface with a room-state rail and case bundle layered
  around it. The composition is deliberately wider than a generic hero
  card: the product is the visual, not a decorative illustration.
====================================================================== */

export function HeroStage() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="landing-stage-grid border-primary/10 bg-paper-deep/85 absolute inset-x-0 top-14 bottom-16 rounded-[32px] border sm:-inset-x-5 lg:-inset-x-7"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 hidden h-[24rem] w-[24rem] lg:block"
      >
        <svg viewBox="0 0 400 400" fill="none" className="text-primary/15 h-full w-full">
          <circle cx="200" cy="200" r="190" stroke="currentColor" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeDasharray="2 8" />
          <circle cx="200" cy="200" r="82" stroke="currentColor" />
          <path d="M200 0v400M0 200h400" stroke="currentColor" strokeOpacity="0.4" />
        </svg>
      </div>

      <div className="relative">
        <div className="flex items-end justify-between gap-3 px-1">
          <span className="text-ink-subtle font-mono text-[8.5px] tracking-[0.12em]">
            PRODUCT SURFACE
          </span>
          <span className="text-ink-subtle font-mono text-[8.5px] tracking-[0.08em]">
            READ-ONLY PREVIEW
          </span>
        </div>

        <div className="landing-rise landing-rise-1 relative z-20 mx-2 mt-2.5 sm:mx-6">
          <StageStatusRail />
        </div>
        <div className="landing-rise landing-rise-2 relative z-10 mt-2 px-0.5 sm:px-3">
          <DayBoard />
        </div>
        <div className="landing-rise landing-rise-3 relative z-20 mx-4 -mt-2 sm:mx-9">
          <BundleStrip />
        </div>

        <p className="text-ink-subtle mt-3 flex items-center gap-1.5 px-1 text-[9px]">
          <CalendarBlank size={11} aria-hidden="true" />
          Illustrative schedule composition. No patient record is shown.
        </p>
      </div>
    </div>
  );
}

/*======================================================================
  Conflict comparison
  ======================================================================
  The refusal and the nearest valid slot are shown as two readable
  requests. The accepted card is deliberately offset: coordination is
  not a symmetric "before/after", it is a correction with a record.
====================================================================== */

const requestChecks = [
  { label: 'Theatre 01', value: 'Free at 09:30', pass: true },
  { label: 'Surgeon', value: 'No overlapping list', pass: true },
  { label: 'Patient', value: 'Already in a case, 09:40–11:10', pass: false },
];

const acceptedChecks = [
  { label: 'Theatre 01', value: 'Free at 14:10', pass: true },
  { label: 'Surgeon', value: 'No overlapping list', pass: true },
  { label: 'Patient', value: 'No existing case in range', pass: true },
];

function CheckLine({
  label,
  value,
  pass,
  tone,
}: {
  label: string;
  value: string;
  pass: boolean;
  tone: 'light' | 'dark';
}) {
  return (
    <li
      className={`grid grid-cols-[78px_minmax(0,1fr)_16px] items-center gap-3 border-b py-3 last:border-b-0 ${
        tone === 'dark' ? 'border-white/10' : 'border-rule-soft'
      }`}
    >
      <span className={`text-[10.5px] font-medium ${tone === 'dark' ? 'text-white/60' : 'text-ink-muted'}`}>
        {label}
      </span>
      <span className={`text-[11.5px] ${tone === 'dark' ? 'text-white/78' : 'text-ink-secondary'}`}>
        {value}
      </span>
      {pass ? (
        <Check size={13} weight="bold" className="text-success-bright" aria-hidden="true" />
      ) : (
        <Warning size={13} weight="fill" className="text-danger-bright" aria-hidden="true" />
      )}
    </li>
  );
}

export function ConflictTriptych() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-0 left-0 hidden h-px bg-white/10 lg:block"
      />
      <div className="relative grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-8">
        <article className="border-white/12 relative overflow-hidden rounded-[22px] border bg-white/[0.045] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-white/60">INCOMING REQUEST</p>
              <p className="mt-2 text-[16px] font-semibold text-white">Add a case to OT-01</p>
            </div>
            <span className="border-danger-bright/35 bg-danger-bright/10 text-danger-bright shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold">
              Refused
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-3 border-y border-white/10 py-3">
            <span className="font-mono text-[15px] text-white">09:30–11:00</span>
            <span className="text-[11px] text-white/60">90 min · illustrative</span>
          </div>

          <ul className="mt-1">
            {requestChecks.map((check) => (
              <CheckLine key={check.label} {...check} tone="dark" />
            ))}
          </ul>

          <div className="border-danger-bright/25 bg-danger-bright/10 mt-4 flex items-center gap-2 border px-3 py-2.5">
            <Warning size={13} weight="fill" className="text-danger-bright" aria-hidden="true" />
            <span className="text-danger-bright text-[11px] font-semibold">Refused at the API boundary</span>
            <span className="text-danger-bright ml-auto font-mono text-[9px]">HTTP 409</span>
          </div>
        </article>

        <span
          aria-hidden="true"
          className="bg-rail border-brand-lavender/35 text-brand-lavender absolute top-1/2 left-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg lg:flex"
        >
          <ArrowsLeftRight size={15} weight="bold" />
        </span>

        <article className="border-rule bg-sheet text-ink relative overflow-hidden rounded-[22px] border p-5 shadow-[0_24px_60px_rgba(0,0,0,0.16)] sm:p-6 lg:mt-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-ink-subtle font-mono text-[9px] tracking-[0.12em]">RESOLVED REQUEST</p>
              <p className="text-ink mt-2 text-[16px] font-semibold">Nearest valid slot</p>
            </div>
            <span className="bg-success-soft text-success shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold">
              Accepted
            </span>
          </div>

          <div className="border-rule mt-4 flex items-baseline justify-between gap-3 border-y py-3">
            <span className="text-ink font-mono text-[15px]">14:10–15:40</span>
            <span className="text-ink-subtle text-[11px]">90 min · OT-01</span>
          </div>

          <ul className="mt-1">
            {acceptedChecks.map((check) => (
              <CheckLine key={check.label} {...check} tone="light" />
            ))}
          </ul>

          <div className="border-success/20 bg-success-soft mt-4 flex items-center gap-2 border px-3 py-2.5">
            <CheckCircle size={13} weight="fill" className="text-success" aria-hidden="true" />
            <span className="text-success text-[11px] font-semibold">Accepted and written to the audit trail</span>
            <span className="text-success ml-auto font-mono text-[9px]">201</span>
          </div>
        </article>
      </div>
    </div>
  );
}

/*======================================================================
  Theatre plate
====================================================================== */

export function TheatrePlate() {
  const room = theatreDays[0].rooms[0];
  const firstCase = room.cases[0];

  return (
    <div className="relative">
      <div className="border-rule bg-sheet relative overflow-hidden rounded-[28px] border p-3 shadow-[0_24px_58px_rgba(41,36,61,0.08)] sm:p-5">
        <div className="border-rule text-ink-subtle flex flex-wrap items-center justify-between gap-2 border-b pb-3 font-mono text-[8.5px] tracking-[0.08em]">
          <span>PLAN / {room.code}</span>
          <span className="text-primary">TABLE · LAMINAR FIELD · ANAESTHESIA</span>
        </div>
        <TheatrePlan className="mx-auto mt-3 h-auto w-full max-w-[760px]" />
      </div>

      <div className="border-white/10 bg-rail relative z-10 mx-4 -mt-8 rounded-[18px] border p-4 text-white shadow-[0_20px_44px_rgba(41,36,61,0.22)] sm:absolute sm:-bottom-7 sm:left-8 sm:mx-0 sm:w-[276px]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-brand-lavender font-mono text-[8px] tracking-[0.12em]">ROOM RECORD / LIVE SHAPE</p>
          <span className="bg-success-bright h-1.5 w-1.5 rounded-full" aria-hidden="true" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-b border-white/12 pb-3">
          <p className="font-display text-[22px] leading-none">{room.code}</p>
          <p className="text-[10px] text-white/55">{room.department}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[8.5px] text-white/60">Current state</p>
            <p className="mt-1 text-[10.5px] font-medium text-white">{room.state}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-white/60">First case</p>
            <p className="mt-1 font-mono text-[10.5px] text-white">
              {clockLabel(firstCase.start)}
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 border-t border-white/12 pt-3 text-[8.5px] text-white/55">
          <Pulse size={11} aria-hidden="true" />
          Capacity, ownership and state stay attached to the room.
        </p>
      </div>
    </div>
  );
}

function clockLabel(minutesFromOpen: number) {
  const total = 8 * 60 + minutesFromOpen;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/*======================================================================
  Resource relationship map
====================================================================== */

const resourceNodes = [
  {
    icon: DoorOpen,
    label: 'Theatre',
    value: 'OT-01',
    detail: 'General surgery',
    state: 'In use',
    accent: 'bg-primary-soft text-primary',
  },
  {
    icon: UsersThree,
    label: 'Clinical team',
    value: 'Attached team',
    detail: 'Scrub + anaesthesia',
    state: 'Attached',
    accent: 'bg-success-soft text-success',
  },
  {
    icon: UserCircle,
    label: 'Patient context',
    value: 'Linked record',
    detail: 'Role-scoped, not previewed',
    state: 'Protected',
    accent: 'bg-brass-soft text-primary-active',
  },
  {
    icon: FirstAidKit,
    label: 'Equipment',
    value: 'L-07',
    detail: 'Laparoscopy set',
    state: 'Reserved',
    accent: 'bg-warning-soft text-warning',
  },
] as const;

export function ResourceMap() {
  const room = theatreDays[0].rooms[0];
  const selectedCase = room.cases[0];

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-ink-subtle font-mono text-[8.5px] tracking-[0.1em]">RELATIONSHIP MAP</span>
        <span className="text-ink-subtle font-mono text-[8.5px] tracking-[0.08em]">
          ONE CASE / FOUR DEPENDENCIES
        </span>
      </div>

              <div className="grid gap-4 lg:grid-cols-[1.04fr_1fr]" aria-label="Case resource relationships">
        <article className="bg-rail relative overflow-hidden rounded-[26px] p-5 text-white shadow-[0_24px_55px_rgba(41,36,61,0.15)] sm:p-6">
          <div aria-hidden="true" className="landing-dark-grid absolute inset-0 opacity-50" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-brand-lavender font-mono text-[8.5px] tracking-[0.12em]">CASE IN FLIGHT</p>
              <span className="text-success-bright flex items-center gap-1.5 text-[9px] font-semibold">
                <span className="bg-success-bright landing-pulse h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                Attached
              </span>
            </div>
            <h3 className="font-display mt-4 max-w-[12ch] text-[clamp(1.8rem,1.2rem+1.8vw,2.45rem)] leading-[0.98] font-medium">
              {selectedCase.procedure}
            </h3>
            <p className="mt-3 font-mono text-[10px] text-white/55">
              {clockLabel(selectedCase.start)}–{clockLabel(selectedCase.start + selectedCase.duration)} ·{' '}
              {room.code} · 110 min
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/12 pt-4">
              <div>
                <p className="text-[8.5px] text-white/60">Theatre</p>
                <p className="mt-1 text-[11px] font-medium text-white">{room.code} · {room.department}</p>
              </div>
              <div>
                <p className="text-[8.5px] text-white/60">Assigned set</p>
                <p className="mt-1 text-[11px] font-medium text-white">{selectedCase.set}</p>
              </div>
            </div>

            <p className="mt-5 flex items-center gap-2 border-t border-white/12 pt-4 text-[9.5px] leading-relaxed text-white/55">
              <LinkSimple size={13} className="text-brand-lavender shrink-0" aria-hidden="true" />
              The case is the join. Every dependency is attached to the same record.
            </p>
          </div>
        </article>

        <div className="grid grid-cols-2 gap-3">
          {resourceNodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <article
                key={node.label}
                className="landing-hover border-rule bg-sheet group rounded-[18px] border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${node.accent}`}>
                    <Icon size={17} weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="text-ink-subtle font-mono text-[8px]">0{index + 1}</span>
                </div>
                <h4 className="text-ink mt-4 text-[13.5px] font-semibold">{node.label}</h4>
                <p className="text-ink-secondary mt-1 text-[12px]">{node.value}</p>
                <p className="text-ink-subtle mt-0.5 text-[10.5px]">{node.detail}</p>
                <p className="text-success mt-3 flex items-center gap-1.5 text-[10px] font-semibold">
                  <span className="bg-success h-1 w-1 rounded-full" aria-hidden="true" />
                  {node.state}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/*======================================================================
  Equipment surface
====================================================================== */

const equipment = [
  {
    code: 'EQ-014',
    name: 'Anaesthesia workstation',
    category: 'Anaesthesia',
    state: 'Allocated',
    detail: 'Case c-2481',
    stateTone: 'bg-primary-soft text-primary',
  },
  {
    code: 'EQ-031',
    name: 'Laparoscopy stack',
    category: 'Imaging',
    state: 'Reserved',
    detail: 'Set L-07',
    stateTone: 'bg-warning-soft text-warning',
  },
  {
    code: 'EQ-007',
    name: 'Operating table',
    category: 'Theatre plant',
    state: 'Available',
    detail: 'OT-03',
    stateTone: 'bg-success-soft text-success',
  },
  {
    code: 'EQ-022',
    name: 'Vital-signs monitor',
    category: 'Monitoring',
    state: 'Maintenance',
    detail: 'Due 18 Nov',
    stateTone: 'bg-danger-soft text-danger',
  },
] as const;

export function EquipmentSurface() {
  return (
    <section
      aria-label="Illustrative equipment register"
      className="border-rule bg-sheet overflow-hidden rounded-[26px] border shadow-[0_24px_58px_rgba(41,36,61,0.08)]"
    >
      <header className="border-rule flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-6">
        <div>
          <p className="text-ink text-[13px] font-semibold">Equipment register</p>
          <p className="text-ink-subtle mt-0.5 text-[9.5px]">Readiness, assignment and maintenance in one view.</p>
        </div>
        <span className="border-rule text-ink-muted rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.08em]">
          ILLUSTRATIVE · 04 RECORDS
        </span>
      </header>

      <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
        <div className="border-rule border-b p-4 sm:p-6 lg:border-r lg:border-b-0">
          <LandingPhoto
            media="anaesthesia-workstation"
            alt="Anaesthesia workstation with ventilator circuit, gas supply and monitoring display in a clinical room."
            sizes="(max-width: 1024px) 100vw, 38vw"
            className="aspect-[16/10] w-full rounded-[14px]"
            imageClassName="object-[center_45%] saturate-[0.92]"
          >
            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2 text-[9px] text-white">
              <span className="rounded-full bg-black/45 px-2.5 py-1">Anaesthesia plant · representative</span>
              <span className="font-mono text-[8px] text-white/70">PLATE 07</span>
            </div>
          </LandingPhoto>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-ink-subtle font-mono text-[8px] tracking-[0.1em]">SELECTED RECORD</p>
              <h3 className="font-display text-ink mt-1 text-[23px] leading-none">Anaesthesia workstation</h3>
              <p className="text-ink-muted mt-1 font-mono text-[9.5px]">EQ-014 · Anaesthesia</p>
            </div>
            <span className="bg-primary-soft text-primary rounded-full px-2.5 py-1 text-[8.5px] font-semibold">
              Allocated
            </span>
          </div>

          <dl className="border-rule mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4">
            {[
              ['Serial', 'AS-014'],
              ['Maintenance', '18 Nov 2026'],
              ['Assigned case', 'c-2481'],
              ['Location', 'OT-01'],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="text-ink-subtle text-[8.5px]">{term}</dt>
                <dd className="text-ink-secondary mt-0.5 text-[10.5px] font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <div className="border-rule text-ink-subtle flex items-center justify-between gap-3 border-b px-4 py-2.5 font-mono text-[8px] tracking-[0.08em] sm:px-6">
            <span>DEVICE</span>
            <span>STATE / ASSIGNMENT</span>
          </div>
          <ul>
            {equipment.map((item, index) => (
              <li
                key={item.code}
                className={`border-rule-soft grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 py-5 last:border-b-0 sm:px-6 ${
                  index === 0 ? 'bg-surface-subtle/70' : ''
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${
                    index === 0 ? 'bg-primary-soft text-primary' : 'bg-surface-muted text-ink-muted'
                  }`}>
                    <Wrench size={15} weight="duotone" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-ink truncate text-[12.5px] font-semibold">{item.name}</p>
                    <p className="text-ink-subtle mt-0.5 text-[9.5px]">{item.code} · {item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${item.stateTone}`}>
                    {item.state}
                  </span>
                  <p className="text-ink-subtle mt-1 font-mono text-[8px]">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-rule text-ink-subtle flex items-center gap-2 border-t px-4 py-3 text-[9px] sm:px-6">
            <CheckCircle size={12} className="text-success" aria-hidden="true" />
            Availability is derived from assignment and maintenance state, not a manual badge.
          </div>

          <div className="border-rule bg-surface-subtle/60 mx-4 mt-5 rounded-[14px] border p-4 sm:mx-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-ink text-[10.5px] font-semibold">Current allocation</p>
              <span className="text-ink-subtle font-mono text-[8px]">C-2481</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                ['Starts', '08:00'],
                ['Theatre', 'OT-01'],
                ['Release', 'Case close'],
              ].map(([term, value]) => (
                <div key={term}>
                  <p className="text-ink-subtle text-[8px]">{term}</p>
                  <p className="text-ink-secondary mt-0.5 text-[9.5px] font-medium">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-ink-subtle mt-3 flex items-center gap-1.5 border-t border-rule-soft pt-2.5 text-[8.5px]">
              <Clock size={10} aria-hidden="true" />
              The set returns to the pool when the case closes or cancels.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/*======================================================================
  Access map
====================================================================== */

const accessPath = [
  { label: 'Session', detail: 'Verified identity', icon: UserCircle },
  { label: 'Role', detail: 'Read from the session', icon: UsersThree },
  { label: 'Permission', detail: 'Checked on the server', icon: ShieldCheck },
  { label: 'Record', detail: 'Scoped response', icon: LockKey },
] as const;

const roleBars = ['bg-primary', 'bg-success', 'bg-warning', 'bg-rule-strong'];

export function AccessMap() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="bg-rail relative overflow-hidden rounded-[24px] p-5 text-white shadow-[0_22px_50px_rgba(41,36,61,0.16)] sm:p-6">
        <div aria-hidden="true" className="landing-dark-grid absolute inset-0 opacity-55" />
        <div className="relative">
          <p className="text-brand-lavender font-mono text-[8.5px] tracking-[0.12em]">REQUEST PATH</p>
          <p className="mt-2 text-[12px] font-semibold text-white">Every request crosses the same boundary.</p>

          <ol className="relative mt-6">
            {accessPath.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < accessPath.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-8 left-[15px] h-full w-px bg-white/15"
                    />
                  ) : null}
                  <span className="border-brand-lavender/30 bg-white/[0.06] text-brand-lavender relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                    <Icon size={14} weight="duotone" aria-hidden="true" />
                  </span>
                  <div className="pt-0.5">
                    <p className="text-[10.5px] font-semibold text-white">{step.label}</p>
                    <p className="mt-0.5 text-[9px] text-white/60">{step.detail}</p>
                  </div>
                  <span className="ml-auto pt-1 font-mono text-[8px] text-white/60">0{index + 1}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {roleScopes.map((role, index) => (
          <article
            key={role.role}
            className="landing-hover border-rule bg-sheet rounded-[18px] border p-4"
          >
            <span className={`mb-3 block h-1 w-8 rounded-full ${roleBars[index]}`} aria-hidden="true" />
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-ink text-[12.5px] font-semibold">{role.role}</h3>
              <span className="text-ink-subtle font-mono text-[8px]">{role.count} permissions</span>
            </div>
            <p className="text-ink-muted mt-2 text-[11px] leading-[1.55]">{role.summary}</p>
            <ul className="border-rule-soft mt-3 space-y-1.5 border-t pt-3">
              {role.can.slice(0, 2).map((permission) => (
                <li key={permission} className="text-ink-secondary flex items-start gap-1.5 text-[10.5px] leading-[1.45]">
                  <Check size={10} weight="bold" className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  {permission}
                </li>
              ))}
            </ul>
            <p className="text-ink-subtle mt-3 text-[9.5px]">Server-enforced, not hidden in the interface.</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/*======================================================================
  Workflow path
====================================================================== */

const workflow = [
  {
    title: 'Book',
    state: 'Scheduled',
    body: 'Patient, procedure, priority, theatre and time become one record.',
    icon: CalendarBlank,
  },
  {
    title: 'Prepare',
    state: 'Confirmed',
    body: 'Team, set and room are attached. Overlaps are refused.',
    icon: FirstAidKit,
  },
  {
    title: 'Operate',
    state: 'In progress',
    body: 'The live board carries room state, team and case context.',
    icon: Pulse,
  },
  {
    title: 'Close',
    state: 'Closed',
    body: 'Completion, delay or cancellation stays in the record.',
    icon: CheckCircle,
  },
] as const;

export function WorkflowPath() {
  return (
    <div className="bg-rail relative overflow-hidden rounded-[26px] px-5 py-7 text-white sm:px-8 sm:py-8">
      <div aria-hidden="true" className="landing-dark-grid absolute inset-0 opacity-50" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[8.5px] tracking-[0.12em] text-white/55">FROM REQUEST TO RECORD</p>
          <span className="text-brand-lavender font-mono text-[8px] tracking-[0.08em]">CASE STATE / 04</span>
        </div>

        <ol className="relative mt-7 grid gap-6 lg:grid-cols-4 lg:gap-5">
          <span
            aria-hidden="true"
            className="absolute top-4 bottom-4 left-[19px] w-px bg-white/15 lg:top-5 lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto"
          />
          {workflow.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative pl-12 lg:pl-0">
                <span className="border-brand-lavender/35 bg-rail text-brand-lavender relative z-10 flex h-10 w-10 items-center justify-center rounded-full border lg:mb-5">
                  <Icon size={16} weight="duotone" aria-hidden="true" />
                </span>
                <div className="lg:mt-0">
                  <p className="text-brand-lavender font-mono text-[9.5px] tracking-[0.06em]">{step.state}</p>
                  <h3 className="font-display mt-1 text-[24px] leading-none">{step.title}</h3>
                  <p className="mt-2 max-w-[26ch] text-[11px] leading-[1.6] text-white/55">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/12 pt-4 text-[10px] text-white/60">
          <span className="flex items-center gap-1.5">
            <Warning size={12} className="text-warning" aria-hidden="true" />
            Delayed keeps its recorded reason.
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-brand-lavender" aria-hidden="true" />
            Cancelled closes the case without deleting it.
          </span>
          <span className="ml-auto font-mono text-[8px] text-white/60">ATTRIBUTED AT EVERY TRANSITION</span>
        </div>
      </div>
    </div>
  );
}

/*======================================================================
  Module directory
====================================================================== */

const moduleIcons = {
  dashboard: SquaresFour,
  'ot-rooms': DoorOpen,
  schedules: CalendarBlank,
  doctors: Stethoscope,
  patients: UserCircle,
  equipment: FirstAidKit,
  departments: Buildings,
  alerts: Bell,
  accounts: UsersThree,
  audit: ClockCounterClockwise,
} as const;

const moduleSummaries: Record<string, string> = {
  dashboard: 'Open cases, room state and the attention list.',
  'ot-rooms': 'Room identity, capacity and current state.',
  schedules: 'Procedure, time, team and equipment in one booking.',
  doctors: 'Specialty, department and assigned cases.',
  patients: 'Registry identity and the clinical record.',
  equipment: 'Sets, devices, readiness and maintenance.',
  departments: 'Heads, members, rooms and ownership.',
  alerts: 'Decisions, ownership and resolution.',
  accounts: 'Verification, approval and role.',
  audit: 'Actor, action, entity and time.',
};

const moduleAccents = [
  'bg-primary-soft text-primary',
  'bg-success-soft text-success',
  'bg-brass-soft text-primary-active',
  'bg-warning-soft text-warning',
  'bg-surface-muted text-ink-muted',
];

export function ModuleAtlas() {
  return (
    <div className="grid gap-x-10 md:grid-cols-2">
      {modules.map((module, index) => {
        const Icon = moduleIcons[module.id as keyof typeof moduleIcons] ?? SquaresFour;
        return (
          <article
            key={module.id}
            className="group border-rule hover:border-rule-strong grid grid-cols-[42px_minmax(0,1fr)] gap-4 border-t py-5 transition-colors last:border-b md:[&:nth-last-child(-n+2)]:border-b"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-[11px] ${moduleAccents[index % moduleAccents.length]}`}>
              <Icon size={18} weight="duotone" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-ink group-hover:text-primary text-[14px] font-semibold transition-colors">
                  {module.name}
                </h3>
                <span className="text-ink-subtle font-mono text-[8px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="text-ink-muted mt-1 text-[12.5px] leading-[1.55]">
                {moduleSummaries[module.id] ?? module.owns}
              </p>
              <p className="text-ink-subtle mt-1.5 text-[10px]">{module.users}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
