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
 * Modal — a centred dialog for short, focused decisions.
 *
 * Same contract as Drawer: Escape closes, scroll locks, focus enters and
 * returns to the trigger, and the backdrop is inert. Use the Drawer when the
 * task is a form with many fields; use the Modal for a choice, a preview or
 * a walkthrough.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;
  // Portal to <body> so the dialog is never trapped inside a transformed or
  // animated ancestor's stacking context.
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = document.activeElement as HTMLElement | null;

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
        ?.querySelector<HTMLElement>('button, input, a[href]')
        ?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
      trigger?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !isClient) return null;

  const width =
    size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative flex max-h-[calc(100vh-1.5rem)] w-full ${width} flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-sheet shadow-[0_40px_110px_-40px_rgba(15,23,42,0.6)] modal-panel-enter`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-[18px] leading-tight font-bold text-midnight"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-[12.5px] text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
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
