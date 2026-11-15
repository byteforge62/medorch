import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

/*======================================================================
  Footer — columns, editorial, or a single compact rule
====================================================================== */

type FooterColumn = { title: string; links: { label: string; href: string }[] };

export function SiteFooter({
  variant = 'columns',
  brand,
  columns,
  note,
}: {
  variant?: 'columns' | 'editorial' | 'compact';
  brand: ReactNode;
  columns: readonly FooterColumn[];
  note?: ReactNode;
}) {
  if (variant === 'editorial') {
    return (
      <footer className="border-border bg-paper border-t">
        <div className="ds-shell py-14">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="text-foreground">{brand}</div>
              {note ? (
                <div className="text-ink-muted mt-6 max-w-[38ch] text-[0.8125rem] leading-[1.65]">
                  {note}
                </div>
              ) : null}
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-6">
              {columns.map((column) => (
                <div key={column.title}>
                  <p className="text-ink-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
                    {column.title}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="link-draw text-ink-secondary hover:text-foreground text-[0.8125rem] transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-rule-soft text-ink-subtle mt-12 flex flex-col gap-2 border-t pt-5 font-mono text-[9px] tracking-[0.14em] uppercase sm:flex-row sm:items-center sm:justify-between">
            <span>MedOrch · operating theatre orchestration</span>
            <span>Authorised clinical use only</span>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === 'compact') {
    return (
      <footer className="border-border bg-paper border-t">
        <div className="ds-shell flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="text-foreground">{brand}</div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {columns.flatMap((column) =>
                column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-ink-muted hover:text-foreground text-[0.75rem] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )),
              )}
            </ul>
          </nav>
        </div>
        {note ? (
          <div className="text-ink-subtle ds-shell pb-8 font-mono text-[9px] tracking-[0.12em] uppercase">
            {note}
          </div>
        ) : null}
      </footer>
    );
  }

  return (
    <footer className="border-border bg-surface-subtle border-t">
      <div className="ds-shell py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-foreground">{brand}</div>
            {note ? (
              <div className="text-ink-muted mt-5 max-w-[34ch] text-[0.8125rem] leading-[1.6]">
                {note}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <p className="text-ink-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink-secondary hover:text-foreground text-[0.8125rem] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-rule text-ink-subtle mt-10 flex flex-col gap-2 border-t pt-5 font-mono text-[9px] tracking-[0.14em] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>MedOrch · v0.1.0</span>
          <span>Authorised clinical use only</span>
        </div>
      </div>
    </footer>
  );
}
