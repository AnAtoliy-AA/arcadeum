'use client';
import { memo, useEffect, useRef, useState } from 'react';
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

const FACE_COUNT = 6;
const CYCLE_INTERVAL_MS = 70;

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

        return (
          <div
            className={cx(
              sizeConfig.container,
              'relative flex items-center justify-center border-2 transition-all duration-300 select-none shadow-xl backdrop-blur-md',
              'bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90',
              isDoubles
                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-1 ring-amber-300'
                : 'border-white/20 shadow-black/60',
              isRolling && 'animate-[animated-dice-shake_0.12s_ease-in-out_infinite]',
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
