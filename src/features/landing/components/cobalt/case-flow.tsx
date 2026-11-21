import {
  ClockCounterClockwise,
  LockKey,
  SquaresFour,
} from '@phosphor-icons/react/dist/ssr';

/*======================================================================
  How a case is booked
  ======================================================================
  Three steps, each describing a rule the codebase enforces: one validated
  request, three overlap guards, an attributed outcome. The dark panel is
  the refusal path — the part most scheduling tools get wrong.
====================================================================== */

const steps = [
  {
    title: 'One request',
    copy: 'Patient, procedure, priority, theatre, surgeon and time window are entered as a single booking — not scattered across a form, a diary and a message.',
    icon: SquaresFour,
  },
  {
    title: 'Checked together',
    copy: 'Room, surgeon and patient ranges are tested in the same request. An overlap is refused with the reason: which room, which clinician, which window.',
    icon: LockKey,
  },
  {
    title: 'Recorded once',
    copy: 'Every later change — confirm, start, delay, complete, cancel — keeps the case record and the audit entry in step, with the actor attached.',
    icon: ClockCounterClockwise,
  },
];

export function CaseFlow() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
      <ol className="grid gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <li
              key={step.title}
              className="flex items-start gap-3.5 rounded-[var(--radius-panel)] border border-ice-border bg-white p-4 shadow-xs sm:p-5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cobalt-soft text-cobalt">
                <Icon size={18} weight="duotone" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[9.5px] tracking-[0.12em] text-ink-subtle">
                  0{index + 1}
                </p>
                <h3 className="mt-1 font-display text-[16px] leading-tight font-bold tracking-[-0.02em] text-midnight">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                  {step.copy}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <article className="relative overflow-hidden rounded-[var(--radius-panel)] bg-midnight p-5 text-white shadow-[0_28px_70px_-40px_rgba(15,23,42,0.85)] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]"
        />

        <div className="relative flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-white/50 uppercase">
            <LockKey size={12} weight="duotone" aria-hidden="true" />
            Overlap guard
          </p>
          <span className="rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[9.5px] font-semibold text-[#B91C1C] ring-1 ring-inset ring-white/10">
            Refused
          </span>
        </div>

        <h3 className="relative mt-4 max-w-[18ch] font-display text-[21px] leading-[1.1] font-bold tracking-[-0.025em]">
          An overlap is refused, not written over.
        </h3>

        <div className="relative mt-4 space-y-2">
          {[
            { label: 'Theatre', value: 'OT-02 busy 08:15–10:05', state: 'blocked' },
            { label: 'Surgeon', value: 'Dr. M. Khan already scrubbed', state: 'blocked' },
            { label: 'Patient', value: 'No other case in the window', state: 'clear' },
          ].map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <span className="text-[10px] tracking-[0.06em] text-white/45 uppercase">
                {check.label}
              </span>
              <span className="flex items-center gap-2 text-right text-[10.5px] text-white/80">
                {check.value}
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    check.state === 'blocked' ? 'bg-[#FCA5A5]' : 'bg-[#5EEAD4]'
                  }`}
                />
              </span>
            </div>
          ))}
        </div>

        <p className="relative mt-4 border-t border-white/10 pt-3 text-[11.5px] leading-relaxed text-white/60">
          The same rules are enforced again in the database, so a booking that
          slips past the interface still cannot double-book a theatre.
        </p>

        <p className="relative mt-3 font-mono text-[9px] tracking-[0.06em] text-white/40">
          ROOM · SURGEON · PATIENT
        </p>
      </article>
    </div>
  );
}
