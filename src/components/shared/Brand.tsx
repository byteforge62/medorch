import React from 'react';
import Link from 'next/link';

/*======================================================================
  MedOrch brand
  ======================================================================
  A rounded cobalt plate carrying a white medical cross intersected by a
  bio-teal ECG pulse. The same geometry is shipped as:
    public/brand/medorch-symbol.svg
    public/brand/medorch-logo.svg
    public/brand/medorch-favicon.svg

  Two fixed colourways keep the mark legible on porcelain and on the
  midnight rail without inventing a second logo.
====================================================================== */

const mark = {
  light: {
    plate: 'var(--brand-mark)',
    glyph: 'var(--brand-mark-ink)',
    pulse: 'var(--brand-mark-lavender)',
    edge: 'rgba(255,255,255,0.16)',
  },
  dark: {
    plate: 'var(--brand-mark-soft)',
    glyph: 'var(--brand-mark-deep)',
    pulse: 'var(--brand-mark)',
    edge: 'rgba(29,78,216,0.18)',
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
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="12.25"
        stroke={colors.edge}
        strokeWidth="1.5"
      />
      {/* Medical cross */}
      <path
        d="M21 11.5h6v7.2h7.2v6H27v7.2h-6v-7.2h-7.2v-6H21z"
        fill={colors.glyph}
      />
      {/* ECG pulse crossing the plate */}
      <path
        d="M6 30.5h7.6l2.9-6.2 3.9 12 3.4-8.6 2.4 2.8h5.4"
        stroke={colors.pulse}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.5 30.5h4.2l2.1-3.4 2.7 3.4h1.5"
        stroke={colors.pulse}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}

/*======================================================================
  Wordmark
  ======================================================================
  A two-tone sans lockup. The mark carries the clinical geometry; the
  wordmark stays quiet enough for a navigation rail and compact enough
  for a 320px viewport.
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
      <BrandMark
        tone={tone === 'chalk' ? 'dark' : 'light'}
        className={`${markSize} shrink-0`}
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={`font-display leading-none font-extrabold tracking-[-0.045em] ${wordSize} ${
            tone === 'chalk' ? 'text-white' : 'text-ink'
          }`}
        >
          Med
          <span className={tone === 'chalk' ? 'text-teal-soft' : 'text-cobalt'}>
            Orch
          </span>
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
