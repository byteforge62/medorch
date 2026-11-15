'use client';

import React, { useEffect, useRef, useState } from 'react';

/*======================================================================
  Reveal — scroll-triggered entrance choreography.
  ======================================================================
  Wraps a plate and raises it into place once it enters the viewport. The
  animation itself lives in CSS so `prefers-reduced-motion` can neutralise
  it without JS branching. Observers disconnect after the first reveal so
  scrolling back up never re-animates content.
====================================================================== */

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'figure';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      /* Degrade to an immediate reveal without setting state during the
         effect body (which would cascade a second render). */
      const fallback = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — ref type narrows per tag, all HTML elements share the base ref.
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
