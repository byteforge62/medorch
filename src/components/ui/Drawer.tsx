'use client';

import React, { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

/* Client detection without a mount effect: the server snapshot is false, so
   the portal is only created after hydration. */
const subscribeToNothing = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

/**
 * Drawer — a slide-over working surface.
 *
 * Used where a task should not cost the operator their place in a register:
 * booking, assigning a room, checking equipment out. It is a real modal
 * dialog: Escape closes it, background scroll is locked, focus moves in and
 * returns to the trigger, and the backdrop is a labelled close control.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  width?: 'md' | 'lg';
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `drawer-title-${id}`;
  const descriptionId = `drawer-description-${id}`;
  // Portal to <body>: the workspace page-transition owns a stacking context,
  // so an in-tree fixed panel would slide under the sticky command bar.
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(
          'input:not([type="hidden"]), select, textarea, button',
        )
        ?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open || !isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`absolute inset-y-0 flex w-full flex-col border-border bg-sheet shadow-[0_30px_90px_-30px_rgba(15,23,42,0.55)] ${
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r'
        } ${width === 'lg' ? 'max-w-xl' : 'max-w-md'} drawer-panel-enter`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-cobalt uppercase">
              Working panel
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-[18px] leading-tight font-bold text-midnight"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-[12px] text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </header>

        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-rule bg-surface-subtle/60 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
