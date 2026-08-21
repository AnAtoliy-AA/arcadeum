import { memo } from 'react';
import { cx } from '../../utils/cx';

export type DiceSize = 'sm' | 'md' | 'lg';

export interface AnimatedDiceProps {
  values: number[];
  isRolling?: boolean;
  size?: DiceSize;
  className?: string;
  isDoubles?: boolean;
}

const DOT_PATTERNS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 28],
    [72, 28],
    [28, 50],
    [72, 50],
    [28, 72],
    [72, 72],
  ],
};

const sizeClasses: Record<DiceSize, { container: string; dotRadius: number }> = {
  sm: { container: 'w-7 h-7 rounded-md', dotRadius: 8.5 },
  md: { container: 'w-9 h-9 rounded-lg', dotRadius: 9 },
  lg: { container: 'w-12 h-12 rounded-xl', dotRadius: 9.5 },
};

export const AnimatedDice = memo(function AnimatedDice({
  values,
  isRolling = false,
  size = 'md',
  className,
  isDoubles = false,
}: AnimatedDiceProps) {
  const sizeConfig = sizeClasses[size];

  return (
    <div className={cx('flex flex-row items-center justify-center gap-2.5', className)}>
      {values.map((val, idx) => {
        const clampedVal = Math.min(Math.max(val, 1), 6);
        const dots = DOT_PATTERNS[clampedVal] ?? DOT_PATTERNS[1];

        return (
          <div
            className={cx(
              sizeConfig.container,
              'relative flex items-center justify-center border-2 transition-all duration-300 select-none shadow-xl backdrop-blur-md',
              'bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90',
              isDoubles
                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-1 ring-amber-300'
                : 'border-white/20 shadow-black/60',
              isRolling && idx % 2 === 0 && 'animate-spin',
              isRolling && idx % 2 !== 0 && 'animate-bounce',
              !isRolling && 'hover:scale-105 active:scale-95',
            )}
            data-testid={`dice-die-${idx}`}
            key={`die-${idx}-${val}`}
          >
            <svg className="w-full h-full p-1" viewBox="0 0 100 100">
              {dots.map(([cxCoord, cyCoord], dotIdx) => (
                <circle
                  cx={cxCoord}
                  cy={cyCoord}
                  fill={isDoubles ? '#fbbf24' : '#f8fafc'}
                  key={dotIdx}
                  r={sizeConfig.dotRadius}
                />
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
});
