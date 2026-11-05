import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Brand';
import { buttonClasses } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { PlaygroundSection } from './_components/specimen';
import { TokenSpecimens, TypeSpecimens } from './_components/tokens';
import { ButtonSpecimens } from './_components/buttons';
import { NavigationSpecimens } from './_components/navigation';
import { SurfaceSpecimens } from './_components/surfaces';
import { DataSpecimens } from './_components/data';
import { InputSpecimens } from './_components/inputs';

export const metadata: Metadata = {
  title: 'Design system playground',
  description:
    'Browser-rendered component playground for the MedOrch design system: variants, states, tokens, and the clinical landing direction under review.',
};

/*======================================================================
  /design-system — the playground
  ======================================================================
  Isolated from production functionality: no session, no API calls, no
  database. Every component below is the shipping implementation. The
  clinical landing direction is a prototype under review on its own route;
  src/app/page.tsx is untouched.
====================================================================== */

const sectionIndex = [
  ['tokens', 'Tokens & palettes'],
  ['buttons', 'Buttons'],
  ['navigation', 'Navigation'],
  ['typography', 'Typography'],
  ['surfaces', 'Surfaces & cards'],
  ['data', 'Data presentation'],
  ['inputs', 'Inputs & controls'],
  ['clinical', 'Clinical direction'],
] as const;

export default function DesignSystemPage() {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <header className="border-border bg-paper/95 sticky top-0 z-40 border-b backdrop-blur-[2px]">
        <div className="mx-auto max-w-[90rem] px-5 py-3 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Wordmark subtitle="Design system" size="sm" />
              <StatusPill tone="attention" size="sm" className="hidden sm:inline-flex">
                Playground · not production
              </StatusPill>
            </div>

            <Link href="/" className={buttonClasses({ variant: 'outline', size: 'sm', className: 'shrink-0' })}>Current landing page</Link>
          </div>

          <nav
            aria-label="Playground sections"
            className="-mx-5 mt-3 overflow-x-auto px-5 sm:-mx-8 sm:px-8"
          >
            <ul className="flex w-max items-center gap-5 pb-1">
              {sectionIndex.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-ink-muted hover:text-foreground whitespace-nowrap text-[12px] font-medium transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] px-5 pb-16 sm:px-8">
        <section className="py-10 sm:py-14">
          <p className="eyebrow text-ink-muted">MedOrch · design system</p>
          <h1 className="display text-foreground mt-3 max-w-[24ch] text-[clamp(2.25rem,5vw,3.75rem)]">
            Component system, <span className="text-secondary">under review.</span>
          </h1>
          <p className="text-ink-secondary mt-5 max-w-[68ch] text-[0.9375rem] leading-[1.7]">
            Every component below is the shipping implementation, rendered live.
            Each specimen is labelled with the component name and the props that
            produced it. The clinical direction at the end is a prototype; it has
            not replaced {' '}
            <Link href="/" className="text-secondary underline decoration-1 underline-offset-4">
              the current landing page
            </Link>
            .
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <StatusPill tone="neutral" size="sm">
              No session required
            </StatusPill>
            <StatusPill tone="neutral" size="sm">
              No API calls
            </StatusPill>
            <StatusPill tone="neutral" size="sm">
              Sample records labelled Preview
            </StatusPill>
            <StatusPill tone="neutral" size="sm">
              Check 1440 / 1024 / 390
            </StatusPill>
          </div>
        </section>

        <PlaygroundSection
          id="tokens"
          index="01"
          title="Tokens and palettes"
          description="Scoped palettes override the same semantic variables, so a direction is a token scope rather than a second component set. Radius and type are shared across the product."
        >
          <TokenSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="buttons"
          index="02"
          title="Buttons"
          description="One component, six variants, four sizes, two shapes. Loading and disabled are states of the same control, not separate components."
        >
          <ButtonSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="navigation"
          index="03"
          title="Navigation"
          description="The same accessible structure under four treatments, plus one mobile behaviour: disclosure button, panel, Escape returns focus to the trigger."
        >
          <NavigationSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="typography"
          index="04"
          title="Typography"
          description="Sora for display and section titles, Inter for interface text, JetBrains Mono for technical values only. The ladder is five sizes, no more."
        >
          <TypeSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="surfaces"
          index="05"
          title="Surfaces and cards"
          description="Elevation is a material decision: feature sits above the page, inset below it. Interactive adds a hover lift that reduced motion disables."
        >
          <SurfaceSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="data"
          index="06"
          title="Data presentation"
          description="Metrics, status, progress, timeline, chart frames, availability and operational state. Every value has a label; no colour-only signals."
        >
          <DataSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="inputs"
          index="07"
          title="Inputs and controls"
          description="One control surface for text, select and textarea. Validation is announced, not just coloured."
        >
          <InputSpecimens />
        </PlaygroundSection>

        <PlaygroundSection
          id="clinical"
          index="08"
          title="Clinical direction"
          description="A light clinical operations direction, reviewable on its own route. It uses the application's ten modules, four role scopes, six schedule states and audit vocabulary. Production landing page, shared tokens and module screens are untouched."
        >
          <div className="border-border bg-sheet rounded-[var(--radius-panel)] border p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-[60ch]">
                <p className="text-foreground text-[15px] font-semibold">
                  Modern Clinical Professional
                </p>
                <p className="text-ink-secondary mt-1.5 text-[13px] leading-[1.65]">
                  A working theatre-day preview, a module index that expands in
                  place, and role scopes tied to a sample audit extract. Light
                  surfaces, Inter throughout, mono only for codes and times.
                </p>
              </div>
              <Link
                href="/design-system/clinical"
                className={buttonClasses({ size: 'md', className: 'shrink-0' })}
              >
                Open clinical direction
              </Link>
            </div>

            <ul className="text-ink-muted mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--rule)] pt-4 text-[12px]">
              <li><span className="text-foreground font-medium">10</span> modules</li>
              <li><span className="text-foreground font-medium">6</span> schedule states</li>
              <li><span className="text-foreground font-medium">4</span> role scopes</li>
              <li><span className="text-foreground font-medium">1</span> audit trail</li>
            </ul>
          </div>
        </PlaygroundSection>
      </main>

      <footer className="border-border bg-surface-subtle border-t">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Wordmark size="sm" subtitle="Design system playground" />
          <p className="text-ink-subtle font-mono text-[9px] tracking-[0.14em] uppercase">
            Prototypes only · production landing page unchanged
          </p>
        </div>
      </footer>
    </div>
  );
}
