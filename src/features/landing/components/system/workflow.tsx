import React from 'react';
import type { ReactNode } from 'react';
import { Timeline, TimelineItem } from '@/components/ui/Indicators';
import { SectionHeading } from '@/components/ui/Type';

/*======================================================================
  Workflow — the case lifecycle, three presentations
  ======================================================================
  steps     four columns separated by rules
  timeline  vertical, with time labels (used by the operational direction)
  rail      a single segmented strip
====================================================================== */

export function Workflow({
  variant = 'steps',
  eyebrow,
  title,
  description,
  steps,
}: {
  variant?: 'steps' | 'timeline' | 'rail';
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  steps: readonly { index: string; title: string; note: string }[];
}) {
  if (variant === 'timeline') {
    return (
      <section className="bg-paper py-[var(--ds-section-y)]">
        <div className="ds-shell grid gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4">
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <Timeline label="Case lifecycle">
              {steps.map((step, index) => (
                <TimelineItem
                  key={step.index}
                  time={step.index}
                  title={step.title}
                  description={step.note}
                  tone={index === 0 ? 'accent' : 'neutral'}
                  last={index === steps.length - 1}
                />
              ))}
            </Timeline>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'rail') {
    return (
      <section className="border-border bg-surface-subtle border-y py-[var(--ds-section-y)]">
        <div className="ds-shell">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          <div className="border-border bg-border mt-10 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.index} className="bg-sheet p-5">
                <span className="text-secondary tnum font-mono text-[10px] tracking-[0.12em]">
                  {step.index}
                </span>
                <p className="text-foreground mt-3 text-[0.9375rem] font-semibold">
                  {step.title}
                </p>
                <p className="text-ink-muted mt-2 text-[0.8125rem] leading-[1.6]">
                  {step.note}
                </p>
              </div>
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
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.index} className="border-border border-t pt-5">
              <span className="text-secondary tnum font-mono text-[11px]">
                {step.index}
              </span>
              <p className="text-foreground mt-2 text-[0.9375rem] font-semibold">
                {step.title}
              </p>
              <p className="text-ink-muted mt-2 text-[0.8125rem] leading-[1.6]">
                {step.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
