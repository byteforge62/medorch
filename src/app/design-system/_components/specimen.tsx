import React from 'react';

/*======================================================================
  Specimen — the labelled unit of the playground
  ======================================================================
  Every variant on /design-system is wrapped in one of these, so the label
  (component, variant prop, usage) sits beside the thing it describes.
====================================================================== */

export function Specimen({
  name,
  variant,
  note,
  children,
  className = '',
}: {
  name: string;
  variant?: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border-border bg-sheet overflow-hidden rounded-[var(--radius-panel)] border ${className}`}
    >
      <header className="border-rule-soft bg-surface-subtle/50 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-2.5">
        <p className="text-foreground text-[12px] font-semibold">{name}</p>
        {variant ? (
          <code className="text-ink-muted font-mono text-[10px]">{variant}</code>
        ) : null}
        {note ? (
          <p className="text-ink-subtle basis-full text-[11px]">{note}</p>
        ) : null}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function PlaygroundSection({
  id,
  index,
  title,
  description,
  children,
}: {
  id: string;
  index: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-border border-t py-12">
      <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-secondary tnum font-mono text-[10px] tracking-[0.14em]">
          {index}
        </span>
        <h2 className="display text-foreground text-[clamp(1.5rem,2.6vw,2rem)]">
          {title}
        </h2>
        <p className="text-ink-muted basis-full max-w-[70ch] text-[0.8125rem] leading-[1.6]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export function Row({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-3 border-rule-soft border-b py-3 last:border-b-0 ${className}`}
    >
      <p className="text-ink-muted w-28 shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase">
        {label}
      </p>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  );
}
