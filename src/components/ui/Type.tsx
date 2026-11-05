import React from 'react';

/*======================================================================
  Typography primitives
  ======================================================================
  The product already has a type ladder in globals.css (.display,
  .section-title, .lede, .eyebrow, .tech). These components expose that
  ladder as props so landing prototypes never re-declare font sizes.

  Every component renders a semantic element by default and accepts `as`
  where a different level is needed (for example a section heading that
  must be an <h2> inside a hero that already owns the <h1>).
====================================================================== */

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

/* — Display ---------------------------------------------------------- */

export function Display({
  as: Tag = 'h1',
  size = 'lg',
  className = '',
  id,
  children,
}: {
  as?: HeadingTag;
  size?: 'xl' | 'lg' | 'md';
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const sizes = {
    xl: 'text-[clamp(2.5rem,6vw,4.75rem)]',
    lg: 'text-[clamp(2rem,4.6vw,3.5rem)]',
    md: 'text-[clamp(1.75rem,3.6vw,2.5rem)]',
  } as const;

  return (
    <Tag
      id={id}
      className={`display text-foreground ${sizes[size]} ${className}`}
    >
      {children}
    </Tag>
  );
}

/* — Section heading: eyebrow + title + optional description ---------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'start',
  as = 'h2',
  className = '',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'start' | 'center';
  as?: HeadingTag;
  className?: string;
}) {
  return (
    <div
      className={`${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Display as={as} size="md" className={eyebrow ? 'mt-3' : ''}>
        {title}
      </Display>
      {description ? (
        <p
          className={`text-ink-muted mt-4 max-w-[var(--ds-measure)] text-[0.9375rem] leading-[1.65] ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* — Body ------------------------------------------------------------- */

export function Body({
  size = 'md',
  tone = 'secondary',
  className = '',
  children,
}: {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'secondary' | 'muted';
  className?: string;
  children: React.ReactNode;
}) {
  const sizes = {
    sm: 'text-[0.8125rem] leading-[1.6]',
    md: 'text-[0.9375rem] leading-[1.65]',
    lg: 'text-[1.0625rem] leading-[1.6]',
  } as const;

  const tones = {
    ink: 'text-foreground',
    secondary: 'text-ink-secondary',
    muted: 'text-ink-muted',
  } as const;

  return (
    <p className={`${sizes[size]} ${tones[tone]} ${className}`}>{children}</p>
  );
}

/* — Eyebrow (slab label) --------------------------------------------- */

export function Eyebrow({
  tone = 'muted',
  className = '',
  children,
}: {
  tone?: 'muted' | 'ink' | 'accent';
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    muted: 'text-ink-muted',
    ink: 'text-foreground',
    accent: 'text-secondary',
  } as const;

  return (
    <p className={`eyebrow ${tones[tone]} ${className}`}>{children}</p>
  );
}

/* — Caption / metadata ----------------------------------------------- */

export function Caption({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`text-ink-muted text-[0.75rem] leading-[1.5] ${className}`}
    >
      {children}
    </p>
  );
}

/* — Highlight: the second clause of a title, in the working colour ---- */

export function Highlight({ children }: { children: React.ReactNode }) {
  return <em className="text-secondary not-italic">{children}</em>;
}

/* — Label: the tracked uppercase label used on form fields and rails -- */

export function Label({
  htmlFor,
  className = '',
  children,
}: {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-ink-muted block text-[11px] font-semibold tracking-[0.1em] uppercase ${className}`}
    >
      {children}
    </label>
  );
}
