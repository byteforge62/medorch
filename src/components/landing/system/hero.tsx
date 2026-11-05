import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { Body, Display, Eyebrow } from '@/components/ui/Type';

/*======================================================================
  Hero — three genuinely different compositions over one API
  ======================================================================
  split       copy left, product plate right, editorial masthead
  statement   centred declaration; the interface sits underneath it
  overlay     dark field, copy left, plate bleeding off the right edge
====================================================================== */

export function Hero({
  variant = 'split',
  eyebrow,
  title,
  description,
  primary,
  secondary,
  support,
  preview,
}: {
  variant?: 'split' | 'statement' | 'overlay';
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  support?: ReactNode;
  preview?: ReactNode;
}) {
  if (variant === 'statement') {
    return (
      <section
        className="bg-paper py-[var(--ds-section-y)]"
        aria-labelledby="hero-title"
      >
        <div className="ds-shell">
          <div className="mx-auto max-w-4xl text-center">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Display as="h1" size="xl" className="mt-5" id="hero-title">
              {title}
            </Display>
            <Body size="lg" tone="secondary" className="mx-auto mt-6 max-w-[54ch]">
              {description}
            </Body>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primary.href} className={buttonClasses({ size: 'lg', shape: 'pill' })}>{primary.label}</Link>
              {secondary ? (
                <Link href={secondary.href} className={buttonClasses({ size: 'lg', variant: 'outline', shape: 'pill' })}>{secondary.label}</Link>
              ) : null}
            </div>

            {support ? <div className="mt-6">{support}</div> : null}
          </div>

          {preview ? <div className="mt-14">{preview}</div> : null}
        </div>
      </section>
    );
  }

  if (variant === 'overlay') {
    return (
      <section
        className="relative overflow-hidden bg-[#081216] py-[var(--ds-section-y)] text-[#e8f1ef]"
        aria-labelledby="hero-title"
      >
        <div
          className="ds-grid-paper pointer-events-none absolute inset-0 opacity-35"
          aria-hidden="true"
        />

        <div className="ds-shell relative">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#7fe3c8] uppercase">
                <span
                  className="signal-dot h-1.5 w-1.5 rounded-full bg-[#7fe3c8]"
                  aria-hidden="true"
                />
                {eyebrow}
              </p>

              <Display
                as="h1"
                size="xl"
                className="mt-5 text-[#f2f7f6]"
                id="hero-title"
              >
                {title}
              </Display>

              <p className="mt-6 max-w-[46ch] text-[1rem] leading-[1.65] text-[#a7bdb8]">
                {description}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={primary.href} className={buttonClasses({ size: 'lg', className: 'bg-[#7fe3c8] text-[#08231d] hover:bg-[#9cf0d7]' })}>{primary.label}</Link>
                {secondary ? (
                  <Link href={secondary.href} className={buttonClasses({ size: 'lg', variant: 'outline', className: 'border-white/25 bg-white/[0.04] text-white hover:bg-white/10' })}>{secondary.label}</Link>
                ) : null}
              </div>

              {support ? <div className="mt-8">{support}</div> : null}
            </div>

            {preview ? <div className="min-w-0 lg:-mr-8">{preview}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper py-[var(--ds-section-y)]" aria-labelledby="hero-title">
      <div className="ds-shell">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <Eyebrow tone="accent">{eyebrow}</Eyebrow>
            <Display as="h1" size="lg" className="mt-4" id="hero-title">
              {title}
            </Display>
            <Body size="md" tone="secondary" className="mt-6 max-w-[46ch]">
              {description}
            </Body>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={primary.href} className={buttonClasses({ size: 'lg' })}>{primary.label}</Link>
              {secondary ? (
                <Link href={secondary.href} className={buttonClasses({ size: 'lg', variant: 'outline' })}>{secondary.label}</Link>
              ) : null}
            </div>

            {support ? <div className="mt-8">{support}</div> : null}
          </div>

          <div className="min-w-0 lg:col-span-6">{preview}</div>
        </div>
      </div>
    </section>
  );
}
