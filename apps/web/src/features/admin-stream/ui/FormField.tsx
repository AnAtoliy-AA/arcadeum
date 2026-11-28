'use client';

import { useId, type ReactNode } from 'react';
import { Input, Typography } from '@arcadeum/ui';
import type { FieldErrors } from '../lib/streamSettings';
import type { StreamT } from './useStreamT';

/** Translate a validation error for display. */
export function errorText(t: StreamT, err: FieldErrors[string]): string {
  return t(`errors.${err.code}`, { min: err.min ?? 0, max: err.max ?? 0 });
}

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}

export function FieldShell({
  label,
  hint,
  error,
  htmlFor,
  children,
}: FieldShellProps) {
  const describedBy = `${htmlFor}-desc`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-[var(--colorText)]"
      >
        {label}
      </label>
      {children}
      <div id={describedBy} className="flex flex-col gap-0.5">
        {hint ? (
          <Typography variant="caption" uiSize="xs" alpha="medium">
            {hint}
          </Typography>
        ) : null}
        {error ? (
          <span
            role="alert"
            className="text-xs font-semibold text-[var(--danger)]"
          >
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  error?: string;
  disabled?: boolean;
  testId: string;
  onChange: (value: number) => void;
}

/** Number input with a visible unit. Empty input becomes NaN (invalid). */
export function NumberField({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  hint,
  error,
  disabled,
  testId,
  onChange,
}: NumberFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            size="sm"
            fullWidth
            min={min}
            max={max}
            step={step}
            value={Number.isFinite(value) ? String(value) : ''}
            error={Boolean(error)}
            disabled={disabled}
            data-testid={testId}
            aria-describedby={`${id}-desc`}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(raw === '' ? Number.NaN : Number(raw));
            }}
          />
        </div>
        <span className="shrink-0 text-sm text-[var(--neutral)]" aria-hidden>
          {unit}
        </span>
      </div>
    </FieldShell>
  );
}
