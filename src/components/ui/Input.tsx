'use client';

import React, { useId, useState } from 'react';

/*======================================================================
  Form primitives
  ======================================================================
  One control surface (border, radius, shadow, focus) shared by text,
  select and textarea. Validation is expressed twice: a coloured border and
  a message with `role="alert"` wired through aria-describedby — colour is
  never the only signal.
====================================================================== */

const baseControl =
  'w-full rounded-[var(--radius-control)] border bg-sheet px-3 text-[0.875rem] text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] placeholder:text-ink-subtle disabled:cursor-not-allowed disabled:opacity-50';

function controlClasses(invalid?: boolean, extra = '') {
  return `${baseControl} ${
    invalid
      ? 'border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_3px_rgba(197,58,93,0.10)]'
      : 'border-border focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(101,80,181,0.11)]'
  } ${extra}`;
}

/* — Field wrapper ------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className = '',
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  /** Exactly one control. Its id and aria-describedby are wired automatically. */
  children: React.ReactElement<{
    id?: string;
    'aria-describedby'?: string;
  }>;
}) {
  const generated = useId();
  const inputId = htmlFor ?? `field-${generated}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id ?? inputId,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={className}>
      <label
        htmlFor={children.props.id ?? inputId}
        className="text-ink-secondary mb-1.5 flex items-baseline gap-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {control}
      {hint && !error ? (
        <p id={hintId} className="text-ink-muted mt-1.5 text-[0.75rem]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-danger mt-1.5 text-[0.75rem] font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* — Text input ---------------------------------------------------------- */

export function TextInput({
  id,
  invalid,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, `h-10 ${className}`)}
      {...props}
    />
  );
}

/* — Search -------------------------------------------------------------- */

export function SearchInput({
  label = 'Search',
  defaultValue = '',
  placeholder = 'Search',
  className = '',
}: {
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={`search-${id}`} className="sr-only">
        {label}
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M13.5 13.5 17 17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        id={`search-${id}`}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className={controlClasses(false, 'h-10 pr-9 pl-9')}
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="text-ink-muted hover:text-foreground absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] transition-colors"
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </div>
  );
}

/* — Select -------------------------------------------------------------- */

export function Select({
  id,
  invalid,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, `h-10 cursor-pointer ${className}`)}
      {...props}
    >
      {children}
    </select>
  );
}

/* — Textarea ------------------------------------------------------------ */

export function Textarea({
  id,
  invalid,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      id={id}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, `min-h-24 py-2 ${className}`)}
      {...props}
    />
  );
}

/* — Toggle -------------------------------------------------------------- */

export function Toggle({
  label,
  description,
  defaultChecked = false,
  disabled = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label
          htmlFor={`toggle-${id}`}
          className="text-foreground text-[0.875rem] font-medium"
        >
          {label}
        </label>
        {description ? (
          <p className="text-ink-muted mt-0.5 text-[0.75rem]">{description}</p>
        ) : null}
      </div>
      <button
        id={`toggle-${id}`}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => setChecked((value) => !value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-[var(--radius-pill)] transition-colors duration-[var(--dur-base)] disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-primary' : 'bg-surface-muted border border-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-base)] ease-[var(--ease-standard)] ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/* — Checkbox ------------------------------------------------------------ */

export function Checkbox({
  label,
  description,
  defaultChecked = false,
  disabled = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div className="flex items-start gap-3">
      <input
        id={`check-${id}`}
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="border-border text-primary accent-[var(--primary)] mt-0.5 h-4 w-4 cursor-pointer rounded-[4px] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="min-w-0">
        <label
          htmlFor={`check-${id}`}
          className="text-foreground text-[0.875rem] font-medium"
        >
          {label}
        </label>
        {description ? (
          <p className="text-ink-muted mt-0.5 text-[0.75rem]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
