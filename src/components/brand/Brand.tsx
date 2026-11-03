import React from 'react';
import Link from 'next/link';

/*======================================================================
  MedOrch brand mark — "the aperture"
  ======================================================================
  A surgical targeting reticle: a thin instrument ring, a solid pupil, and
  four hairlines crossing beyond the bezel. It reads at 16px in a rail and
  at 120px on a plate, and it is drawn from the same geometry as the
  theatre plans used across the product, so the identity stays coherent.
====================================================================== */

export function BrandMark({
  className = 'h-7 w-7',
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <circle
        cx="16"
        cy="16"
        r="12.4"
        stroke="currentColor"
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      <path
        d="M16 0.9V9.1M16 22.9V31.1M0.9 16H9.1M22.9 16H31.1"
        stroke="currentColor"
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M22.8 6.4a12.4 12.4 0 0 1 2.9 4.6"
        stroke="currentColor"
        strokeWidth="1.15"
        opacity="0.55"
      />
    </svg>
  );
}

/*======================================================================
  Wordmark — mono, widely tracked, always paired with the aperture.
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
      ? 'text-[11px] tracking-[0.3em]'
      : size === 'lg'
        ? 'text-[15px] tracking-[0.42em]'
        : 'text-[12px] tracking-[0.34em]';

  const markSize =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BrandMark className={markSize} />
      <span className="flex flex-col">
        <span
          className={`font-mono font-medium uppercase ${wordSize} ${
            tone === 'chalk' ? 'text-chalk' : 'text-ink'
          }`}
        >
          MedOrch
        </span>
        {subtitle ? (
          <span
            className={`mt-1 hidden font-mono text-[8px] tracking-[0.26em] uppercase sm:block ${
              tone === 'chalk' ? 'text-rail-muted' : 'text-ink-subtle'
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
      aria-label="MedOrch home"
      className="inline-flex focus-visible:outline-offset-4"
    >
      {content}
    </Link>
  );
}
