'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';

export type DiceSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DiceVariant = 'classic' | 'dark' | 'gold';

export interface AnimatedDiceProps {
  values: number[];
  isRolling?: boolean;
  size?: DiceSize;
  variant?: DiceVariant;
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

const FACE_COUNT = 6;
const CYCLE_INTERVAL_MS = 70;

const sizeClasses: Record<DiceSize, { container: string; dotRadius: number }> = {
  sm: { container: 'w-7 h-7 rounded-md', dotRadius: 8.5 },
  md: { container: 'w-9 h-9 rounded-lg', dotRadius: 9 },
  lg: { container: 'w-12 h-12 rounded-xl', dotRadius: 9.5 },
  xl: { container: 'w-16 h-16 rounded-2xl', dotRadius: 10 },
  '2xl': { container: 'w-20 h-20 rounded-2xl', dotRadius: 10.5 },
};

const variantClasses: Record<DiceVariant, string> = {
  classic:
    'bg-gradient-to-br from-white via-slate-50 to-slate-200 border-slate-200 shadow-[0_8px_25px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.1)]',
  dark:
    'bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 border-white/20 shadow-black/60',
  gold:
    'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-amber-300 shadow-[0_8px_25px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)]',
};

export const AnimatedDice = memo(function AnimatedDice({
  values,
  isRolling = false,
  size = 'md',
  variant = 'classic',
  className,
  isDoubles = false,
}: AnimatedDiceProps) {
  const sizeConfig = sizeClasses[size];
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayValues, setDisplayValues] = useState(values);

  useEffect(() => {
    if (isRolling) {
      intervalRef.current = setInterval(() => {
        setDisplayValues(
          values.map(() => Math.floor(Math.random() * FACE_COUNT) + 1),
        );
      }, CYCLE_INTERVAL_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRolling, values]);

  const faceValues = isRolling ? displayValues : values;

  return (
    <div
      className={cx(
        'flex flex-row items-center justify-center gap-2.5',
        className,
      )}
    >
      {faceValues.map((val, idx) => {
        const clampedVal = Math.min(Math.max(val, 1), 6);
        const dots = DOT_PATTERNS[clampedVal] ?? DOT_PATTERNS[1];

        let dotFill = '#f8fafc';
        if (isDoubles) {
          dotFill = '#fbbf24';
        } else if (variant === 'classic') {
          dotFill = clampedVal === 1 ? '#dc2626' : '#0f172a';
        } else if (variant === 'gold') {
          dotFill = '#78350f';
        }

        return (
          <div
            className={cx(
              sizeConfig.container,
              'relative flex items-center justify-center border-2 transition-all duration-300 select-none backdrop-blur-md',
              variantClasses[variant],
              isDoubles
                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-1 ring-amber-300'
                : variant === 'classic'
                  ? 'border-slate-300/80 shadow-lg'
                  : 'border-white/20 shadow-black/60',
              isRolling &&
                'animate-[animated-dice-shake_0.14s_ease-in-out_infinite]',
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
                  fill={dotFill}
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
