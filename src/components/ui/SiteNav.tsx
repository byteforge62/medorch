'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { buttonClasses } from './Button';

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  /** A dropdown group. Rendered as a disclosure button, never a hover trap. */
  children?: NavLink[];
}

export type NavVariant = 'minimal' | 'floating' | 'transparent' | 'solid';

interface SiteNavProps {
  variant?: NavVariant;
  brand: React.ReactNode;
  items: NavItem[];
  /** Primary action. Omit for a navigation with no call to action. */
  cta?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Accessible name for the navigation landmark. */
  label?: string;
  className?: string;
}

/*
 * Four navigation treatments over one accessible structure:
 *
 *  minimal      editorial rule, no container — the page owns the margin
 *  floating     detached capsule that floats over content
 *  transparent  no chrome until the page scrolls (here: over a dark hero)
 *  solid        full-width bar with a hairline
 *
 * Mobile is identical in all four: a disclosure button and a panel, with
 * Escape returning focus to the trigger.
 */
const variantStyles: Record<NavVariant, string> = {
  minimal: 'border-b border-border bg-paper',
  floating:
    'mx-auto mt-4 w-[calc(100%-2*var(--ds-gutter))] rounded-[var(--radius-pill)] border border-border bg-sheet shadow-md',
  transparent: 'border-b border-white/10 bg-transparent',
  solid: 'border-b border-border bg-sheet shadow-xs',
};

const isDark = (variant: NavVariant) => variant === 'transparent';

export function SiteNav({
  variant = 'solid',
  brand,
  items,
  cta,
  secondary,
  label = 'Primary',
  className = '',
}: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen && !openDropdown) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (mobileOpen) {
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
      setOpenDropdown(null);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [mobileOpen, openDropdown]);

  const dark = isDark(variant);
  const linkTone = dark
    ? 'text-white/70 hover:text-white'
    : 'text-ink-secondary hover:text-foreground';

  const closeAll = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
  };

  return (
    <div ref={navRef} className={`relative z-40 ${className}`}>
      <div className={variantStyles[variant]}>
        <div className="ds-shell flex h-16 items-center justify-between gap-4">
          <div className={dark ? 'text-chalk' : ''}>{brand}</div>

          <nav aria-label={label} className="hidden items-center gap-7 lg:flex">
            {items.map((item) =>
              item.children ? (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={openDropdown === item.label}
                    onClick={() =>
                      setOpenDropdown((current) =>
                        current === item.label ? null : item.label,
                      )
                    }
                    className={`inline-flex cursor-pointer items-center gap-1.5 text-[0.8125rem] font-medium transition-colors ${linkTone}`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`text-[9px] transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {openDropdown === item.label ? (
                    <div className="border-border bg-sheet absolute top-full left-0 mt-2 w-64 rounded-[var(--radius-panel)] border p-2 shadow-lg">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeAll}
                          className="hover:bg-surface-subtle block rounded-[var(--radius-sm)] px-3 py-2 transition-colors"
                        >
                          <span className="text-foreground block text-[0.8125rem] font-medium">
                            {child.label}
                          </span>
                          {child.description ? (
                            <span className="text-ink-muted mt-0.5 block text-[11px] leading-snug">
                              {child.description}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href ?? '#'}
                  className={`text-[0.8125rem] font-medium transition-colors ${linkTone}`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {secondary ? (
              <Link
                href={secondary.href}
                className={`text-[0.8125rem] font-medium transition-colors ${linkTone}`}
              >
                {secondary.label}
              </Link>
            ) : null}
            {cta ? (
              <Link href={cta.href} className={buttonClasses({ size: 'sm', shape: variant === 'floating' ? 'pill' : 'control', variant: dark ? 'outline' : 'primary', className: dark ? 'border-white/25 bg-white/5 text-white hover:bg-white/10' : '' })}>{cta.label}</Link>
            ) : null}
          </div>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border transition-colors lg:hidden ${
              dark
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-border text-ink-secondary hover:bg-surface-subtle'
            }`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {mobileOpen ? '×' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id={menuId}
          className={`border-b shadow-lg lg:hidden ${
            dark
              ? 'border-white/10 bg-[#0b1418]'
              : 'border-border bg-sheet'
          }`}
        >
          <nav aria-label="Mobile" className="ds-shell flex flex-col py-3">
            {items.map((item) =>
              item.children ? (
                <div key={item.label} className="py-1">
                  <p className="text-ink-muted px-2 pt-2 pb-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeAll}
                      className={`hover:bg-surface-subtle block rounded-[var(--radius-sm)] px-2 py-2 text-[0.875rem] font-medium ${dark ? 'text-white/85' : 'text-foreground'}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href ?? '#'}
                  onClick={closeAll}
                  className={`hover:bg-surface-subtle rounded-[var(--radius-sm)] px-2 py-2.5 text-[0.875rem] font-medium ${dark ? 'text-white/85' : 'text-foreground'}`}
                >
                  {item.label}
                </Link>
              ),
            )}

            <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
              {secondary ? (
                <Link
                  href={secondary.href}
                  onClick={closeAll}
                  className={`flex-1 rounded-[var(--radius-control)] px-3 py-2.5 text-center text-[0.8125rem] font-medium ${dark ? 'text-white/80' : 'text-ink-secondary'}`}
                >
                  {secondary.label}
                </Link>
              ) : null}
              {cta ? (
                <Link
                  href={cta.href}
                  onClick={closeAll}
                  className="bg-primary text-chalk hover:bg-primary-hover flex-1 rounded-[var(--radius-control)] px-3 py-2.5 text-center text-[0.8125rem] font-semibold transition-colors"
                >
                  {cta.label}
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
