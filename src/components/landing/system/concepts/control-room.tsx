'use client';

import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import {
  auditEvents,
  caseStatusTone,
  type CaseBlock,
  DAY_END,
  DAY_START,
  equipmentRegister,
  priorityTone,
  roomConditionTone,
  theatreRooms,
} from './concept-data';

/*======================================================================
  Concept A — Digital theatre control room
  ----------------------------------------------------------------------
  The page is an instrument, not a brochure. A room rail, one day lane
  for the selected theatre, and a context column share one console.
  Selecting a room re-reads the lane; selecting a case re-reads people,
  sets and the audit trail. A room hold can be placed and released to
  show resource allocation happening against the same record.

  Dark is the material, not a theme: the console is the first and almost
  the only thing on the page. A short operator legend and the CTA sit
  below the fold so the product can be evaluated before it is sold.
====================================================================== */

const ACCENT = '#e2b268';
const SIGNAL = '#77d6ad';
const ALERT = '#f08a7e';
const LINE = 'rgba(224, 238, 229, 0.13)';

const toneColour: Record<string, string> = {
  attention: ACCENT,
  positive: SIGNAL,
  info: '#9fc6d8',
  critical: ALERT,
  neutral: '#b7c4ba',
};

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function StateTag({
  label,
  tone,
  dot = true,
}: {
  label: string;
  tone: keyof typeof toneColour;
  dot?: boolean;
}) {
  const colour = toneColour[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[2px] border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase"
      style={{ borderColor: `${colour}55`, color: colour, backgroundColor: `${colour}12` }}
    >
      {dot ? (
        <span
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: colour }}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  );
}

function CaseRow({
  block,
  selected,
  onSelect,
}: {
  block: CaseBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  const colour = toneColour[caseStatusTone[block.status]];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b px-1 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e2b268]"
      style={{ borderColor: LINE, backgroundColor: selected ? 'rgba(226,178,104,0.06)' : 'transparent' }}
    >
      <span className="tnum font-mono text-[11px] text-white/55">{block.start}</span>
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] text-white/90">{block.procedure}</span>
        <span className="mt-0.5 block truncate font-mono text-[9px] tracking-[0.04em] text-white/35 uppercase">
          {block.patientCode} · {block.priority} · {block.endMin - block.startMin} min
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span
          className="h-5 w-[2px] shrink-0"
          style={{ backgroundColor: colour }}
          aria-hidden="true"
        />
        <span className="w-[4.5rem] shrink-0 truncate text-right font-mono text-[9px] text-white/50">
          {block.status}
        </span>
      </span>
    </button>
  );
}


const tabs = ['People', 'Sets', 'Trail'] as const;
type Tab = (typeof tabs)[number];

