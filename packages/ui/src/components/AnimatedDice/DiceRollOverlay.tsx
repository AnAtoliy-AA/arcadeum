'use client';

import { memo } from 'react';
import { cx } from '../../utils/cx';
import { AnimatedDice, type DiceSize, type DiceVariant } from './AnimatedDice';

export interface DiceRollOverlayProps {
  canRoll: boolean;
  isRolling: boolean;
  onRoll: () => void;
  diceCount?: number;
  values?: number[];
  lastValues?: number[];
  rollLabel?: string;
  rollingLabel?: string;
  resultLabel?: string;
  subtitle?: string;
  disabled?: boolean;
  size?: DiceSize;
  variant?: DiceVariant;
  isDoubles?: boolean;
  showTotal?: boolean;
  layout?: 'card' | 'bare';
  rotation?: number;
  testIdPrefix?: string;
  rollButtonTestId?: string;
  className?: string;
}

const ROTATION_CLASSES: Record<number, string> = {
  0: 'rotate-0',
  90: '-rotate-90',
  180: '-rotate-180',
  270: '-rotate-[270deg]',
};

export const DiceRollOverlay = memo(function DiceRollOverlay({
  canRoll,
  isRolling,
  onRoll,
  diceCount,
  values,
  lastValues,
  rollLabel = 'Roll Dice',
  rollingLabel = 'Rolling...',
  resultLabel,
  subtitle,
  disabled = false,
  size = 'xl',
  variant = 'classic',
  isDoubles = false,
  showTotal = false,
  layout = 'card',
  rotation = 0,
  testIdPrefix = 'dice-overlay',
  rollButtonTestId,
  className,
}: DiceRollOverlayProps) {
  const targetCount = diceCount ?? values?.length ?? lastValues?.length ?? 1;
  const rollingValues = Array.from(
    { length: targetCount },
    (_, i) => values?.[i] ?? 1,
  );

  const rotationClass = ROTATION_CLASSES[rotation] ?? '';

  return (
    <div
      className={cx(
        layout === 'card'
          ? 'flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300'
          : 'flex flex-col items-center justify-center gap-2 pointer-events-none w-full h-full',
        className,
      )}
      data-testid={`${testIdPrefix}-container`}
    >
      <div
        className={cx(
          'flex flex-col items-center justify-center gap-2 pointer-events-auto',
          rotationClass,
        )}
      >
        {canRoll && !isRolling && (
          <button
            className="group relative flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40 hover:scale-105 hover:shadow-emerald-500/40 hover:ring-emerald-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer pointer-events-auto"
            data-testid={rollButtonTestId ?? `${testIdPrefix}-roll-button`}
            disabled={disabled}
            onClick={onRoll}
            type="button"
          >
            <span className="text-lg transition-transform duration-200 group-hover:rotate-12 group-active:scale-90">
              🎲
            </span>
            <span>{rollLabel}</span>
          </button>
        )}

        {canRoll && !isRolling && lastValues && lastValues.length > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-bold text-white shadow-md backdrop-blur-md pointer-events-auto"
            data-testid={`${testIdPrefix}-previous-roll-hint`}
          >
            <AnimatedDice
              size="sm"
              values={lastValues}
              variant={variant}
            />
            <span className="font-black text-emerald-300">
              {lastValues.join(', ')}
            </span>
            <span className="text-white/80">
              {resultLabel ?? 'Last roll:'}
            </span>
          </div>
        )}

        {isRolling && (
          <div
            className="flex flex-col items-center gap-2"
            data-testid={`${testIdPrefix}-rolling-state`}
          >
            <AnimatedDice
              isRolling={true}
              size={size}
              values={rollingValues}
              variant={variant}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 animate-pulse">
              {rollingLabel}
            </span>
          </div>
        )}

        {!isRolling && values && values.length > 0 && (
          <div
            className="flex flex-col items-center gap-1.5 pointer-events-auto"
            data-testid={`${testIdPrefix}-die-result`}
          >
            <div data-testid={`${testIdPrefix}-result-state`}>
              <AnimatedDice
                isDoubles={isDoubles}
                size={size}
                values={values}
                variant={variant}
              />
            </div>
            <span
              className="rounded-lg border border-emerald-400/40 bg-emerald-950/70 px-3 py-0.5 text-base font-black text-emerald-300 shadow-lg backdrop-blur-sm"
              data-testid={`${testIdPrefix}-result-label`}
            >
              {resultLabel ??
                (values.length === 1
                  ? values[0]
                  : showTotal
                    ? `Total: ${values.reduce((a, b) => a + b, 0)}`
                    : values.join(' + '))}
            </span>
          </div>
        )}

        {!canRoll &&
          !isRolling &&
          (!values || values.length === 0) &&
          lastValues &&
          lastValues.length > 0 && (
            <div
              className="flex flex-col items-center gap-1 pointer-events-auto"
              data-testid={`${testIdPrefix}-die-result`}
            >
              <div data-testid={`${testIdPrefix}-last-roll-state`}>
                <AnimatedDice
                  isDoubles={isDoubles}
                  size="md"
                  values={lastValues}
                  variant={variant}
                />
              </div>
              <span className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-2.5 py-0.5 text-xs font-bold shadow-md backdrop-blur-sm">
                <span className="font-black text-emerald-300">
                  {lastValues.join(', ')}
                </span>
                <span className="text-white/80">
                  {resultLabel ?? 'Last roll'}
                </span>
              </span>
            </div>
          )}

        {subtitle && (
          <span className="text-xs text-slate-400 font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
});
