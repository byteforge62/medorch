import React from 'react';

/*======================================================================
  Statistics band — three arrangements of the same real facts
  ======================================================================
  inline   ruled figures directly on the page
  plate    inverted band, one cell per fact
  rail     a single bounded strip
====================================================================== */

export function StatsBand({
  variant = 'inline',
  facts,
  label = 'Platform facts',
}: {
  variant?: 'inline' | 'plate' | 'rail';
  facts: readonly { value: string; label: string; detail?: string }[];
  label?: string;
}) {
  if (variant === 'plate') {
    return (
      <section className="bg-rail py-12 text-chalk">
        <div className="ds-shell">
          <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <li key={fact.label} className="bg-rail px-5 py-6">
                <p className="font-display tnum text-[2.5rem] leading-none font-semibold tracking-[-0.04em] text-[#d8b98a]">
                  {fact.value}
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-white/60 uppercase">
                  {fact.label}
                </p>
                {fact.detail ? (
                  <p className="mt-2 text-[12px] leading-snug text-white/40">
                    {fact.detail}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (variant === 'rail') {
    return (
      <section className="bg-paper py-10">
        <div className="ds-shell">
          <div className="border-border flex flex-col divide-y rounded-[var(--radius-panel)] border bg-sheet sm:flex-row sm:divide-x sm:divide-y-0">
            {facts.map((fact) => (
              <div key={fact.label} className="flex-1 px-5 py-5">
                <p className="text-ink-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
                  {fact.label}
                </p>
                <p className="text-foreground tnum font-display mt-2 text-[1.75rem] leading-none font-semibold">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={label} className="border-border bg-paper border-y">
      <dl className="ds-shell grid grid-cols-2 gap-x-6 gap-y-6 py-8 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-ink-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
              {fact.label}
            </dt>
            <dd className="text-foreground tnum font-display mt-2 text-[2rem] leading-none font-semibold tracking-[-0.03em]">
              {fact.value}
            </dd>
            {fact.detail ? (
              <dd className="text-ink-muted mt-2 max-w-[30ch] text-[11px] leading-snug">
                {fact.detail}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
