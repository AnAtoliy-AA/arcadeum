import { cx } from '../../utils/cx';
import type { PlayerAvatarSize } from './constants';

const PILL_SIZE: Record<PlayerAvatarSize, string> = {
  icon: 'text-[9px] leading-[12px] min-w-[14px] px-1',
  sm: 'text-[10px] leading-[13px] min-w-[18px] px-1.5',
  md: 'text-[11px] leading-[15px] min-w-[22px] px-2',
  lg: 'text-[13px] leading-[18px] min-w-[28px] px-2.5',
  card: 'text-[13px] leading-[18px] min-w-[28px] px-2.5',
  profile: 'text-[14px] leading-[20px] min-w-[32px] px-3',
};

export interface LevelPillProps {
  level: number;
  size: PlayerAvatarSize;
  testId?: string;
}

export function LevelPill({ level, size, testId }: LevelPillProps) {
  return (
    <span
      aria-label={`Level ${level}`}
      data-testid={testId ? `${testId}-level` : undefined}
      className={cx(
        'absolute bottom-0 left-1/2 z-[3] -translate-x-1/2 translate-y-1/2',
        'rounded-full border border-[var(--primary)] bg-[var(--surfaceSecondary)]',
        'text-center font-extrabold tabular-nums text-[var(--color)] shadow-md',
        PILL_SIZE[size],
      )}
    >
      {level}
    </span>
  );
}
