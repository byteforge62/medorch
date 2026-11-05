'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/Brand';

const links = [
  { href: '#platform', label: 'Platform' },
  { href: '#modules', label: 'Modules' },
  { href: '#access', label: 'Access and audit' },
  { href: '#engineering', label: 'Engineering' },
];

export function ClinicalHeader({
  homeHref = '/design-system/clinical',
}: {
  homeHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3EAF0] bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 lg:px-8">
        <Link
          href={homeHref}
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#245B8F]"
          aria-label="MedOrch home"
        >
          <BrandMark className="h-[22px] w-[22px] text-[#245B8F]" />
          <span className="flex items-baseline gap-2">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-[#243447]">
              MedOrch
            </span>
            <span className="hidden text-[12px] text-[#718096] lg:inline">
              Clinical operations
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-[13.5px] font-medium text-[#47586B] transition-colors hover:bg-[#EDF3F8] hover:text-[#243447] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-[#245B8F] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#245B8F]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-md bg-[#245B8F] px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-[#1D4A76] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
          >
            Request access
          </Link>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#E3EAF0] text-[#243447] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F] lg:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            {open ? (
              <path d="M2 2l14 10M16 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          className="border-t border-[#E3EAF0] bg-white px-5 pb-5 pt-2 lg:hidden"
        >
          <nav aria-label="Primary, mobile" className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-[#EDF3F8] text-[15px] font-medium text-[#243447] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#CBD8E5] text-[14px] font-medium text-[#245B8F]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#245B8F] text-[14px] font-medium text-white"
            >
              Request access
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
