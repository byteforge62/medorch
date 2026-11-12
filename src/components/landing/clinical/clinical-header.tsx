import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';

import { Wordmark } from '@/components/brand/Brand';

const links = [
  { href: '#platform', label: 'Theatre day' },
  { href: '#coordination', label: 'Coordination' },
  { href: '#access', label: 'Access' },
  { href: '#modules', label: 'Modules' },
];

export function ClinicalHeader({
  homeHref = '/design-system/clinical',
}: {
  homeHref?: string;
}) {
  return (
    <header className="border-rule/90 bg-paper/95 sticky top-0 z-40 border-b">
      <div aria-hidden="true" className="from-primary via-brand-lavender to-primary/30 h-[2px] bg-gradient-to-r" />
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Wordmark href={homeHref} size="lg" subtitle="Theatre operations" />

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-secondary hover:text-ink relative inline-flex min-h-6 items-center py-2 text-[12.5px] font-medium transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              prefetch={false}
              className="text-ink-secondary hover:text-ink hidden px-1 py-2 text-[12px] font-semibold transition-colors sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              prefetch={false}
              className="bg-primary text-primary-ink hover:bg-primary-hover inline-flex h-10 items-center gap-1.5 rounded-[9px] px-4 text-[11.5px] font-semibold shadow-[0_8px_18px_rgba(112,85,190,0.16)] transition-all hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5"
            >
              Request access
              <ArrowUpRight size={12} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <nav
          aria-label="Primary, compact"
          className="-mx-1 flex items-center gap-4 overflow-x-auto pb-2.5 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-ink-muted hover:text-ink inline-flex min-h-6 shrink-0 items-center text-[11px] font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
