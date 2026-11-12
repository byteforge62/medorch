
import Link from 'next/link';
import {
  ArrowUpRight,
  CaretDown,
  List,
  X,
} from '@phosphor-icons/react/dist/ssr';

import { Wordmark } from '@/components/brand/Brand';

const links = [
  { href: '#platform', label: 'Theatre day' },
  { href: '#coordination', label: 'Coordination' },
  { href: '#theatre', label: 'Theatre floor' },
  { href: '#resources', label: 'Resources' },
  { href: '#modules', label: 'Modules' },
];

export function ClinicalHeader({
  homeHref = '/design-system/clinical',
}: {
  homeHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-paper/95 backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20"
      />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex h-[76px] items-center justify-between gap-5">
          {/* Brand */}
          <div className="shrink-0">
            <Wordmark href={homeHref} size="lg" subtitle="Theatre operations" />
          </div>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative inline-flex h-10 items-center rounded-lg px-3 text-[12px] font-medium text-ink-secondary transition-colors duration-200 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {link.label}
                <span className="absolute inset-x-3 bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Account actions */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/login"
              prefetch={false}
              className="hidden h-10 items-center px-2 text-[12px] font-semibold text-ink-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              prefetch={false}
              className="group inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-[11px] font-semibold text-primary-ink shadow-[0_5px_15px_rgba(112,85,190,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_9px_22px_rgba(112,85,190,0.23)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5"
            >
              Request access
              <ArrowUpRight
                size={14}
                weight="bold"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Compact navigation for tablet and mobile */}
        <nav
          aria-label="Section navigation"
          className="-mx-1 flex items-center gap-1 overflow-x-auto pb-3 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-8 shrink-0 items-center rounded-full border border-transparent px-3 text-[10.5px] font-medium text-ink-muted transition-colors hover:border-rule hover:bg-sheet hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
