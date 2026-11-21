'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, X } from '@phosphor-icons/react';

import { BrandMark } from '@/components/shared/Brand';

/*======================================================================
  Public navigation
  ======================================================================
  A floating pill bar over the porcelain canvas: the cobalt plate on the
  left, the page's own sections in the centre, and the account pair on the
  right. It links to what this page actually explains — not into the
  product, which requires a signed-in, approved account.
====================================================================== */

const sections = [
  { label: 'Theatre day', href: '#theatre-day' },
  { label: 'Modules', href: '#modules' },
  { label: 'Booking', href: '#booking' },
  { label: 'Access', href: '#access' },
  { label: 'Roles', href: '#roles' },
];

export function CobaltHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <header className="mx-auto max-w-[84rem] rounded-[var(--radius-pill)] border border-cobalt/12 bg-white/85 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md">
        <div className="flex h-[3.75rem] items-center justify-between gap-3 px-3 sm:h-16 sm:px-5">
          <Link
            href="/"
            aria-label="MedOrch home"
            className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-offset-4"
          >
            <BrandMark className="h-8 w-8 shrink-0" />
            <span className="flex min-w-0 flex-col">
              <span className="font-display text-[17px] leading-none font-extrabold tracking-[-0.045em] text-midnight">
                Med<span className="text-cobalt">Orch</span>
              </span>
              <span className="mt-1 hidden text-[8px] font-semibold tracking-[0.14em] text-ink-subtle uppercase sm:block">
                Theatre coordination
              </span>
            </span>
          </Link>

          <nav aria-label="Sections" className="hidden items-center gap-0.5 lg:flex">
            {sections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                className="inline-flex h-9 items-center rounded-full px-3 text-[12.5px] font-semibold text-ink-secondary transition-colors hover:bg-cobalt-soft/60 hover:text-cobalt"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              prefetch={false}
              className="hidden h-9 items-center rounded-full px-3 text-[12px] font-semibold text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              prefetch={false}
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-cobalt px-3.5 text-[12px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(29,78,216,0.8)] transition-colors hover:bg-cobalt-hover sm:h-10 sm:px-4"
            >
              Request access
              <ArrowUpRight
                size={12}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-ice-border text-ink-secondary transition-colors hover:bg-surface-subtle lg:hidden"
            >
              {mobileOpen ? (
                <X size={16} weight="bold" aria-hidden="true" />
              ) : (
                <span aria-hidden="true" className="flex flex-col gap-[3px]">
                  <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                  <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                  <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            id="mobile-navigation"
            className="border-t border-ice-border px-3 pt-3 pb-4 lg:hidden"
          >
            <nav aria-label="Sections" className="grid gap-0.5 sm:grid-cols-2">
              {sections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[var(--radius-sm)] px-1 py-2.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-cobalt"
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="mt-3 border-t border-ice-border pt-3">
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-full border border-ice-border px-3 py-2.5 text-[12px] font-semibold text-ink-secondary"
              >
                Sign in to an existing account
              </Link>
            </div>
          </div>
        ) : null}
      </header>
    </div>
  );
}
