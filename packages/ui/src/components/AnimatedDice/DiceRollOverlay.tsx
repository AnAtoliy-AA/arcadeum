'use client';

import { memo } from 'react';
import { cx } from '../../utils/cx';
import { AnimatedDice, type DiceSize, type DiceVariant } from './AnimatedDice';

export interface DiceRollOverlayProps {
  canRoll: boolean;
  isRolling: boolean;
  onRoll: () => void;
  rollLabel?: string;
  disabled?: boolean;
  values?: number[];
  lastValues?: number[];
  size?: DiceSize;
  variant?: DiceVariant;
  isDoubles?: boolean;
  resultLabel?: string;
  subtitle?: string;
  testIdPrefix?: string;
  className?: string;
}

export const DiceRollOverlay = memo(function DiceRollOverlay({
  canRoll,
  isRolling,
  onRoll,
  rollLabel = 'Roll Dice',
  disabled = false,
  values,
  lastValues,
  size = 'xl',
  variant = 'classic',
  isDoubles = false,
  resultLabel,
  subtitle,
  testIdPrefix = 'dice-overlay',
  className,
}: DiceRollOverlayProps) {
  const displayValues = isRolling
    ? values && values.length > 0
      ? values
      : [1]
    : values && values.length > 0
      ? values
      : lastValues && lastValues.length > 0
        ? lastValues
        : null;

  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300',
        className,
      )}
      data-testid={`${testIdPrefix}-container`}
    >
      {canRoll && !isRolling && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRoll}
          data-testid={`${testIdPrefix}-roll-button`}
          className="group relative flex items-center justify-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-base tracking-wide shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/40 hover:scale-105 hover:shadow-purple-500/50 hover:ring-purple-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
        >
          <span className="text-xl transition-transform duration-200 group-hover:rotate-12 group-active:scale-90">
            🎲
          </span>
          <span>{rollLabel}</span>
        </button>
      )}

      {isRolling && (
        <div
          className="flex flex-col items-center gap-2"
          data-testid={`${testIdPrefix}-rolling-state`}
        >
          <AnimatedDice
            isRolling={true}
            size={size}
            variant={variant}
            values={displayValues ?? [1]}
          />
          <span className="text-xs font-bold uppercase tracking-widest text-purple-300 animate-pulse">
            Rolling...
          </span>
        </div>
      )}

      {!isRolling && values && values.length > 0 && (
        <div
          className="flex flex-col items-center gap-2"
          data-testid={`${testIdPrefix}-result-state`}
        >
          <AnimatedDice
            size={size}
            variant={variant}
            isDoubles={isDoubles}
            values={values}
          />
          {resultLabel && (
            <span
              className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              data-testid={`${testIdPrefix}-result-label`}
            >
              {resultLabel}
            </span>
          )}
        </div>
      )}

      {!isRolling && (!values || values.length === 0) && lastValues && lastValues.length > 0 && !canRoll && (
        <div
          className="flex flex-col items-center gap-1.5 opacity-80"
          data-testid={`${testIdPrefix}-last-roll-state`}
        >
          <AnimatedDice
            size="md"
            variant={variant}
            isDoubles={isDoubles}
            values={lastValues}
          />
          {resultLabel && (
            <span className="text-[11px] font-semibold text-slate-400">
              {resultLabel}
            </span>
          )}
        </div>
      )}

      {subtitle && (
        <span className="text-xs text-slate-400 font-medium">{subtitle}</span>
      )}
    </div>
  );
});
