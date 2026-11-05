'use client';

import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import {
  suiteRegionLabel,
  suiteRegions,
  theatreRooms,
  type CaseBlock,
  type SuiteRegion,
} from './concept-data';

/*======================================================================
  Concept C — Interactive hospital suite
  ----------------------------------------------------------------------
  A drawing sheet, not a hero. The suite is one plan: four theatres over
  a clean corridor, sterile services, anaesthesia, team base, recovery and
  the equipment store below it. Every region is selectable, keyboard
  reachable, and carries a contextual record beside the drawing. Choosing
  a theatre draws the route its instrument set takes from the store.

  The plan stays a plan at every width: below 900px it pans inside its
  own frame rather than shrinking labels into illegibility, and the region
  index below it offers the same selection without precision tapping.
====================================================================== */

const INK = '#232a25';
const PAPER = '#f0f1ec';
const RULE = '#c9ccc0';
const MUTED = '#6b7267';
const RUST = '#b4482c';
const GREEN = '#2f6b4a';
const AMBER = '#8a611c';

const conditionColour: Record<string, string> = {
  'In progress': AMBER,
  Available: GREEN,
  Turnover: '#2f5566',
  Delayed: RUST,
};

type Layer = 'state' | 'resources' | 'team';

const layers: { id: Layer; label: string; note: string }[] = [
  { id: 'state', label: 'Room state', note: 'What each room is doing now' },
  { id: 'resources', label: 'Equipment', note: 'Sets and devices held by each region' },
  { id: 'team', label: 'Teams', note: 'Role coverage by region' },
];

function regionSecondary(region: SuiteRegion, layer: Layer) {
  if (region.kind === 'theatre') {
    const room = theatreRooms.find((r) => r.code === region.roomCode);
    if (!room) return '';
    if (layer === 'state') return room.condition.toUpperCase();
    if (layer === 'resources') return `${room.blocks.filter((b) => b.kind === 'case').length} CASES · SET HELD`;
    return `${room.capacity} IN ROOM · 5 ROLES`;
  }
  if (layer === 'state') {
    if (region.kind === 'anaesthesia') return '3 / 4 WINDOWS';
    if (region.kind === 'sterile') return '2 RELEASES';
    if (region.kind === 'team') return 'ROLE SCOPES';
    if (region.kind === 'recovery') return '2 PENDING';
    return '6 ON REGISTER';
  }
  if (layer === 'resources') {
    if (region.kind === 'sterile') return 'L-07 · P-01';
    if (region.kind === 'equipment') return 'A-08 · T-05';
    if (region.kind === 'anaesthesia') return '2 MACHINES';
    if (region.kind === 'recovery') return '4 BEDS';
    return '—';
  }
  if (region.kind === 'team') return '12 CLINICIANS';
  if (region.kind === 'recovery') return '3 ASSIGNED';
  if (region.kind === 'sterile') return '2 TECHNICIANS';
  if (region.kind === 'anaesthesia') return '3 ANAESTHETISTS';
  return '1 TECHNICIAN';
}

function regionStatusLabel(region: SuiteRegion) {
  if (region.kind === 'theatre') {
    const room = theatreRooms.find((r) => r.code === region.roomCode);
    return room?.condition ?? '—';
  }
  return suiteRegionLabel[region.kind];
}

/* The set route runs from the sterile store, along the corridor, into the
   selected theatre. It is a drawing, not a live location feed. */
function routePath(region: SuiteRegion | undefined) {
  if (!region || region.kind !== 'theatre') return null;
  const sterile = suiteRegions.find((r) => r.kind === 'sterile');
  if (!sterile) return null;
  const startX = sterile.x + sterile.w / 2;
  const endX = region.x + region.w / 2;
  return `M ${startX} ${sterile.y} L ${startX} 340 L ${endX} 340 L ${endX} ${region.y + region.h}`;
}

