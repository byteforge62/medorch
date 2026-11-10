'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { List, X } from '@phosphor-icons/react';
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
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 lg:px-6 lg:pt-4">
      <div className="border-rule bg-sheet/92 mx-auto flex h-[4.25rem] max-w-[1280px] items-center justify-between gap-4 rounded-[20px] border px-3 shadow-[0_8px_28px_rgba(66,48,112,0.07)] backdrop-blur-xl sm:px-4">
        <Link
          href={homeHref}
          className="focus-visible:outline-primary flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
          aria-label="MedOrch home"
        >
          <BrandMark className="text-primary h-8 w-8" />
          <span className="flex items-baseline gap-2">
            <span className="text-ink text-[16px] font-semibold tracking-[-0.03em]">
              MedOrch
            </span>
            <span className="text-ink-muted hidden text-[10px] font-medium tracking-[0.03em] lg:inline">
              Theatre operations
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="bg-surface-subtle/60 hidden items-center gap-0.5 rounded-full p-1 lg:flex"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-ink-secondary hover:bg-sheet hover:text-primary focus-visible:outline-primary rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-primary hover:bg-pine-soft focus-visible:outline-primary rounded-lg px-2 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-primary hover:bg-primary-deep focus-visible:outline-primary inline-flex h-9 items-center rounded-[11px] px-4 text-[12.5px] font-semibold text-white shadow-[0_5px_14px_rgba(101,80,181,0.18)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
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
          className="border-rule bg-surface-subtle text-ink hover:text-primary focus-visible:outline-primary inline-flex h-10 w-10 items-center justify-center rounded-[12px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? (
            <X size={18} weight="bold" aria-hidden="true" />
          ) : (
            <List size={18} weight="bold" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          className="border-rule bg-sheet mx-auto mt-2 max-w-[1280px] rounded-[20px] border px-4 pt-2 pb-4 shadow-[0_18px_44px_rgba(66,48,112,0.12)] lg:hidden"
        >
          <nav aria-label="Primary, mobile" className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-rule-soft text-ink focus-visible:outline-primary flex min-h-11 items-center border-b text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="border-rule-strong text-primary inline-flex h-10 flex-1 items-center justify-center rounded-[11px] border text-[13px] font-semibold"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="bg-primary inline-flex h-10 flex-1 items-center justify-center rounded-[11px] text-[13px] font-semibold text-white"
            >
              Request access
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
