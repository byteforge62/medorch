import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { Body, Display } from '@/components/ui/Type';

/*======================================================================
  Closing call to action — three weights
  ======================================================================
  split     statement left, actions right
  centered  a single centred invitation
  panel     inset plate; the strongest close, used by the enterprise
            direction
====================================================================== */

export function CtaBand({
  variant = 'split',
  title,
  description,
  primary,
  secondary,
  meta,
}: {
  variant?: 'split' | 'centered' | 'panel';
  title: ReactNode;
  description?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  meta?: ReactNode;
}) {
  if (variant === 'panel') {
    return (
      <section className="bg-paper py-[var(--ds-section-y)]">
        <div className="ds-shell">
          <div className="bg-rail text-chalk relative overflow-hidden rounded-[var(--radius-xl)] px-6 py-12 sm:px-12">
            <div
              className="blueprint-ink absolute inset-0 opacity-40"
              aria-hidden="true"
            />
            <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-8">
                <Display as="h2" size="md" className="text-chalk">
                  {title}
                </Display>
                {description ? (
                  <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.65] text-white/55">
                    {description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
                <Link href={primary.href} className={buttonClasses({ size: 'lg', className: 'bg-[#d8b98a] text-[#17130f] hover:bg-[#e5cba3]' })}>{primary.label}</Link>
                {secondary ? (
                  <Link href={secondary.href} className={buttonClasses({ size: 'lg', variant: 'ghost', className: 'text-white/75 hover:bg-white/10 hover:text-white' })}>{secondary.label}</Link>
                ) : null}
              </div>
            </div>
            {meta ? <div className="relative mt-8">{meta}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'centered') {
    return (
      <section className="border-border bg-paper border-t py-[var(--ds-section-y)]">
        <div className="ds-shell text-center">
          <Display as="h2" size="md">
            {title}
          </Display>
          {description ? (
            <Body tone="muted" className="mx-auto mt-4 max-w-[52ch]">
              {description}
            </Body>
          ) : null}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primary.href} className={buttonClasses({ size: 'lg', shape: 'pill' })}>{primary.label}</Link>
            {secondary ? (
              <Link href={secondary.href} className={buttonClasses({ size: 'lg', variant: 'ghost', shape: 'pill' })}>{secondary.label}</Link>
            ) : null}
          </div>
          {meta ? <div className="mt-8">{meta}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="border-border bg-paper border-t py-14">
      <div className="ds-shell flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <Display as="h2" size="md">
            {title}
          </Display>
          {description ? (
            <Body tone="muted" className="mt-3 max-w-[46ch]">
              {description}
            </Body>
          ) : null}
          {meta ? <div className="mt-5">{meta}</div> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={primary.href} className={buttonClasses({ size: 'lg' })}>{primary.label}</Link>
          {secondary ? (
            <Link href={secondary.href} className={buttonClasses({ size: 'lg', variant: 'outline' })}>{secondary.label}</Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