export function SuitePlanConcept() {
  const [selectedId, setSelectedId] = React.useState('ot-01');
  const [layer, setLayer] = React.useState<Layer>('state');
  const selected = suiteRegions.find((r) => r.id === selectedId) ?? suiteRegions[0];
  const selectedRoom = selected.roomCode
    ? theatreRooms.find((r) => r.code === selected.roomCode)
    : undefined;
  const path = routePath(selected);

  const selectRegion = (id: string) => setSelectedId(id);

  function onRegionKey(event: React.KeyboardEvent<SVGGElement>, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectRegion(id);
    }
  }

  function step(direction: 1 | -1) {
    const index = suiteRegions.findIndex((r) => r.id === selectedId);
    const next = (index + direction + suiteRegions.length) % suiteRegions.length;
    setSelectedId(suiteRegions[next].id);
  }

  const selectedIndex = suiteRegions.findIndex((r) => r.id === selected.id);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: PAPER, color: INK }}>
      <style>{`
        .suite-serif { font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif; }
        .suite-region { cursor: pointer; outline: none; }
        .suite-region .suite-frame { transition: stroke .15s ease, fill .15s ease; }
        .suite-region:hover .suite-frame { stroke: ${INK}; }
        .suite-region:focus-visible .suite-frame { stroke: ${RUST}; stroke-width: 3; }
        .suite-region:focus-visible .suite-hit { stroke: ${RUST}; stroke-width: 2; stroke-dasharray: 4 4; }
        @keyframes suite-route { to { stroke-dashoffset: -18 } }
        .suite-route { animation: suite-route 1.6s linear infinite; }
        @keyframes suite-in { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        .suite-in { animation: suite-in .2s ease-out both }
        @media (prefers-reduced-motion: reduce) {
          .suite-route, .suite-in { animation: none !important }
          * { transition-duration: 0.01ms !important; scroll-behavior: auto !important }
        }
      `}</style>

      <a
        href="#suite-plan"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#232a25] focus:px-3 focus:py-2 focus:text-[#f0f1ec]"
      >
        Skip to the suite plan
      </a>

      <header className="sticky top-0 z-40 border-b" style={{ borderColor: RULE, backgroundColor: 'rgba(240,241,236,0.95)' }}>
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <Wordmark size="sm" href="/design-system" />
            <span className="hidden h-4 w-px sm:block" style={{ backgroundColor: RULE }} aria-hidden="true" />
            <p className="hidden font-mono text-[9px] tracking-[0.16em] uppercase sm:block" style={{ color: MUTED }}>
              Concept C · interactive suite
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden font-mono text-[9px] tracking-[0.1em] uppercase md:block" style={{ color: MUTED }}>
              Level 02 · theatre suite · sheet 01
            </p>
            <Link
              href="/design-system"
              className="border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.1em] uppercase transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4482c]"
              style={{ borderColor: RULE, color: INK }}
            >
              Concepts
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* — Sheet introduction -------------------------------------- */}
        <section className="mx-auto max-w-[92rem] px-5 pt-8 pb-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[9.5px] tracking-[0.2em] uppercase" style={{ color: RUST }}>
                Spatial browsing · operating suite
              </p>
              <h1 className="mt-3 max-w-[20ch] font-display text-[clamp(2rem,3.6vw,2.9rem)] leading-[1.02] font-semibold tracking-[-0.02em]">
                Navigate the suite,
                <br />
                not a feature list.
              </h1>
            </div>
            <p className="max-w-[48ch] text-[13px] leading-[1.7]" style={{ color: '#4b534b' }}>
              Four theatres, a sterile store, an anaesthesia bay, the team base and
              recovery — one plan, the same plan the product uses to reason about rooms
              and sets. Select any region to read its record.
            </p>
          </div>

          {/* layer switch + legend */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-y py-2.5" style={{ borderColor: RULE }}>
            <div role="group" aria-label="Plan annotations" className="flex items-center gap-1">
              {layers.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLayer(item.id)}
                  aria-pressed={layer === item.id}
                  className="border px-2 py-1 font-mono text-[9px] tracking-[0.08em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4482c]"
                  style={{
                    borderColor: layer === item.id ? INK : 'transparent',
                    backgroundColor: layer === item.id ? INK : 'transparent',
                    color: layer === item.id ? PAPER : MUTED,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="hidden font-mono text-[9px] tracking-[0.06em] uppercase sm:block" style={{ color: MUTED }}>
              {layers.find((l) => l.id === layer)?.note}
            </p>

            <div className="ml-auto flex flex-wrap items-center gap-3 font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color: MUTED }}>
              {[
                ['In progress', AMBER],
                ['Turnover', '#2f5566'],
                ['Available', GREEN],
                ['Held', RUST],
              ].map(([label, colour]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5" style={{ backgroundColor: colour }} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* — Drawing sheet ------------------------------------------- */}
        <section id="suite-plan" className="mx-auto max-w-[92rem] scroll-mt-20 px-5 pb-4 sm:px-8">
          <div className="grid gap-0 border lg:grid-cols-[minmax(0,1fr)_21rem]" style={{ borderColor: RULE, backgroundColor: '#f7f7f2' }}>
            <div className="min-w-0 border-b lg:border-r lg:border-b-0" style={{ borderColor: RULE }}>
              <div className="flex items-center justify-between gap-3 border-b px-4 py-2" style={{ borderColor: RULE }}>
                <p className="font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: MUTED }}>
                  MedOrch · theatre suite plan · level 02
                </p>
                <p className="font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: MUTED }}>
                  <span className="sm:hidden">Drag to explore →</span>
                  <span className="hidden sm:inline">Sample · not a real hospital</span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <svg
                  viewBox="0 0 1020 600"
                  className="block h-auto w-full min-w-[720px]"
                  role="group"
                  aria-label="Theatre suite plan. Select a region to inspect its record."
                >
                  <defs>
                    <pattern id="suite-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke={RULE} strokeWidth="1" />
                    </pattern>
                    <pattern id="suite-dots" width="12" height="12" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.9" fill={RULE} />
                    </pattern>
                  </defs>

                  {/* sheet frame */}
                  <rect x="24" y="18" width="972" height="560" fill="none" stroke={RULE} strokeWidth="1" />
                  <rect x="40" y="34" width="940" height="528" fill="none" stroke={INK} strokeWidth="2" />

                  {/* title strip */}
                  <text x="40" y="60" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill={MUTED}>
                    THEATRE SUITE · 4 THEATRES · 1 STERILE STORE
                  </text>
                  <text x="980" y="60" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill={MUTED}>
                    1:100 · SAMPLE SHEET
                  </text>
                  <line x1="40" y1="72" x2="980" y2="72" stroke={RULE} strokeWidth="1" />

                  {/* corridor */}
                  <rect x="60" y="300" width="900" height="66" fill="url(#suite-dots)" opacity="0.55" />
                  <text x="76" y="336" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="2.5" fill={MUTED}>
                    CLEAN CORRIDOR · 2.4 M
                  </text>
                  <text x="964" y="336" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="2" fill={MUTED}>
                    ← STERILE / TEAM →
                  </text>

                  {/* dimension ticks */}
                  {[60, 280, 500, 720, 960].map((x) => (
                    <g key={`dim-${x}`} aria-hidden="true">
                      <line x1={x} y1="86" x2={x} y2="96" stroke={RULE} />
                    </g>
                  ))}

                  {/* regions */}
                  {suiteRegions.map((region) => {
                    const active = region.id === selected.id;
                    const secondary = regionSecondary(region, layer);
                    const tone =
                      region.kind === 'theatre'
                        ? conditionColour[theatreRooms.find((r) => r.code === region.roomCode)?.condition ?? 'Available']
                        : MUTED;

                    return (
                      <g
                        key={region.id}
                        className="suite-region"
                        role="button"
                        tabIndex={0}
                        aria-pressed={active}
                        aria-label={`${region.label}. ${suiteRegionLabel[region.kind]}. ${region.summary}`}
                        onClick={() => selectRegion(region.id)}
                        onKeyDown={(event) => onRegionKey(event, region.id)}
                      >
                        <rect
                          className="suite-frame"
                          x={region.x}
                          y={region.y}
                          width={region.w}
                          height={region.h}
                          fill={active ? 'rgba(180,72,44,0.06)' : region.kind === 'sterile' ? 'url(#suite-hatch)' : '#fbfbf7'}
                          stroke={active ? RUST : INK}
                          strokeWidth={active ? 2.5 : 1.5}
                        />
                        <rect
                          className="suite-hit"
                          x={region.x + 4}
                          y={region.y + 4}
                          width={region.w - 8}
                          height={region.h - 8}
                          fill="none"
                          stroke="transparent"
                        />

                        {region.kind === 'theatre' ? (
                          <g aria-hidden="true">
                            <rect x={region.x + 42} y={region.y + 96} width={116} height={38} fill="none" stroke={INK} strokeWidth="1" />
                            <rect x={region.x + 50} y={region.y + 104} width={100} height={22} fill="none" stroke={RULE} strokeWidth="1" />
                            <circle cx={region.x + 28} cy={region.y + 100} r="7" fill="none" stroke={INK} />
                            <circle cx={region.x + 28} cy={region.y + 130} r="7" fill="none" stroke={INK} />
                            <rect x={region.x + region.w - 26} y={region.y + 18} width="10" height="34" fill="none" stroke={RULE} />
                            <line x1={region.x + 30} y1={region.y + region.h} x2={region.x + 58} y2={region.y + region.h} stroke="#fbfbf7" strokeWidth="4" />
                          </g>
                        ) : null}

                        {region.kind === 'sterile' ? (
                          <g aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                              <rect key={i} x={region.x + 22} y={region.y + 92 + i * 18} width={region.w - 44} height="10" fill="none" stroke={INK} strokeWidth="0.8" />
                            ))}
                          </g>
                        ) : null}

                        {region.kind === 'recovery' ? (
                          <g aria-hidden="true">
                            {[0, 1, 2, 3].map((i) => (
                              <rect key={i} x={region.x + 16 + i * 38} y={region.y + 96} width="26" height="52" fill="none" stroke={RULE} strokeWidth="1" />
                            ))}
                          </g>
                        ) : null}

                        {region.kind === 'anaesthesia' ? (
                          <g aria-hidden="true">
                            <rect x={region.x + 22} y={region.y + 100} width="34" height="46" fill="none" stroke={INK} strokeWidth="1" />
                            <line x1={region.x + 22} y1={region.y + 112} x2={region.x + 56} y2={region.y + 112} stroke={RULE} />
                          </g>
                        ) : null}

                        {/* labels */}
                        <text
                          x={region.x + 14}
                          y={region.y + 24}
                          fontFamily="ui-monospace, monospace"
                          fontSize={region.kind === 'theatre' ? '15' : '10'}
                          letterSpacing={region.kind === 'theatre' ? '1.5' : '1.2'}
                          fill={INK}
                          fontWeight={region.kind === 'theatre' ? 600 : 500}
                        >
                          {region.kind === 'theatre' ? region.roomCode : region.label.toUpperCase()}
                        </text>
                        <text
                          x={region.x + 14}
                          y={region.y + 38}
                          fontFamily="ui-monospace, monospace"
                          fontSize="8"
                          letterSpacing="0.8"
                          fill={MUTED}
                        >
                          {region.kind === 'theatre'
                            ? (theatreRooms.find((r) => r.code === region.roomCode)?.specialty ?? '')
                            : suiteRegionLabel[region.kind]}
                        </text>

                        <text
                          x={region.x + 14}
                          y={region.y + 54}
                          fontFamily="ui-monospace, monospace"
                          fontSize="8.5"
                          letterSpacing="0.8"
                          fill={tone}
                        >
                          {secondary}
                        </text>
                        <text
                          x={region.x + 14}
                          y={region.y + 66}
                          fontFamily="ui-monospace, monospace"
                          fontSize="7"
                          letterSpacing="0.6"
                          fill={MUTED}
                        >
                          {layer === 'state'
                            ? 'ROOM STATE'
                            : layer === 'resources'
                              ? 'HELD RESOURCES'
                              : 'ROLE COVERAGE'}
                        </text>
                      </g>
                    );
                  })}

                  {/* route from sterile store to the selected theatre */}
                  {path ? (
                    <g aria-hidden="true">
                      <path
                        d={path}
                        fill="none"
                        stroke={RUST}
                        strokeWidth="1.6"
                        strokeDasharray="6 6"
                        className="suite-route"
                      />
                      <circle cx={suiteRegions[4].x + suiteRegions[4].w / 2} cy={suiteRegions[4].y} r="2.5" fill={RUST} />
                      <text
                        x={selected.x + selected.w / 2 + 8}
                        y="356"
                        fontFamily="ui-monospace, monospace"
                        fontSize="7.5"
                        letterSpacing="1"
                        fill={RUST}
                      >
                        SET ROUTE ↑
                      </text>
                    </g>
                  ) : null}
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2" style={{ borderColor: RULE }}>
                <p className="font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: MUTED }}>
                  {selected.label} · selected
                </p>
                <p className="font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: MUTED }}>
                  Pan inside the frame on narrow screens
                </p>
              </div>
            </div>

            {/* — Context panel --------------------------------------- */}
            <aside className="min-w-0 p-4 sm:p-5" aria-live="polite">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: MUTED }}>
                  Region record · {String(selectedIndex + 1).padStart(2, '0')} / {String(suiteRegions.length).padStart(2, '0')}
                </p>
                <span className="h-2 w-2" style={{ backgroundColor: RUST }} aria-hidden="true" />
              </div>

              <h2 className="suite-serif mt-2 text-[24px] leading-tight">{selected.label}</h2>
              <p className="mt-1 flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: MUTED }}>
                {suiteRegionLabel[selected.kind]}
                <span aria-hidden="true">·</span>
                {regionStatusLabel(selected)}
              </p>

              <p className="mt-3 text-[12.5px] leading-[1.6]" style={{ color: '#454d45' }}>
                {selected.summary}
              </p>

              <ul className="mt-4 divide-y border-t" style={{ borderColor: RULE }}>
                {selected.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 py-2 text-[12px] leading-[1.5]" style={{ color: '#39413b' }}>
                    <span className="mt-2 h-px w-2.5 shrink-0" style={{ backgroundColor: RUST }} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              {selectedRoom ? (
                <div className="mt-4 border-t pt-3" style={{ borderColor: RULE }}>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: MUTED }}>
                      Today in {selectedRoom.code}
                    </p>
                    <p className="font-mono text-[9px] uppercase" style={{ color: conditionColour[selectedRoom.condition] }}>
                      {selectedRoom.condition}
                    </p>
                  </div>
                  <ul className="mt-2">
                    {selectedRoom.blocks
                      .filter((block): block is CaseBlock => block.kind === 'case')
                      .map((block) => (
                        <li key={block.id} className="border-b py-2 last:border-b-0" style={{ borderColor: '#e3e4dc' }}>
                          <p className="flex items-baseline gap-2 font-mono text-[9px]" style={{ color: MUTED }}>
                            <span>{block.start}–{block.end}</span>
                            <span style={{ color: conditionColour[theatreRooms.find((r) => r.code === selectedRoom.code)?.condition ?? 'Available'] }}>
                              {block.status}
                            </span>
                          </p>
                          <p className="mt-0.5 text-[12px]" style={{ color: '#39413b' }}>
                            {block.procedure}
                          </p>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="border px-2.5 py-1.5 font-mono text-[9px] tracking-[0.06em] uppercase transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4482c]"
                  style={{ borderColor: RULE, color: INK }}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="border px-2.5 py-1.5 font-mono text-[9px] tracking-[0.06em] uppercase transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4482c]"
                  style={{ borderColor: RULE, color: INK }}
                >
                  Next region →
                </button>
              </div>

              <p className="mt-4 border-t pt-3 font-mono text-[8.5px] leading-[1.7] tracking-[0.06em] uppercase" style={{ borderColor: RULE, color: '#8b9288' }}>
                Section drawing · synthetic data. Selection is local; nothing is
                requested or saved.
              </p>
            </aside>
          </div>
        </section>

        {/* — Region index -------------------------------------------- */}
        <section className="mx-auto max-w-[92rem] px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2" style={{ borderColor: INK }}>
            <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: MUTED }}>
              Suite manifest · 9 regions
            </h2>
            <p className="font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: MUTED }}>
              Every region is a record, not a room number
            </p>
          </div>

          <div className="mt-0" role="group" aria-label="Suite regions">
            {suiteRegions.map((region, index) => {
              const active = region.id === selected.id;
              const colour =
                region.kind === 'theatre'
                  ? conditionColour[theatreRooms.find((r) => r.code === region.roomCode)?.condition ?? 'Available']
                  : MUTED;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => {
                    selectRegion(region.id);
                    document.getElementById('suite-plan')?.scrollIntoView({ block: 'start' });
                  }}
                  aria-pressed={active}
                  className="grid w-full grid-cols-[2rem_1fr_auto] items-baseline gap-3 border-b py-2.5 text-left transition-colors hover:bg-black/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b4482c] sm:grid-cols-[3rem_10rem_1fr_auto]"
                  style={{ borderColor: '#dcdfd5', backgroundColor: active ? 'rgba(180,72,44,0.045)' : 'transparent' }}
                >
                  <span className="font-mono text-[9px]" style={{ color: '#8b9288' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[12.5px] font-medium">{region.label}</span>
                  <span className="col-span-1 hidden truncate text-[11.5px] sm:block" style={{ color: MUTED }}>
                    {region.summary}
                  </span>
                  <span className="flex items-center justify-end gap-2 font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color: colour }}>
                    <span className="h-1.5 w-1.5" style={{ backgroundColor: colour }} aria-hidden="true" />
                    {regionStatusLabel(region)}
                    <span className="ml-2" aria-hidden="true">{active ? '●' : '○'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* — Notes --------------------------------------------------- */}
        <section className="mx-auto max-w-[92rem] px-5 pb-10 sm:px-8">
          <div className="grid gap-8 border-t-2 pt-6 lg:grid-cols-3" style={{ borderColor: INK }}>
            {[
              {
                title: 'The plan is the navigation',
                body: 'There is no menu of capabilities. The suite itself is the index: every region opens the record it holds, and the drawing keeps its spatial meaning instead of collapsing into cards.',
              },
              {
                title: 'One record, many regions',
                body: 'A theatre holds cases; the sterile store holds sets; recovery holds handovers. Selection changes the record, not the page, so the visitor learns the product by moving through it.',
              },
              {
                title: 'Drawn from the schema',
                body: 'Rooms, equipment, staff assignments, schedule states and the audit trail come from the deployed models. The plan shows their relationships; it does not invent clinical capability.',
              },
            ].map((note) => (
              <div key={note.title}>
                <h3 className="suite-serif text-[19px] leading-tight">{note.title}</h3>
                <p className="mt-2 text-[12.5px] leading-[1.65]" style={{ color: '#4b534b' }}>
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* — Title block / CTA -------------------------------------- */}
        <section className="mx-auto max-w-[92rem] px-5 pb-10 sm:px-8">
          <div className="grid border sm:grid-cols-[1fr_auto]" style={{ borderColor: INK }}>
            <div className="p-5 sm:p-6">
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: RUST }}>
                MedOrch · operating theatre orchestration
              </p>
              <h2 className="mt-2 max-w-[30ch] font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-semibold">
                Read the suite as one system.
              </h2>
              <p className="mt-2 max-w-[56ch] text-[12.5px] leading-[1.65]" style={{ color: '#4b534b' }}>
                Rooms, sets, teams and the audit trail are bound to the same case. The
                plan is how operators move between them; the record is what they find.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 border-t p-5 sm:border-t-0 sm:border-l" style={{ borderColor: RULE }}>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center px-5 text-[12.5px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4482c]"
                style={{ backgroundColor: INK, color: PAPER }}
              >
                Open the platform
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center border px-5 text-[12.5px] font-medium transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4482c]"
                style={{ borderColor: INK }}
              >
                Request access
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: RULE }}>
        <div className="mx-auto flex max-w-[92rem] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <p className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: MUTED }}>
            Concept C · interactive hospital suite · sample sheet
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/design-system/concept-control"
              className="border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.06em] uppercase hover:bg-black/[0.04]"
              style={{ borderColor: RULE, color: '#4b534b' }}
            >
              ← Concept A · control room
            </Link>
            <Link
              href="/design-system/concept-journey"
              className="border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.06em] uppercase hover:bg-black/[0.04]"
              style={{ borderColor: RULE, color: '#4b534b' }}
            >
              Concept B · case journey →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
