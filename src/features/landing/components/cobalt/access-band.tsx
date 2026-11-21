import {
  EnvelopeSimple,
  Fingerprint,
  SealCheck,
  ShieldCheck,
  ClockCounterClockwise,
} from '@phosphor-icons/react/dist/ssr';

/*======================================================================
  Access & accountability
  ======================================================================
  What a hospital needs to know before it hands over a theatre day. Every
  line below is a rule the server applies; none of it is a marketing claim
  about behaviour the product does not implement.
====================================================================== */

const guarantees = [
  {
    title: 'Verified before sign-in',
    copy: 'A new account confirms its email address before it can authenticate.',
    icon: EnvelopeSimple,
  },
  {
    title: 'Approved by an administrator',
    copy: 'Registration requests wait in a queue. No role is granted by signing up.',
    icon: SealCheck,
  },
  {
    title: 'Scoped at the query',
    copy: 'Records are filtered by the signed-in role, so a patient request cannot return another patient.',
    icon: Fingerprint,
  },
  {
    title: 'Attributed on every write',
    copy: 'Creates, approvals, delays, completions and cancellations name the account that made them.',
    icon: ClockCounterClockwise,
  },
];

const path = ['Request access', 'Verify email', 'Administrator approves', 'Sign in'];

export function AccessBand() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <ul className="grid gap-3 sm:grid-cols-2">
        {guarantees.map((item) => {
          const Icon = item.icon;

          return (
            <li
              key={item.title}
              className="rounded-[var(--radius-panel)] border border-ice-border bg-white p-4 shadow-xs"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cobalt-soft text-cobalt">
                <Icon size={15} weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-[12.5px] leading-snug font-semibold text-midnight">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
                {item.copy}
              </p>
            </li>
          );
        })}
      </ul>

      <article className="rounded-[var(--radius-panel)] border border-cobalt/15 bg-[#F7FAFF] p-5">
        <p className="inline-flex items-center gap-2 text-[9.5px] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
          <ShieldCheck size={13} weight="duotone" className="text-teal" aria-hidden="true" />
          Getting an account
        </p>

        <ol className="mt-4 space-y-0">
          {path.map((step, index) => (
            <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
              {index < path.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-6 left-[11px] h-[calc(100%-1rem)] w-px border-l border-dashed border-cobalt/30"
                />
              ) : null}
              <span className="relative z-10 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border border-cobalt/25 bg-white font-mono text-[9px] font-semibold text-cobalt tabular-nums">
                {index + 1}
              </span>
              <span className="pt-0.5 text-[12px] font-medium text-ink-secondary">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-4 border-t border-cobalt/12 pt-3 text-[10.5px] leading-relaxed text-ink-muted">
          Passwords are reset through a single-use emailed link. Nothing about a
          role can be changed from the browser.
        </p>
      </article>
    </div>
  );
}
