import React from 'react';
import type { ReactNode } from 'react';
import { SectionHeading } from '@/components/ui/Type';

/*======================================================================
  Showcase — how a product plate is presented
  ======================================================================
  framed   centred plate on a recessed band
  offset   plate anchored beside/over the heading edge
  bleed    full-width band with annotation keys beneath
====================================================================== */

export function Showcase({
  variant = 'framed',
  eyebrow,
  title,
  description,
  preview,
  annotations,
}: {
  variant?: 'framed' | 'offset' | 'bleed';
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  preview: ReactNode;
  annotations?: readonly string[];
}) {
  if (variant === 'bleed') {
    return (
      <section className="bg-paper py-[var(--ds-section-y)]">
        <div className="ds-shell">
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
          </div>
        </div>

        <div className="border-border bg-surface-subtle mt-12 overflow-hidden border-y py-10">
          <div className="ds-shell">{preview}</div>
        </div>

        {annotations ? (
          <div className="ds-shell mt-6">
            <ul className="text-ink-muted flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.1em] uppercase">
              {annotations.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    className="bg-secondary h-1 w-1 rounded-full"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  }

  if (variant === 'offset') {
    return (
      <section className="bg-paper pb-[var(--ds-section-y)] pt-[var(--ds-section-y)]">
        <div className="ds-shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="min-w-0 lg:col-span-5">
              <SectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
              />
            </div>
            <div className="min-w-0 lg:col-span-7 lg:pl-6">
              <div className="lg:-mr-6">{preview}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-subtle py-[var(--ds-section-y)]">
      <div className="ds-shell">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
        />
        <div className="mx-auto mt-12 max-w-4xl">{preview}</div>
      </div>
    </section>
  );
}
