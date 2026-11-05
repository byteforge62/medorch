'use client';

import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import {
  caseStatusTone,
  journeyCase,
  journeyStages,
  priorityTone,
  type JourneyStage,
} from './concept-data';

/*======================================================================
  Concept B — Surgical case journey
  ----------------------------------------------------------------------
  The page follows one case through the seven records it touches. There
  is no product card: each stage *is* the product surface, expressed as
  the record it writes. A spine, a stage rail and a progress line are the
  only structure; the serif is the register of a clinical document.

  Scroll-linked behaviour: the stage rail marks where the reader is, the
  spine fills, and the sticky strip names the current record. Selecting a
  stage jumps to it; each stage opens its own audit entry. Reduced motion
  removes the transitions, not the information.
====================================================================== */

const TONE: Record<string, string> = {
  neutral: '#5f5949',
  info: '#2f5566',
  attention: '#8a5a1c',
  critical: '#8a2f24',
  positive: '#2f5d43',
};

function StateMark({ label, tone }: { label: string; tone: string }) {
  const colour = TONE[tone] ?? TONE.neutral;
  return (
    <span
      className="inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase"
      style={{ borderColor: `${colour}55`, color: colour }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: colour }} aria-hidden="true" />
      {label}
    </span>
  );
}

function StageRecord({ stage }: { stage: JourneyStage }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-t" style={{ borderColor: '#d8d0bf' }}>
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
        <p className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: '#7a7262' }}>
          What the system holds
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: '#8b8270' }}>
            {stage.module}
          </span>
          <StateMark label={stage.state} tone={caseStatusTone[stage.state]} />
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-l" style={{ borderColor: '#ddd6c6' }}>
        {stage.records.map((record) => (
          <div
            key={record.label}
            className="border-r border-b px-3 py-2.5"
            style={{ borderColor: '#ddd6c6' }}
          >
            <dt className="font-mono text-[8.5px] tracking-[0.12em] uppercase" style={{ color: '#8b8270' }}>
              {record.label}
            </dt>
            <dd className="mt-1 text-[13px] leading-snug" style={{ color: '#26241d' }}>
              {record.value}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`record-${stage.id}`}
        className="mt-3 inline-flex items-center gap-2 border-b py-1 font-mono text-[9.5px] tracking-[0.1em] uppercase transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c2f24]"
        style={{ borderColor: '#b9ae99', color: '#5c5343' }}
      >
        {open ? 'Close handover record' : 'Open handover record'}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div
          id={`record-${stage.id}`}
          className="cr-journey-in mt-2 border-l-2 py-2 pl-3"
          style={{ borderColor: '#7c2f24', backgroundColor: 'rgba(124,47,36,0.035)' }}
        >
          <p className="font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: '#7a7262' }}>
            {stage.audit.time} · {stage.audit.action} · {stage.audit.actor}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55]" style={{ color: '#4c463a' }}>
            {stage.audit.detail}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function CaseJourneyConcept() {
  const [active, setActive] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [spine, setSpine] = React.useState(0);
  const journeyRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-journey-stage]')
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = Number((visible.target as HTMLElement).dataset.journeyStage);
          setActive(Number.isNaN(index) ? 0 : index);
        }
      },
      { rootMargin: '-38% 0px -46% 0px', threshold: [0, 0.15, 0.4, 0.7] }
    );
    sections.forEach((section) => observer.observe(section));

    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);

      const journey = journeyRef.current;
      if (journey) {
        const rect = journey.getBoundingClientRect();
        const centre = window.innerHeight * 0.5;
        const ratio = (centre - rect.top) / rect.height;
        setSpine(Math.min(1, Math.max(0, ratio)));
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const current = journeyStages[active] ?? journeyStages[0];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#f4efe4', color: '#191813' }}>
      <style>{`
        .j-serif { font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif; }
        .j-serif-tight { font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif; letter-spacing: -0.015em; }
        @keyframes j-in { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        .cr-journey-in { animation: j-in .2s ease-out both }
        @media (prefers-reduced-motion: reduce) {
          .cr-journey-in { animation: none !important }
          * { transition-duration: 0.01ms !important; scroll-behavior: auto !important }
        }
      `}</style>

      <a
        href="#journey"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#191813] focus:px-3 focus:py-2 focus:text-[#f4efe4]"
      >
        Skip to the case journey
      </a>

      {/* — Masthead ------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-[2px]" style={{ borderColor: '#d8d0bf', backgroundColor: 'rgba(244,239,228,0.94)' }}>
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <Wordmark size="sm" href="/design-system" />
            <span className="hidden h-4 w-px sm:block" style={{ backgroundColor: '#cfc6b2' }} aria-hidden="true" />
            <p className="hidden font-mono text-[9px] tracking-[0.16em] uppercase sm:block" style={{ color: '#7a7262' }}>
              Concept B · case journey
            </p>
          </div>
          <Link
            href="/design-system"
            className="border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.1em] uppercase transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c2f24]"
            style={{ borderColor: '#b9ae99', color: '#4c463a' }}
          >
            Concepts
          </Link>
        </div>

        {/* — Sticky stage strip ------------------------------------ */}
        <div className="border-t" style={{ borderColor: '#e2dbcb' }}>
          <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
              <p className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: '#8b8270' }}>
                  Now reading
                </span>
                <span className="cr-journey-in truncate font-mono text-[10px] tracking-[0.06em] uppercase" style={{ color: '#191813' }} key={current.id}>
                  {current.index} · {current.name}
                </span>
                <StateMark label={current.state} tone={caseStatusTone[current.state]} />
              </p>
              <p className="font-mono text-[9px] tracking-[0.08em] uppercase" style={{ color: '#8b8270' }}>
                {Math.round(progress * 100)}% of the record
              </p>
            </div>

            <nav aria-label="Case stages" className="hidden border-t sm:block" style={{ borderColor: '#e2dbcb' }}>
              <ul className="flex">
                {journeyStages.map((stage, index) => (
                  <li key={stage.id} className="min-w-0 flex-1 border-r last:border-r-0" style={{ borderColor: '#e2dbcb' }}>
                    <a
                      href={`#${stage.id}`}
                      aria-current={index === active ? 'true' : undefined}
                      onClick={() => setActive(index)}
                      className="flex h-full flex-col gap-0.5 px-2 py-1.5 transition-colors hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#7c2f24]"
                      style={{ backgroundColor: index === active ? 'rgba(25,24,19,0.055)' : 'transparent' }}
                    >
                      <span className="font-mono text-[8.5px] tracking-[0.1em]" style={{ color: index === active ? '#7c2f24' : '#a29882' }}>
                        {stage.index}
                      </span>
                      <span
                        className="truncate text-[10.5px] leading-tight"
                        style={{ color: index === active ? '#191813' : '#6f6757', fontWeight: index === active ? 600 : 400 }}
                      >
                        {stage.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Case stages" className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-2 sm:hidden">
              {journeyStages.map((stage, index) => (
                <a
                  key={stage.id}
                  href={`#${stage.id}`}
                  aria-current={index === active ? 'true' : undefined}
                  onClick={() => setActive(index)}
                  className="inline-flex min-h-9 shrink-0 items-center border px-2 py-1.5 font-mono text-[9px] tracking-[0.04em] uppercase"
                  style={{
                    borderColor: index === active ? '#191813' : '#d8d0bf',
                    color: index === active ? '#f4efe4' : '#6f6757',
                    backgroundColor: index === active ? '#191813' : 'transparent',
                  }}
                >
                  {stage.index} {stage.name}
                </a>
              ))}
            </nav>
          </div>
          <div
            className="h-[2px] w-full"
            style={{ backgroundColor: '#e0d8c6' }}
            aria-hidden="true"
          >
            <div
              className="h-full origin-left transition-[width] duration-150 ease-out"
              style={{ width: `${progress * 100}%`, backgroundColor: '#7c2f24' }}
            />
          </div>
        </div>
      </header>

      <main id="journey">
        {/* — Dossier ------------------------------------------------ */}
        <section className="mx-auto max-w-[80rem] px-5 pt-10 pb-8 sm:px-8 sm:pt-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <p className="font-mono text-[9.5px] tracking-[0.2em] uppercase" style={{ color: '#7c2f24' }}>
                One case, end to end
              </p>
              <h1 className="j-serif-tight mt-4 text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[0.98] font-normal">
                One case.
                <br />
                Seven handovers.
              </h1>
              <p className="mt-5 max-w-[44ch] text-[14.5px] leading-[1.65]" style={{ color: '#4c463a' }}>
                A surgical case is never one record. It is booked, confirmed, given a
                room, staffed, equipped, run and closed — and each of those is a fact
                someone has to be able to find later.
              </p>
              <p className="mt-3 max-w-[44ch] text-[13px] leading-[1.65]" style={{ color: '#6f6757' }}>
                Follow this case down the page. Each stage is the product surface
                that holds it, not an illustration of one.
              </p>
            </div>

            <div className="border-t-2 pt-3" style={{ borderColor: '#191813' }}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: '#7a7262' }}>
                  Case dossier · sample
                </p>
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: '#8b8270' }}>
                  Mon · theatre suite
                </span>
              </div>
              <h2 className="j-serif mt-3 text-[26px] leading-tight">
                {journeyCase.procedure}
              </h2>
              <p className="mt-1 font-mono text-[10.5px] tracking-[0.08em] uppercase" style={{ color: '#6f6757' }}>
                {journeyCase.patientCode} · {journeyCase.priority} · OT-01
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-px border sm:grid-cols-4 lg:grid-cols-2" style={{ borderColor: '#ddd6c6', backgroundColor: '#ddd6c6' }}>
                {[
                  ['Booked', journeyCase.start],
                  ['Theatre', 'OT-01'],
                  ['Set', 'L-04'],
                  ['State', journeyCase.status],
                ].map(([label, value]) => (
                  <div key={label} className="px-3 py-2.5" style={{ backgroundColor: '#f4efe4' }}>
                    <dt className="font-mono text-[8.5px] tracking-[0.12em] uppercase" style={{ color: '#8b8270' }}>
                      {label}
                    </dt>
                    <dd className="mt-1 text-[12.5px]">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StateMark label={journeyCase.status} tone={caseStatusTone[journeyCase.status]} />
                <StateMark label={journeyCase.priority} tone={priorityTone[journeyCase.priority]} />
                <span className="font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color: '#8b8270' }}>
                  Synthetic patient record
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* — Journey ------------------------------------------------ */}
        <div ref={journeyRef} className="mx-auto max-w-[80rem] px-5 pb-6 sm:px-8">
          <div className="relative">
            {/* spine */}
            <div
              className="absolute top-0 bottom-0 left-[15px] hidden w-px sm:block"
              style={{ backgroundColor: '#d8d0bf' }}
              aria-hidden="true"
            >
              <div
                className="absolute top-0 left-0 w-px transition-[height] duration-150 ease-out"
                style={{ height: `${spine * 100}%`, backgroundColor: '#191813' }}
              />
            </div>

            {journeyStages.map((stage, index) => {
              const isActive = index === active;
              return (
                <section
                  key={stage.id}
                  id={stage.id}
                  data-journey-stage={index}
                  className="relative scroll-mt-[10.5rem] border-b py-8 sm:pl-12 lg:py-12"
                  style={{ borderColor: '#ddd6c6' }}
                  aria-labelledby={`stage-${stage.id}`}
                >
                  <span
                    className="absolute top-9 left-[8px] hidden h-4 w-4 rounded-full border-2 sm:block"
                    style={{
                      borderColor: isActive ? '#191813' : '#b9ae99',
                      backgroundColor: isActive ? '#191813' : '#f4efe4',
                    }}
                    aria-hidden="true"
                  />

                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span
                          className="j-serif text-[34px] leading-none"
                          style={{ color: isActive ? '#7c2f24' : '#b3a892' }}
                        >
                          {stage.index}
                        </span>
                        <h2 id={`stage-${stage.id}`} className="j-serif text-[25px] leading-tight sm:text-[28px]">
                          {stage.name}
                        </h2>
                      </div>
                      <p className="mt-1 font-mono text-[9.5px] tracking-[0.14em] uppercase" style={{ color: '#7a7262' }}>
                        {stage.verb}
                      </p>
                      <p className="mt-4 max-w-[42ch] text-[13.5px] leading-[1.65]" style={{ color: '#4c463a' }}>
                        {stage.summary}
                      </p>
                      <p className="mt-3 max-w-[42ch] border-l-2 pl-3 text-[12px] leading-[1.6] italic" style={{ borderColor: '#c9bfa8', color: '#6f6757' }}>
                        {stage.capability}
                      </p>
                    </div>

                    <div>
                      <StageRecord stage={stage} />
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* — Close -------------------------------------------------- */}
        <section className="mx-auto max-w-[80rem] px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-8 border-t-2 pt-8 lg:grid-cols-[1.2fr_1fr]" style={{ borderColor: '#191813' }}>
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: '#7c2f24' }}>
                Completion · 09:50
              </p>
              <h2 className="j-serif-tight mt-3 text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.02]">
                The case closes.
                <br />
                The record does not.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[13.5px] leading-[1.65]" style={{ color: '#4c463a' }}>
                Room, team, set and audit stay attached to the case after the theatre
                is turned over — which is what makes the next booking checkable rather
                than hopeful.
              </p>
            </div>

            <div className="self-end">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center px-5 text-[13.5px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c2f24]"
                  style={{ backgroundColor: '#191813', color: '#f4efe4' }}
                >
                  Open the platform
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center border px-5 text-[13.5px] font-medium transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c2f24]"
                  style={{ borderColor: '#191813', color: '#191813' }}
                >
                  Request access
                </Link>
              </div>
              <p className="mt-3 font-mono text-[9px] leading-[1.6] tracking-[0.06em] uppercase" style={{ color: '#8b8270' }}>
                Preview concept · synthetic records · the production landing page is unchanged
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: '#d8d0bf' }}>
        <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <p className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: '#8b8270' }}>
            Concept B · surgical case journey
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/design-system/concept-control" className="border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.06em] uppercase hover:bg-black/[0.04]" style={{ borderColor: '#c9bfa8', color: '#4c463a' }}>
              ← Concept A · control room
            </Link>
            <Link href="/design-system/concept-suite" className="border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.06em] uppercase hover:bg-black/[0.04]" style={{ borderColor: '#c9bfa8', color: '#4c463a' }}>
              Concept C · suite plan →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
