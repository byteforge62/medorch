import React from 'react';

interface PageHeaderProps {
  /** Short kicker naming the operational domain, e.g. "Infrastructure". */
  eyebrow: string;
  title: string;
  /** One sentence of orientation — what the screen is for. */
  description?: React.ReactNode;
  /** Inline element beside the kicker: record counts, status chips. */
  meta?: React.ReactNode;
  /** Slot opposite the title: primary action, view toggle, summary readout. */
  actions?: React.ReactNode;
}

/**
 * PageHeader — the masthead of every screen.
 *
 * A teal signal dot and a tracked kicker, then the display title at a size
 * that actually commands the page, then one line of orientation. The action
 * slot sits on the right and drops below the title on narrow screens rather
 * than crushing it. No heavy rules: the header floats on the page, and the
 * panels beneath it carry the structure.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: PageHeaderProps) {
  return (
    <header className="pb-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-2">
              <span
                className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <p className="eyebrow">{eyebrow}</p>
            </span>

            {meta ? (
              <span className="bg-primary-soft text-primary inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                {meta}
              </span>
            ) : null}
          </div>

          <h1 className="display text-foreground mt-3 text-[clamp(2rem,4.2vw,3rem)]">
            {title}
          </h1>

          {description ? (
            <p className="lede mt-3 text-[0.9375rem]">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
