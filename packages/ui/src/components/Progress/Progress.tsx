import { memo } from 'react';

import { GameVariant } from '../Game/GameContainer';

export type ProgressBarProps = {
  value: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
  gameVariant?: GameVariant;
  className?: string;
};

const GAME_COLORS: Record<string, string> = {
  cyberpunk: '#06b6d4',
  underwater: '#22d3ee',
  crime: '#dc2626',
  horror: '#10b981',
  adventure: '#f59e0b',
  'high-altitude-hike': '#38bdf8',
};

/** Resolve a $token / CSS value into a usable color string. */
function resolveColor(value: string): string {
  if (value.startsWith('$')) {
    const name = value.slice(1);
    return `var(--${name})`;
  }
  return value;
}

export const ProgressBar = memo(function ProgressBar({
  value,
  height = 8,
  color = '$primary',
  showLabel = false,
  gameVariant,
  className,
}: ProgressBarProps) {
  const indicatorColor = gameVariant
    ? GAME_COLORS[gameVariant] ?? resolveColor(color)
    : resolveColor(color);
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex w-full flex-col gap-2 ${className ?? ''}`}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full overflow-hidden rounded-full bg-[var(--borderColor)]"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: indicatorColor }}
        />
      </div>
      {showLabel && (
        <span className="text-right text-[14px] leading-[18px]">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
});

export type ProgressCircleProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  animate?: boolean;
  suffix?: string;
};

export const ProgressCircle = memo(function ProgressCircle({
  value,
  size = 80,
  strokeWidth = 8,
  color = '$primary',
  showLabel = true,
  suffix = '%',
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--neutralBorder)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            color: resolveColor(color),
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[18px] font-bold leading-[24px]">
            {Math.round(clamped)}
            {suffix}
          </span>
        </div>
      )}
    </div>
  );
});

export type WinRateBadgeProps = {
  wins: number;
  losses: number;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
};

const WIN_RATE_SIZE_MAP = { sm: 60, md: 80, lg: 100 } as const;

export const WinRateBadge = memo(function WinRateBadge({
  wins,
  losses,
  size = 'md',
  showStats = true,
}: WinRateBadgeProps) {
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="flex flex-row items-center gap-4">
      <ProgressCircle value={winRate} size={WIN_RATE_SIZE_MAP[size]} />
      {showStats && (
        <div className="flex flex-col items-stretch gap-2">
          <div className="flex flex-row items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            <span className="text-[14px] font-semibold leading-[18px]">
              Wins: {wins}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--danger)]" />
            <span className="text-[14px] font-semibold leading-[18px]">
              Losses: {losses}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
