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

function getCubeFaces(frontVal: number) {
  const f = Math.min(Math.max(frontVal, 1), 6);
  const back = 7 - f;
  const topMap: Record<number, number> = {
    1: 2,
    2: 6,
    3: 2,
    4: 2,
    5: 1,
    6: 5,
  };
  const rightMap: Record<number, number> = {
    1: 3,
    2: 3,
    3: 6,
    4: 1,
    5: 3,
    6: 3,
  };
  const top = topMap[f] ?? 2;
  const bottom = 7 - top;
  const right = rightMap[f] ?? 3;
  const left = 7 - right;

  return [
    { value: f, faceClass: 'dice-face-front' },
    { value: top, faceClass: 'dice-face-top brightness-105' },
    { value: right, faceClass: 'dice-face-right brightness-95' },
    { value: left, faceClass: 'dice-face-left brightness-90' },
    { value: bottom, faceClass: 'dice-face-bottom brightness-80' },
    { value: back, faceClass: 'dice-face-back brightness-75' },
  ] as const;
}

const FACE_COUNT = 6;
const CYCLE_INTERVAL_MS = 95;

const sizeClasses: Record<
  DiceSize,
  {
    container: string;
    cubeClass: string;
    dotRadius: number;
    shadow: string;
    radius: string;
  }
> = {
  sm: {
    container: 'w-7 h-7',
    cubeClass: 'dice-cube-sm',
    dotRadius: 8.5,
    shadow: 'w-6 h-1.5',
    radius: 'rounded-lg',
  },
  md: {
    container: 'w-9 h-9',
    cubeClass: 'dice-cube-md',
    dotRadius: 9,
    shadow: 'w-8 h-2',
    radius: 'rounded-xl',
  },
  lg: {
    container: 'w-12 h-12',
    cubeClass: 'dice-cube-lg',
    dotRadius: 9.5,
    shadow: 'w-10 h-2.5',
    radius: 'rounded-xl',
  },
  xl: {
    container: 'w-16 h-16',
    cubeClass: 'dice-cube-xl',
    dotRadius: 10,
    shadow: 'w-14 h-3',
    radius: 'rounded-2xl',
  },
  '2xl': {
    container: 'w-20 h-20',
    cubeClass: 'dice-cube-2xl',
    dotRadius: 10.5,
    shadow: 'w-16 h-3.5',
    radius: 'rounded-3xl',
  },
};

const variantClasses: Record<DiceVariant, string> = {
  classic:
    'bg-gradient-to-br from-white via-slate-50 to-slate-200 border-slate-300/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.15)]',
  dark:
    'bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)]',
  gold:
    'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-amber-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]',
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
        'dice-perspective flex flex-row items-center justify-center gap-4 py-2',
        className,
      )}
    >
      {faceValues.map((val, idx) => {
        const clampedVal = Math.min(Math.max(val, 1), 6);
        const isOdd = idx % 2 === 1;
        const cubeFaces = getCubeFaces(clampedVal);

        const rollingAnimClass = isOdd
          ? 'animate-dice-3d-tumble-alt animated-dice-shake'
          : 'animate-dice-3d-tumble animated-dice-shake';

        return (
          <div
            className="dice-perspective relative flex flex-col items-center justify-center"
            key={`die-container-${idx}`}
          >
            <div
              className={cx(
                'absolute -bottom-2 rounded-full blur-[3px] pointer-events-none transition-all duration-200 bg-black/50',
                sizeConfig.shadow,
                isRolling ? 'animate-dice-shadow' : 'opacity-40',
              )}
            />
            <div
              className={cx(
                sizeConfig.container,
                sizeConfig.cubeClass,
                sizeConfig.radius,
                'preserve-3d relative flex items-center justify-center select-none transform-gpu transition-transform',
                variantClasses[variant],
                isDoubles
                  ? 'border-amber-400 ring-1 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                  : variant === 'classic'
                    ? 'border-slate-300 shadow-xl'
                    : 'border-white/20 shadow-black/60',
                isRolling && rollingAnimClass,
                !isRolling &&
                  'animate-dice-land hover:scale-110 active:scale-95 duration-200 cursor-default',
              )}
              data-testid={`dice-die-${idx}`}
              key={`die-${idx}-${clampedVal}-${isRolling ? 'rolling' : 'settled'}`}
            >
              {cubeFaces.map((face) => {
                const dots = DOT_PATTERNS[face.value] ?? DOT_PATTERNS[1];

                let dotFill = '#f8fafc';
                if (isDoubles) {
                  dotFill = '#fbbf24';
                } else if (variant === 'classic') {
                  dotFill = face.value === 1 ? '#dc2626' : '#0f172a';
                } else if (variant === 'gold') {
                  dotFill = '#78350f';
                }

                return (
                  <div
                    className={cx(
                      'absolute inset-0 flex items-center justify-center border-2 backface-hidden overflow-hidden',
                      face.faceClass,
                      sizeConfig.radius,
                      variantClasses[variant],
                      isDoubles
                        ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                        : variant === 'classic'
                          ? 'border-slate-300 shadow-[0_6px_16px_rgba(0,0,0,0.22),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.14)]'
                          : 'border-white/20 shadow-[0_6px_16px_rgba(0,0,0,0.4)]',
                    )}
                    key={`face-${face.faceClass}-${face.value}`}
                  >
                    <div className="pointer-events-none absolute inset-x-1 top-0.5 h-1/3 rounded-t bg-gradient-to-b from-white/35 to-transparent" />
                    <svg className="h-full w-full p-1.5" viewBox="0 0 100 100">
                      {dots.map(([cxCoord, cyCoord], dotIdx) => {
                        const radius =
                          face.value === 1
                            ? sizeConfig.dotRadius * 1.35
                            : sizeConfig.dotRadius;

                        return (
                          <g key={dotIdx}>
                            <circle
                              cx={cxCoord}
                              cy={cyCoord}
                              fill={dotFill}
                              r={radius}
                            />
                            <circle
                              cx={cxCoord - radius * 0.28}
                              cy={cyCoord - radius * 0.28}
                              fill="rgba(255,255,255,0.45)"
                              r={radius * 0.3}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});
