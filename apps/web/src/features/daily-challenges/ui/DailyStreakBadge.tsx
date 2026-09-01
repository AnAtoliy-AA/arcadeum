import React from 'react';

export interface DailyStreakBadgeProps {
  streak: number;
  multiplier?: number;
  className?: string;
}

export function DailyStreakBadge({
  streak,
  multiplier = 1.0,
  className = '',
}: DailyStreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      data-testid="daily-streak-badge"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
        isActive
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10'
          : 'bg-surface-elevated/40 border-border/30 text-text-muted'
      } ${className}`}
    >
      <span className="text-sm select-none" role="img" aria-label="Streak Fire">
        🔥
      </span>
      <span>
        {streak} Day{streak === 1 ? '' : 's'} Streak
      </span>
      {multiplier > 1.0 && (
        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-bold text-amber-300">
          {multiplier}x XP
        </span>
      )}
    </div>
  );
}
