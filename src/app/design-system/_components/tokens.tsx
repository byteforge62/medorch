import React from 'react';
import { Specimen } from './specimen';

/*======================================================================
  Token specimens — the three palettes, radius, type ladder
====================================================================== */

const paletteGroups = [
  {
    id: 'clinical',
    name: 'Clinical (default)',
    scope: 'no data-palette',
    swatches: [
      ['paper', 'Canvas'],
      ['sheet', 'Surface'],
      ['ink', 'Ink'],
      ['pine', 'Primary'],
      ['brass', 'Working'],
      ['success', 'Success'],
      ['warning', 'Warning'],
      ['danger', 'Danger'],
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    scope: "data-palette='enterprise'",
    swatches: [
      ['paper', 'Canvas'],
      ['sheet', 'Surface'],
      ['ink', 'Ink'],
      ['pine', 'Primary'],
      ['brass', 'Working'],
      ['success', 'Success'],
      ['warning', 'Warning'],
      ['danger', 'Danger'],
    ],
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    scope: "data-palette='intelligence'",
    swatches: [
      ['paper', 'Canvas'],
      ['sheet', 'Surface'],
      ['ink', 'Ink'],
      ['pine', 'Primary'],
      ['brass', 'Working'],
      ['success', 'Success'],
      ['warning', 'Warning'],
      ['danger', 'Danger'],
    ],
  },
] as const;

export function TokenSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {paletteGroups.map((group) => (
        <div
          key={group.id}
          data-palette={group.id === 'clinical' ? undefined : group.id}
          className="border-border bg-paper overflow-hidden rounded-[var(--radius-panel)] border"
        >
          <header className="border-border bg-sheet border-b px-4 py-2.5">
            <p className="text-foreground text-[12px] font-semibold">
              {group.name}
            </p>
            <code className="text-ink-muted font-mono text-[10px]">
              {group.scope}
            </code>
          </header>

          <div className="grid grid-cols-4 gap-px bg-border">
            {group.swatches.map(([token, label]) => (
              <div key={token} className="bg-sheet p-2">
                <span
                  className="block h-8 rounded-[var(--radius-sm)] border border-black/5"
                  style={{ background: `var(--${token})` }}
                  aria-hidden="true"
                />
                <p className="text-ink-muted mt-1.5 text-[10px]">{label}</p>
                <code className="text-ink-subtle font-mono text-[9px]">
                  --{token}
                </code>
              </div>
            ))}
          </div>

          <div className="text-ink secondary grid grid-cols-2 gap-2 border-border border-t px-4 py-3 font-mono text-[10px]">
            <span className="text-ink-muted">--radius-control</span>
            <span
              className="bg-primary-soft h-6"
              style={{ borderRadius: 'var(--radius-control)' }}
            />
            <span className="text-ink-muted">--radius-panel</span>
            <span
              className="bg-primary-soft h-6"
              style={{ borderRadius: 'var(--radius-panel)' }}
            />
            <span className="text-ink-muted">--radius-pill</span>
            <span
              className="bg-primary-soft h-6"
              style={{ borderRadius: 'var(--radius-pill)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TypeSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Specimen name="Display" variant="size='xl' | 'lg' | 'md'">
        <p className="display text-foreground text-[clamp(2.5rem,6vw,4.75rem)]">
          Display xl
        </p>
        <p className="display text-foreground mt-2 text-[clamp(2rem,4.6vw,3.5rem)]">
          Display lg
        </p>
        <p className="display text-foreground mt-2 text-[clamp(1.75rem,3.6vw,2.5rem)]">
          Display md
        </p>
      </Specimen>

      <Specimen
        name="Headings, body, labels, captions"
        variant="SectionHeading · Body · Eyebrow · Caption · Highlight"
      >
        <p className="eyebrow text-ink-muted">Eyebrow · slab label</p>
        <h3 className="section-title text-foreground mt-3">
          Section heading — the workhorse
        </h3>
        <p className="text-ink-secondary mt-2 text-[0.9375rem] leading-[1.65]">
          Body copy at the interface size. Secondary tone for reading, muted for
          supporting lines.
        </p>
        <p className="text-ink-muted mt-2 text-[0.75rem]">
          Caption / metadata · 12px · muted
        </p>
        <p className="mt-3 text-[0.9375rem]">
          Highlight inside a title:{' '}
          <span className="text-secondary">the working colour</span>.
        </p>
        <p className="tech mt-3">MCI-88214 · 09:42:18 · OT-03</p>
      </Specimen>
    </div>
  );
}
