import React from 'react';
import Link from 'next/link';

/*======================================================================
  MedOrch brand
  ======================================================================
  The symbol is a continuous clinical path: one theatre day carried
  through the M, with a recorded case node at the end. It is deliberately
  not a medical cross. The same geometry is shipped as:
    public/brand/medorch-symbol.svg
    public/brand/medorch-logo.svg
    public/brand/medorch-favicon.svg

  Two fixed colourways keep the mark legible on paper and on the
  aubergine rail without inventing a second logo.
====================================================================== */

const mark = {
  light: {
    plate: 'var(--brand-mark)',
    inset: 'var(--brand-mark-ink)',
    accent: 'var(--brand-mark-accent)',
    node: 'var(--brand-mark-soft)',
    edge: 'var(--brand-mark-soft)',
  },
  dark: {
    plate: 'var(--brand-mark-soft)',
    inset: 'var(--brand-mark-deep)',
    accent: 'var(--brand-mark-secondary)',
    node: 'var(--chalk)',
    edge: 'var(--brand-mark)',
  },
} as const;

export function BrandMark({
  className = 'h-7 w-7',
  tone = 'light',
  title,
}: {
  className?: string;
  tone?: 'light' | 'dark';
  title?: string;
}) {
  const colors = mark[tone];

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <rect width="48" height="48" rx="13" fill={colors.plate} />
      <rect
        x="0.65"
        y="0.65"
        width="46.7"
        height="46.7"
        rx="12.35"
        stroke={colors.edge}
        strokeOpacity="0.5"
        strokeWidth="1.3"
      />
      <path
        d="M13 33.5V17.5c0-2.7 3.2-4 5.1-2.1L24 21.3l5.9-5.9c1.9-1.9 5.1-.6 5.1 2.1v16"
        stroke={colors.inset}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 21.8c4.1 0 7.4-1.9 11-5.3"
        stroke={colors.accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="35.5" cy="35.5" r="2.2" fill={colors.node} />
    </svg>
  );
}

/*======================================================================
  Wordmark
  ======================================================================
  A two-tone sans lockup, not a display serif. The mark carries the
  clinical geometry; the wordmark stays quiet enough for a navigation
  rail and compact enough for a 320px viewport.
====================================================================== */

export function Wordmark({
  className = '',
  tone = 'ink',
  href = '/',
  subtitle,
  size = 'md',
}: {
  className?: string;
  tone?: 'ink' | 'chalk';
  href?: string | null;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const wordSize =
    size === 'sm'
      ? 'text-[14px]'
      : size === 'lg'
        ? 'text-[21px]'
        : 'text-[17px]';

  const markSize =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-7 w-7';

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark tone={tone === 'chalk' ? 'dark' : 'light'} className={`${markSize} shrink-0`} />
      <span className="flex min-w-0 flex-col">
        <span
          className={`font-sans leading-none font-bold tracking-[-0.045em] ${wordSize} ${
            tone === 'chalk' ? 'text-white' : 'text-ink'
          }`}
        >
          Med
          <span className={tone === 'chalk' ? 'text-brand-lavender' : 'text-primary'}>Orch</span>
        </span>
        {subtitle ? (
          <span
            className={`mt-1 hidden text-[8px] font-semibold tracking-[0.16em] uppercase sm:block ${
              tone === 'chalk' ? 'text-white/55' : 'text-ink-subtle'
            }`}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      prefetch={false}
      className="inline-flex rounded-[var(--radius-control)] focus-visible:outline-offset-4"
    >
      {content}
    </Link>
  );
}
