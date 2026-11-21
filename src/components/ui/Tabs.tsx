'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  /** Optional count shown after the label, in tabular figures. */
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tab list. */
  label: string;
  /** Ties the tabs to the panel(s) they control. */
  panelId?: string;
  className?: string;
}

/*
 * Segmented pill switcher. The active pill is a single shared element moved
 * with Framer Motion's layout animation, so switching reads as one object
 * sliding rather than two buttons changing colour. Arrow keys move between
 * tabs, Home/End jump to the ends, and the tab list stays a single stop in
 * the tab order.
 */
export function Tabs({
  items,
  value,
  onChange,
  label,
  panelId,
  className = '',
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const move = (delta: number) => {
    const index = items.findIndex((item) => item.id === value);
    const next = (index + delta + items.length) % items.length;
    onChange(items[next].id);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    buttons?.[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onChange(items[0].id);
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = items.length - 1;
      onChange(items[last].id);
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[last]?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-sheet/90 p-1 shadow-xs backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {items.map((item) => {
        const selected = item.id === value;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={`relative inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold whitespace-nowrap transition-colors duration-200 ${
              selected
                ? 'text-white'
                : 'text-ink-secondary hover:bg-surface-subtle hover:text-ink'
            }`}
          >
            {selected ? (
              <motion.span
                layoutId="clinical-tab-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-cobalt shadow-[0_6px_16px_-8px_rgba(29,78,216,0.7)]"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 320, damping: 30 }
                }
              />
            ) : null}
            <span className="relative">{item.label}</span>
            {typeof item.count === 'number' ? (
              <span
                className={`relative font-mono text-[10px] tabular-nums ${
                  selected ? 'text-white/70' : 'text-ink-subtle'
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
