import React from 'react';
import type { ReactNode } from 'react';
import { Surface } from '@/components/ui/Surface';
import { SectionHeading } from '@/components/ui/Type';

/*======================================================================
  Feature presentation — grid, ruled rows, or large alternating plates
====================================================================== */

export function FeatureSection({
  variant = 'grid',
  eyebrow,
  title,
  description,
  items,
}: {
  variant?: 'grid' | 'rows' | 'alternating';
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  items: readonly { code?: string; title: string; note: string }[];
}) {
  if (variant === 'rows') {
    return (
      <section className="bg-paper py-[var(--ds-section-y)]">
        <div className="ds-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-4">
              <SectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
              />
            </div>

            <ul className="border-rule min-w-0 lg:col-span-8">
              {items.map((item) => (
                <li
                  key={item.title}
                  className="border-rule grid gap-x-6 gap-y-1.5 border-t py-5 last:border-b sm:grid-cols-[3rem_minmax(0,1fr)]"
                >
                  {item.code ? (
                    <span className="text-secondary tnum font-mono text-[11px]">
                      {item.code}
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-foreground text-[0.9375rem] font-semibold">
                      {item.title}
                    </p>
                    <p className="text-ink-muted mt-1 text-[0.8125rem] leading-[1.6]">
                      {item.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'alternating') {
    return (
      <section className="bg-paper py-[var(--ds-section-y)]">
        <div className="ds-shell">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          <div className="mt-12 space-y-4">
            {items.slice(0, 4).map((item, index) => (
              <Surface
                key={item.title}
                variant="plain"
                className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
              >
                <span className="text-ink-subtle tnum font-mono text-[2rem] leading-none tracking-[-0.04em] sm:w-24">
                  {item.code ?? String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-foreground font-display text-[1.15rem] font-semibold tracking-[-0.02em]">
                    {item.title}
                  </p>
                  <p className="text-ink-muted mt-2 max-w-[62ch] text-[0.875rem] leading-[1.65]">
                    {item.note}
                  </p>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper py-[var(--ds-section-y)]">
      <div className="ds-shell">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Surface key={item.title} variant="interactive" padding="md">
              {item.code ? (
                <span className="text-secondary tnum font-mono text-[10px]">
                  {item.code}
                </span>
              ) : null}
              <p className="text-foreground mt-2 text-[0.9375rem] font-semibold">
                {item.title}
              </p>
              <p className="text-ink-muted mt-2 text-[0.8125rem] leading-[1.6]">
                {item.note}
              </p>
            </Surface>
          ))}
        </div>
      </div>
    </section>
  );
}
