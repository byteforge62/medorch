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
 * IBM Plex Sans carries the page at display scale. A single hairline closes
 * the header; panels beneath it do not repeat the same title/description rhythm.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: PageHeaderProps) {
  return (
    <header className="border-rule mb-6 border-b pb-6 sm:mb-7 sm:pb-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="ui-kicker">{eyebrow}</p>
            {meta ? (
              <span className="border-rule text-ink-muted border-l pl-3 text-[11.5px] tabular-nums">
                {meta}
              </span>
            ) : null}
          </div>

          <h1 className="display text-midnight mt-3 max-w-[20ch] text-[clamp(2rem,1.35rem+2.2vw,3.15rem)]">
            {title}
          </h1>

          {description ? (
            <p className="text-ink-secondary mt-3 max-w-[70ch] text-[13.5px] leading-[1.65]">
              {description}
            </p>
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
