'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';

export type DiceSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DiceVariant = 'classic' | 'dark' | 'gold' | 'neon' | 'wood';

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

const STANDARD_CUBE_FACES = [
  { value: 1, faceClass: 'dice-face-front' },
  { value: 2, faceClass: 'dice-face-top brightness-105' },
  { value: 3, faceClass: 'dice-face-right brightness-95' },
  { value: 4, faceClass: 'dice-face-left brightness-90' },
  { value: 5, faceClass: 'dice-face-bottom brightness-80' },
  { value: 6, faceClass: 'dice-face-back brightness-75' },
] as const;

const ORIENT_CLASSES: Record<number, string> = {
  1: 'dice-orient-1 animate-dice-3d-land-1',
  2: 'dice-orient-2 animate-dice-3d-land-2',
  3: 'dice-orient-3 animate-dice-3d-land-3',
  4: 'dice-orient-4 animate-dice-3d-land-4',
  5: 'dice-orient-5 animate-dice-3d-land-5',
  6: 'dice-orient-6 animate-dice-3d-land-6',
};

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
  neon:
    'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.35),inset_0_2px_4px_rgba(34,211,238,0.4)]',
  wood:
    'bg-gradient-to-br from-amber-900 via-amber-950 to-amber-900 border-amber-700/80 shadow-[inset_0_2px_4px_rgba(251,191,36,0.25),inset_0_-2px_4px_rgba(0,0,0,0.6)]',
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
        const orientClass = ORIENT_CLASSES[clampedVal] ?? ORIENT_CLASSES[1];
        const microTilt = !isRolling ? (isOdd ? '-rotate-2' : 'rotate-1') : '';

        const rollingAnimClass = isOdd
          ? 'animate-dice-3d-tumble-alt animated-dice-shake'
          : 'animate-dice-3d-tumble animated-dice-shake';

        return (
          <div
            className={cx(
              'dice-perspective relative flex flex-col items-center justify-center transition-transform duration-300',
              microTilt,
            )}
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
                  ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-dice-spark'
                  : variant === 'neon'
                    ? 'border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : variant === 'classic'
                      ? 'border-slate-300 shadow-xl'
                      : 'border-white/20 shadow-black/60',
                isRolling && rollingAnimClass,
                !isRolling &&
                  `${orientClass} hover:scale-110 active:scale-95 duration-200 cursor-default`,
              )}
              data-testid={`dice-die-${idx}`}
              key={`die-${idx}-${clampedVal}-${isRolling ? 'rolling' : 'settled'}`}
            >
              {STANDARD_CUBE_FACES.map((face) => {
                const dots = DOT_PATTERNS[face.value] ?? DOT_PATTERNS[1];

                let dotFill = '#f8fafc';
                if (isDoubles) {
                  dotFill = '#fbbf24';
                } else if (variant === 'classic') {
                  dotFill = face.value === 1 ? '#dc2626' : '#0f172a';
                } else if (variant === 'gold') {
                  dotFill = '#78350f';
                } else if (variant === 'neon') {
                  dotFill = '#22d3ee';
                } else if (variant === 'wood') {
                  dotFill = '#fef3c7';
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
                        : variant === 'neon'
                          ? 'border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
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
