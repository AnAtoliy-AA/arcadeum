'use client';

import React, { useId } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';

/**
 * Building blocks for per-game lobby option panels. They sit inside the
 * shared "Game settings" card and follow the same look as LobbySegmented:
 * 44px targets, design tokens, labelled groups with one-line helper text.
 */

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]';

interface LobbyOptionGroupProps {
  title: string;
  /** One-line helper text under the controls. */
  hint?: string;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

/** Labelled group of related controls with optional helper text. */
export function LobbyOptionGroup({
  title,
  hint,
  children,
  className,
  'data-testid': testId,
}: LobbyOptionGroupProps) {
  return (
    <div
      data-testid={testId}
      className={cx('flex w-full min-w-0 flex-col gap-2', className)}
    >
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--textSecondary)]">
        {title}
      </span>
      {children}
      {hint && <p className="text-xs text-[var(--textMuted)]">{hint}</p>}
    </div>
  );
}

export interface LobbyChoiceItem {
  id: string;
  label: string;
  emoji?: string;
  /** Shown as helper text while this item is selected. */
  description?: string;
  testId?: string;
  disabled?: boolean;
  /** Small badge such as "Coming soon". */
  badge?: string;
}

interface LobbyChoiceProps {
  items: readonly LobbyChoiceItem[];
  value: string;
  onChange: (id: string) => void;
  'aria-label': string;
  disabled?: boolean;
  /** Prefix for generated test ids (`${prefix}-${id}`) when an item has none. */
  testIdPrefix?: string;
  /** Show the selected item's description under the control. */
  showDescription?: boolean;
  className?: string;
}

/**
 * Single-select radiogroup that supports a disabled (non-host) state, emoji,
 * badges and per-option descriptions. Few options render as a segmented
 * control, many wrap as pills.
 */
export function LobbyChoice({
  items,
  value,
  onChange,
  'aria-label': ariaLabel,
  disabled = false,
  testIdPrefix,
  showDescription = true,
  className,
}: LobbyChoiceProps) {
  const descId = useId();
  const segmented = items.length <= 3;
  const active = items.find((i) => i.id === value);
  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-describedby={active?.description ? descId : undefined}
        className={cx(
          'flex w-full flex-row flex-wrap gap-1.5',
          segmented &&
            'rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-1',
          className,
        )}
      >
        {items.map((item) => {
          const isActive = item.id === value;
          const isDisabled = disabled || item.disabled;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isDisabled}
              aria-disabled={isDisabled || undefined}
              data-testid={
                item.testId ??
                (testIdPrefix ? `${testIdPrefix}-${item.id}` : undefined)
              }
              data-active={isActive ? 'on' : undefined}
              onClick={() => onChange(item.id)}
              className={cx(
                'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 px-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none',
                FOCUS,
                segmented
                  ? 'flex-1 rounded-lg'
                  : 'rounded-xl border border-[var(--glassBorder)]',
                isActive
                  ? 'bg-[var(--primary)] text-[var(--primaryText)] shadow-sm'
                  : 'text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--textPrimary)]',
                !segmented && !isActive && 'bg-[var(--surface)]',
                isDisabled &&
                  (isActive
                    ? 'cursor-default'
                    : 'cursor-not-allowed opacity-50'),
              )}
            >
              {item.emoji && <span aria-hidden>{item.emoji}</span>}
              {item.label}
              {item.badge && (
                <span className="rounded-full bg-[var(--backgroundHover)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--textSecondary)]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showDescription && active?.description && (
        <p id={descId} className="text-xs text-[var(--textMuted)]">
          {active.description}
        </p>
      )}
    </div>
  );
}

interface LobbySwitchRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
  testId?: string;
}

/** Full-width on/off row: label and helper on the left, switch on the right. */
export function LobbySwitchRow({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled = false,
  badge,
  testId,
}: LobbySwitchRowProps) {
  const id = useId();
  return (
    <div className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-4 py-2">
      <div className="flex min-w-0 flex-col">
        <span
          id={`${id}-label`}
          className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--textPrimary)]"
        >
          {label}
          {badge && (
            <span className="rounded-full bg-[var(--warning)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--textPrimary)]">
              {badge}
            </span>
          )}
        </span>
        {hint && (
          <span id={`${id}-hint`} className="text-xs text-[var(--textMuted)]">
            {hint}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        data-testid={testId}
        onClick={() => onCheckedChange(!checked)}
        className={cx(
          'relative inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full',
          FOCUS,
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          aria-hidden
          className={cx(
            'flex h-6 w-11 items-center rounded-full p-1 transition-colors motion-reduce:transition-none',
            checked ? 'bg-[var(--primary)]' : 'bg-[var(--borderColor)]',
          )}
        >
          <span
            className={cx(
              'block h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none',
              checked ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </span>
      </button>
    </div>
  );
}

interface LobbySubAdvancedProps {
  title: string;
  children: React.ReactNode;
  testId?: string;
}

/** Collapsed disclosure for rarely changed options of a single game. */
export function LobbySubAdvanced({
  title,
  children,
  testId,
}: LobbySubAdvancedProps) {
  return (
    <details
      data-testid={testId}
      className="group rounded-xl border border-[var(--borderColor)] bg-[var(--backgroundHover)]"
    >
      <summary
        className={cx(
          'flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--textPrimary)] [&::-webkit-details-marker]:hidden',
          FOCUS,
        )}
      >
        {title}
        <span
          aria-hidden
          className="text-xs transition-transform motion-reduce:transition-none group-open:rotate-180"
        >
          ▼
        </span>
      </summary>
      <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>
    </details>
  );
}

/** Notice for non-hosts: settings are read only. */
export function LobbyHostOnlyNote({ show = true }: { show?: boolean }) {
  const { t } = useTranslation();
  if (!show) return null;
  return (
    <p
      data-testid="lobby-host-only-note"
      className="flex items-center gap-2 rounded-xl bg-[var(--backgroundHover)] px-3 py-2 text-xs text-[var(--textSecondary)]"
    >
      <span aria-hidden>🔒</span>
      {t('games.lobby.hostOnlyNote')}
    </p>
  );
}

/** Vertical stack used as the root of a per-game option panel. */
export function LobbyOptionStack({
  children,
  className,
  'data-testid': testId,
}: {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}) {
  return (
    <div
      data-testid={testId}
      className={cx('flex w-full min-w-0 flex-col gap-5', className)}
    >
      {children}
    </div>
  );
}