export function ControlRoomConcept() {
  const [roomCode, setRoomCode] = React.useState('OT-01');
  const [caseId, setCaseId] = React.useState('case-2481');
  const [tab, setTab] = React.useState<Tab>('People');
  const [note, setNote] = React.useState(false);
  const [hold, setHold] = React.useState(false);
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const room = theatreRooms.find((r) => r.code === roomCode) ?? theatreRooms[0];
  const cases = room.blocks.filter((b): b is CaseBlock => b.kind === 'case');
  const selectedCase =
    cases.find((c) => c.id === caseId) ??
    (room.blocks.find((b): b is CaseBlock => b.kind === 'case') as CaseBlock);

  const counts = {
    rooms: theatreRooms.length,
    running: theatreRooms.filter((r) => r.condition === 'In progress').length,
    held: theatreRooms.filter((r) => r.condition === 'Delayed' || r.condition === 'Turnover').length,
    available: theatreRooms.filter((r) => r.condition === 'Available').length,
  };

  const nowPct = ((9 * 60 + 42 - DAY_START) / (DAY_END - DAY_START)) * 100;

  const sets = selectedCase.equipment.map((item) => {
    const record = equipmentRegister.find((e) => e.name === item.name);
    return { ...item, location: record?.location ?? '—', serial: record?.serial ?? '—' };
  });

  function moveTab(direction: 1 | -1) {
    const index = tabs.indexOf(tab);
    const next = (index + direction + tabs.length) % tabs.length;
    setTab(tabs[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="min-h-screen bg-[#0a1210] font-sans text-[#e6eee8]">
      <style>{`
        @keyframes cr-blink { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
        @keyframes cr-in { from { opacity: 0; transform: translateY(3px) } to { opacity: 1; transform: none } }
        .cr-in { animation: cr-in .22s ease-out both }
        .cr-blink { animation: cr-blink 2.4s steps(1, end) infinite }
        @media (prefers-reduced-motion: reduce) {
          .cr-in, .cr-blink { animation: none !important }
          * { scroll-behavior: auto !important; transition-duration: 0.01ms !important }
        }
      `}</style>

      <a
        href="#control-console"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#e2b268] focus:px-3 focus:py-2 focus:text-[#0a1210]"
      >
        Skip to the console
      </a>

      <header className="border-b border-white/10" style={{ borderColor: LINE }}>
        <div className="mx-auto flex max-w-[108rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Wordmark tone="chalk" size="sm" href="/design-system" />
            <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden="true" />
            <p className="hidden font-mono text-[10px] tracking-[0.16em] text-white/45 uppercase sm:block">
              Theatre control · concept A
            </p>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {[
              ['Running', counts.running],
              ['Held / turnover', counts.held],
              ['Available', counts.available],
            ].map(([label, value]) => (
              <p key={String(label)} className="flex items-baseline gap-2">
                <span className="tnum text-[15px] text-white/90">{value}</span>
                <span className="font-mono text-[9px] tracking-[0.12em] text-white/40 uppercase">
                  {label}
                </span>
              </p>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-[2px] border border-white/15 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-white/45 uppercase sm:inline">
              Sample day · preview
            </span>
            <Link
              href="/design-system"
              className="rounded-[2px] border border-white/20 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em] text-white/70 uppercase hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b268]"
            >
              Concepts
            </Link>
          </div>
        </div>
      </header>

      <main
        id="control-console"
        className="mx-auto grid max-w-[108rem] grid-cols-1 gap-0 px-0 lg:grid-cols-[15rem_minmax(0,1fr)_23rem] lg:px-6"
      >
        {/* — Room rail ------------------------------------------------ */}
        <aside
          className="min-w-0 border-b px-4 py-4 lg:min-h-[calc(100vh-57px)] lg:border-r lg:border-b-0 lg:px-0 lg:pr-5"
          style={{ borderColor: LINE }}
          aria-label="Theatre selection"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-[10px] tracking-[0.18em] text-white/45 uppercase">
              Theatres · 4
            </h2>
            <span className="font-mono text-[10px] text-white/30">09:42</span>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {theatreRooms.map((r) => {
              const active = r.code === roomCode;
              return (
                <button
                  key={r.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setRoomCode(r.code);
                    const first = r.blocks.find((b): b is CaseBlock => b.kind === 'case');
                    if (first) setCaseId(first.id);
                    setHold(false);
                  }}
                  className={`group relative shrink-0 rounded-[2px] border px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e2b268] lg:w-full lg:border-x-0 lg:border-t-0 lg:border-b lg:border-l-2 lg:bg-transparent lg:px-3 lg:py-3 ${
                    active
                      ? 'border-[#e2b268]/60 bg-white/[0.06]'
                      : 'border-white/10 bg-transparent hover:bg-white/[0.03]'
                  }`}
                  style={{ borderLeftColor: active ? ACCENT : undefined }}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-white/85">
                      {r.code}
                    </span>
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: toneColour[roomConditionTone[r.condition]] }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block truncate text-[12px] text-white/65">{r.specialty}</span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="h-[2px] flex-1 bg-white/10" aria-hidden="true">
                      <span
                        className="block h-full"
                        style={{
                          width: `${r.occupancy}%`,
                          backgroundColor: toneColour[roomConditionTone[r.condition]],
                        }}
                      />
                    </span>
                    <span className="tnum font-mono text-[9px] text-white/40">{r.occupancy}%</span>
                  </span>
                  <span className="mt-1.5 block font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: toneColour[roomConditionTone[r.condition]] }}>
                    {r.condition}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 hidden border-t pt-3 lg:block" style={{ borderColor: LINE }}>
            <p className="flex items-center justify-between font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">
              Suite state
              <span className="flex items-center gap-1.5 text-[#77d6ad]">
                <span className="cr-blink h-1 w-1 rounded-full bg-[#77d6ad]" aria-hidden="true" />
                Nominal
              </span>
            </p>
            <p className="mt-2 text-[11px] leading-[1.5] text-white/40">
              Selecting a theatre rewrites this lane. Nothing is fetched or saved.
            </p>
          </div>
        </aside>

        {/* — Day lane and case context -------------------------------- */}
        <section className="min-w-0 border-b px-4 py-5 lg:border-r lg:border-b-0 lg:px-6" style={{ borderColor: LINE }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
                {room.department} · {room.capacity} capacity
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h1 className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-none font-semibold tracking-[-0.02em] text-white">
                  {room.code}
                </h1>
                <p className="text-[15px] text-white/55">{room.specialty}</p>
              </div>
              <p className="mt-2 max-w-[46ch] text-[12.5px] leading-[1.5] text-white/45">
                {room.conditionDetail}. {room.nextEvent}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StateTag label={room.condition} tone={roomConditionTone[room.condition]} />
              <span className="rounded-[2px] border border-white/12 px-2 py-1 font-mono text-[10px] text-white/50">
                Turnover {room.turnover}
              </span>
              <button
                type="button"
                onClick={() => setHold((v) => !v)}
                aria-pressed={hold}
                className="rounded-[2px] border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.06em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b268]"
                style={{
                  borderColor: hold ? ACCENT : 'rgba(255,255,255,0.2)',
                  color: hold ? ACCENT : 'rgba(255,255,255,0.7)',
                  backgroundColor: hold ? 'rgba(226,178,104,0.1)' : 'transparent',
                }}
              >
                {hold ? 'Release room hold' : 'Place 30-minute hold'}
              </button>
            </div>
          </div>

          {/* Inventory strip */}
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border sm:grid-cols-4" style={{ borderColor: LINE, backgroundColor: LINE }}>
            {[
              ['Occupancy', `${room.occupancy}%`],
              ['Cases today', String(cases.length)],
              ['Instruments', `${selectedCase.equipment.length} assigned`],
              ['Room state', room.condition],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#0c1513] px-3 py-2.5">
                <dt className="font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">{label}</dt>
                <dd className="mt-1 text-[12px] text-white/80">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Day strip + case list */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[10px] tracking-[0.16em] text-white/45 uppercase">
                Theatre day · 08:00 – 16:00
              </h2>
              <span className="font-mono text-[9px] tracking-[0.1em] text-white/30 uppercase">
                Sample schedule
              </span>
            </div>

            <div className="relative mt-2 hidden sm:block">
              <div className="flex justify-between border-b pb-1" style={{ borderColor: LINE }}>
                {['08:00', '10:00', '12:00', '14:00', '16:00'].map((h) => (
                  <span key={h} className="font-mono text-[9px] text-white/30">
                    {h}
                  </span>
                ))}
              </div>

              <div
                className="relative mt-2 h-12 border"
                style={{ borderColor: LINE, backgroundColor: 'rgba(255,255,255,0.015)' }}
              >
                <div className="absolute inset-0" aria-hidden="true">
                  {[10, 12, 14].map((h) => (
                    <span
                      key={h}
                      className="absolute top-0 bottom-0 w-px bg-white/[0.07]"
                      style={{ left: `${((h * 60 - DAY_START) / (DAY_END - DAY_START)) * 100}%` }}
                    />
                  ))}
                </div>

                {room.blocks.map((block) => {
                  const caseBlock = block.kind === 'case';
                  const colour = caseBlock
                    ? toneColour[caseStatusTone[block.status]]
                    : 'rgba(255,255,255,0.35)';
                  const selected = caseBlock && block.id === selectedCase.id;
                  return (
                    <div
                      key={block.id}
                      title={`${caseBlock ? block.procedure : block.label} · ${block.start}–${block.end}`}
                      className="absolute top-2 bottom-2 rounded-[2px] border"
                      style={{
                        left: `${((block.startMin - DAY_START) / (DAY_END - DAY_START)) * 100}%`,
                        width: `${((block.endMin - block.startMin) / (DAY_END - DAY_START)) * 100}%`,
                        borderColor: caseBlock
                          ? selected
                            ? ACCENT
                            : `${colour}66`
                          : 'rgba(255,255,255,0.16)',
                        borderStyle: caseBlock ? 'solid' : 'dashed',
                        backgroundColor: caseBlock
                          ? selected
                            ? `${colour}40`
                            : `${colour}1f`
                          : 'rgba(255,255,255,0.025)',
                      }}
                      aria-hidden="true"
                    />
                  );
                })}

                {hold ? (
                  <div
                    className="cr-in absolute top-1.5 bottom-1.5 z-10 rounded-[2px] border"
                    style={{
                      left: `${((14 * 60 - DAY_START) / (DAY_END - DAY_START)) * 100}%`,
                      width: `${(30 / (DAY_END - DAY_START)) * 100}%`,
                      borderColor: ACCENT,
                      backgroundColor: 'rgba(226,178,104,0.26)',
                    }}
                    title="Provisional hold · 14:00–14:30"
                    aria-hidden="true"
                  />
                ) : null}

                <div
                  className="pointer-events-none absolute -top-1 bottom-0 z-20 w-px"
                  style={{ left: `${nowPct}%`, backgroundColor: 'rgba(255,255,255,0.55)' }}
                  aria-hidden="true"
                >
                  <span className="absolute -top-[15px] left-0 -translate-x-1/2 bg-[#0a1210] px-1 font-mono text-[8px] tracking-[0.08em] text-white/60">
                    09:42
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <p className="font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">
                Cases and holds
              </p>
              <p className="hidden font-mono text-[9px] tracking-[0.06em] text-white/25 uppercase sm:block">
                Strip = booked time · select a row
              </p>
            </div>

            <ul className="mt-1 border-t" style={{ borderColor: LINE }} aria-label={`Cases and holds in ${room.code}`}>
              {room.blocks.map((block) =>
                block.kind === 'case' ? (
                  <li key={block.id}>
                    <CaseRow
                      block={block}
                      selected={block.id === selectedCase.id}
                      onSelect={() => setCaseId(block.id)}
                    />
                  </li>
                ) : (
                  <li
                    key={block.id}
                    className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b px-1 py-2.5"
                    style={{ borderColor: LINE }}
                  >
                    <span className="tnum font-mono text-[11px] text-white/35">{block.start}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11.5px] text-white/45">{block.label}</span>
                      <span className="mt-0.5 block truncate font-mono text-[9px] tracking-[0.04em] text-white/25 uppercase">
                        {block.detail}
                      </span>
                    </span>
                    <span className="pr-1 font-mono text-[9px] tracking-[0.06em] text-white/30 uppercase">
                      Hold
                    </span>
                  </li>
                )
              )}

              {hold ? (
                <li
                  className="cr-in grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b px-1 py-2.5"
                  style={{ borderColor: LINE, backgroundColor: 'rgba(226,178,104,0.05)' }}
                >
                  <span className="tnum font-mono text-[11px]" style={{ color: ACCENT }}>14:00</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px]" style={{ color: ACCENT }}>
                      Provisional room hold
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] tracking-[0.04em] text-white/30 uppercase">
                      30 minutes · not saved
                    </span>
                  </span>
                  <span className="pr-1 font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color: ACCENT }}>
                    Held
                  </span>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Case context */}
          <div className="mt-6 border-t pt-4" style={{ borderColor: LINE }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] tracking-[0.14em] text-white/35 uppercase">
                  Selected case · {selectedCase.patientCode}
                </p>
                <h2 id="selected-case-title" className="mt-1 text-[17px] leading-snug font-medium text-white">
                  {selectedCase.procedure}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StateTag label={selectedCase.status} tone={caseStatusTone[selectedCase.status]} />
                <StateTag
                  label={selectedCase.priority}
                  tone={priorityTone[selectedCase.priority]}
                  dot={false}
                />
              </div>
            </div>

            <p className="mt-2 max-w-[62ch] text-[12.5px] leading-[1.6] text-white/50">
              {selectedCase.note}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.04em] text-white/40">
              <span>{selectedCase.start} – {selectedCase.end}</span>
              <span>{room.code}</span>
              <span>{fmt(selectedCase.endMin - selectedCase.startMin)} min booked</span>
              <button
                type="button"
                onClick={() => setNote((v) => !v)}
                aria-expanded={note}
                className="underline decoration-white/25 underline-offset-4 hover:text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b268]"
              >
                {note ? 'Hide record field' : 'Show record field'}
              </button>
            </div>

            {note ? (
              <div className="cr-in mt-3 grid gap-px overflow-hidden rounded-[2px] border text-[11px] md:grid-cols-2" style={{ borderColor: LINE, backgroundColor: LINE }}>
                <p className="bg-[#0c1513] px-3 py-2 text-white/60">
                  <span className="font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">Clinical note · field</span>
                  <span className="mt-1 block">Recorded against the case; access follows the reader&apos;s role scope.</span>
                </p>
                <p className="bg-[#0c1513] px-3 py-2 text-white/60">
                  <span className="font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">Conflict check</span>
                  <span className="mt-1 block">Theatre, team and set were checked before confirmation.</span>
                </p>
              </div>
            ) : null}

            <dl className="mt-4 grid gap-px overflow-hidden border sm:grid-cols-3" style={{ borderColor: LINE, backgroundColor: LINE }}>
              {[
                ['Team', '4 of 5 roles held', 'Recovery handover still open'],
                ['Sets', `${selectedCase.equipment.length} assigned`, 'Back-up held in store'],
                ['Record', '5 entries today', 'Last write 09:42'],
              ].map(([label, value, detail]) => (
                <div key={label} className="bg-[#0c1513] px-3 py-2.5">
                  <dt className="font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">{label}</dt>
                  <dd className="mt-1 text-[12px] text-white/80">{value}</dd>
                  <dd className="mt-0.5 font-mono text-[9px] tracking-[0.03em] text-white/35">{detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t pt-3" style={{ borderColor: LINE }}>
              <p className="text-[11.5px] text-white/45">
                <span className="font-mono text-[9px] tracking-[0.1em] text-white/30 uppercase">Next · </span>
                {room.nextEvent}
              </p>
              <p className="font-mono text-[9px] tracking-[0.06em] text-white/30 uppercase">
                {room.capacity} capacity · {room.turnover} turnover
              </p>
            </div>
          </div>
        </section>

        {/* — Context column ------------------------------------------- */}
        <aside className="min-w-0 px-4 py-5 lg:px-5" aria-label="Selected case context">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
              Case context
            </h2>
            <span className="rounded-[2px] border border-white/12 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] text-white/35 uppercase">
              Preview
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Case context"
            className="mt-3 grid grid-cols-3 border"
            style={{ borderColor: LINE }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveTab(1);
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveTab(-1);
              }
            }}
          >
            {tabs.map((item, index) => (
              <button
                key={item}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                role="tab"
                type="button"
                id={`cr-tab-${item}`}
                aria-selected={tab === item}
                aria-controls={`cr-panel-${item}`}
                tabIndex={tab === item ? 0 : -1}
                onClick={() => setTab(item)}
                className={`py-2 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e2b268] ${
                  tab === item ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`cr-panel-${tab}`}
            aria-labelledby={`cr-tab-${tab}`}
            className="mt-3 min-h-[19rem] border-t"
            style={{ borderColor: LINE }}
          >
            {tab === 'People' ? (
              <ul className="divide-y" style={{ borderColor: LINE }}>
                {[
                  ['Surgeon', selectedCase.surgeon, true],
                  ['Anaesthetist', selectedCase.anaesthetist, true],
                  ['Scrub', selectedCase.scrub, true],
                  ['Circulating', selectedCase.circulating, true],
                  ['Recovery', selectedCase.recovery, false],
                ].map(([role, detail, held]) => (
                  <li key={String(role)} className="flex items-start gap-3 py-2.5">
                    <span className="mt-1 w-24 shrink-0 font-mono text-[9px] tracking-[0.08em] text-white/35 uppercase">
                      {role}
                    </span>
                    <span className="min-w-0 flex-1 text-[11.5px] leading-[1.5] text-white/70">{detail}</span>
                    <span
                      className="mt-1 shrink-0 font-mono text-[9px] tracking-[0.06em] uppercase"
                      style={{ color: held ? SIGNAL : ACCENT }}
                    >
                      {held ? 'Held' : 'Open'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {tab === 'Sets' ? (
              <ul className="divide-y" style={{ borderColor: LINE }}>
                {sets.map((item) => (
                  <li key={item.name} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[12px] text-white/80">{item.name}</p>
                      <span
                        className="font-mono text-[9px] tracking-[0.06em] uppercase"
                        style={{
                          color:
                            item.state === 'Assigned'
                              ? SIGNAL
                              : item.state === 'Maintenance'
                                ? ALERT
                                : ACCENT,
                        }}
                      >
                        {item.state}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.05em] text-white/35 uppercase">
                      {item.serial} · {item.location}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            {tab === 'Trail' ? (
              <ol className="divide-y" style={{ borderColor: LINE }}>
                {auditEvents.slice(0, 5).map((event) => (
                  <li key={`${event.time}-${event.entity}`} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[10px] text-white/50">{event.time}</span>
                      <span className="font-mono text-[9px] tracking-[0.08em] text-white/35 uppercase">
                        {event.action}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-[1.45] text-white/70">{event.detail}</p>
                    <p className="mt-0.5 font-mono text-[9px] tracking-[0.04em] text-white/30 uppercase">
                      {event.actor}
                    </p>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>

          <div className="mt-4 border-t pt-3" style={{ borderColor: LINE }}>
            <dl className="space-y-1.5">
              {[
                ['Next event', room.nextEvent],
                ['Turnover', room.turnover],
                ['Capacity', `${room.capacity} in room`],
                ['Department', room.department],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <dt className="font-mono text-[9px] tracking-[0.1em] text-white/30 uppercase">{label}</dt>
                  <dd className="max-w-[70%] text-right text-[10.5px] leading-[1.4] text-white/55">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 border-t pt-2.5 font-mono text-[9px] leading-[1.6] tracking-[0.06em] text-white/30 uppercase" style={{ borderColor: LINE }}>
              Sample theatre day · not live data. Every selection is local; no request
              leaves this page.
            </p>
            <Link
              href="/login"
              className="mt-3 flex items-center justify-between border px-3 py-2.5 text-[12px] transition-colors hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b268]"
              style={{ borderColor: 'rgba(226,178,104,0.55)', color: ACCENT }}
            >
              Open the real console
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>
      </main>

      {/* — Operator legend ------------------------------------------- */}
      <section className="border-t" style={{ borderColor: LINE }}>
        <div className="mx-auto grid max-w-[108rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#e2b268] uppercase">
              Why a console
            </p>
            <p className="mt-3 max-w-[40ch] text-[19px] leading-[1.35] font-medium text-white">
              A theatre is read in one glance: what is open, what is held, who is
              in the room, and what happens next.
            </p>
            <p className="mt-3 max-w-[46ch] text-[12.5px] leading-[1.65] text-white/45">
              This concept makes that glance the landing page. The room rail, the day
              lane and the case context are the same three objects an operations lead
              uses at 09:42, not a marketing arrangement of the product.
            </p>
          </div>

          {[
            {
              title: 'From the schema',
              lines: [
                'OTRoom · status, capacity, department',
                'Schedule · six states, three priorities',
                'ScheduleStaff and ScheduleEquipment',
                'AuditLog · actor, entity, action, time',
              ],
            },
            {
              title: 'Interaction contract',
              lines: [
                'Select a theatre: lane and case re-read',
                'Select a case: people, sets, trail re-read',
                'Tabs are keyboard-arrow navigable',
                'Room hold is local and labelled provisional',
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.lines.map((line) => (
                  <li key={line} className="flex gap-2.5 text-[12px] leading-[1.5] text-white/55">
                    <span className="mt-2 h-px w-3 shrink-0 bg-white/20" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t" style={{ borderColor: LINE }}>
          <div className="mx-auto flex max-w-[108rem] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <p className="font-mono text-[9px] tracking-[0.12em] text-white/30 uppercase">
              Concept A · Digital theatre control room · synthetic records
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/design-system/concept-journey"
                className="border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] text-white/55 uppercase hover:text-white"
                style={{ borderColor: LINE }}
              >
                Concept B → Case journey
              </Link>
              <Link
                href="/design-system/concept-suite"
                className="border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] text-white/55 uppercase hover:text-white"
                style={{ borderColor: LINE }}
              >
                Concept C → Suite plan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
