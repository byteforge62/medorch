import React from 'react';
import Link from 'next/link';

/*======================================================================
  MedOrch brand mark — the clinical orbit
  ======================================================================
  A soft square carrying the medical cross, with a small orbital arc that
  keeps the mark from reading as a generic first-aid symbol. It is drawn
  from the same lavender geometry as the product shell.
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
      <rect width="32" height="32" rx="10" fill="currentColor" />
      <path
        d="M16 8.3v15.4M8.3 16h15.4"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M23.6 7.3a12 12 0 0 1 2.3 3.4"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="25.6" cy="23.3" r="1.7" fill="white" fillOpacity="0.42" />
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
      ? 'text-[14px] tracking-[-0.02em]'
      : size === 'lg'
        ? 'text-[19px] tracking-[-0.03em]'
        : 'text-[16px] tracking-[-0.025em]';

  const markSize =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BrandMark className={markSize} />
      <span className="flex flex-col">
        <span
          className={`font-display font-semibold ${wordSize} ${
            tone === 'chalk' ? 'text-chalk' : 'text-ink'
          }`}
        >
          MedOrch
        </span>
        {subtitle ? (
          <span
            className={`mt-1 hidden text-[8px] font-semibold tracking-[0.2em] uppercase sm:block ${
              tone === 'chalk' ? 'text-white/60' : 'text-ink-subtle'
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
