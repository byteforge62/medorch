"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

interface LandingMobileNavProps {
  navLinks: { label: string; href: string }[];
}

export function LandingMobileNav({ navLinks }: LandingMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-foreground-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 md:hidden"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        {isOpen ? (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute top-full right-0 left-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-foreground-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                {link.label}
              </a>
            ))}

            <div
              className="my-2 h-px bg-[var(--color-border)]"
              aria-hidden="true"
            />

            <Link
              href="/login"
              onClick={closeMenu}
              className="rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-foreground-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-1 inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
