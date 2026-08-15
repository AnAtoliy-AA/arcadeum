import { memo } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { GameVariant } from '../Button/types';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

const badgeBase =
  'box-border inline-flex flex-row items-center justify-center border font-bold tracking-[0.5px] text-[#f5f7ff]';

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-3 py-3 rounded text-[12px]',
  md: 'px-4 py-4 rounded-lg text-[14px]',
};

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-[var(--success)] border-[rgba(4,120,87,0.4)]',
  warning: 'bg-[var(--warning)] border-[rgba(146,64,14,0.4)]',
  error: 'bg-[var(--danger)] border-[rgba(185,28,28,0.4)]',
  info: 'bg-[var(--primary)] border-[rgba(37,99,235,0.4)]',
  neutral: 'bg-[var(--neutral)] border-[rgba(142,145,150,0.4)]',
};

const badgeGameVariants: Record<GameVariant, string> = {
  cyberpunk: 'bg-[#06b6d4] border-[#c026d3]',
  underwater: 'bg-[#22d3ee] border-[#0ea5e9]',
  crime: 'bg-[#dc2626] border-[#991b1b]',
  horror: 'bg-[#10b981] border-[#065f46]',
  adventure: 'bg-[#f59e0b] border-[#b45309]',
  'high-altitude-hike': 'bg-[#38bdf8] border-[#0ea5e9]',
};

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  gameVariant?: GameVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
};

export const Badge = memo(function Badge({
  variant,
  size,
  gameVariant,
  className,
  ...rest
}: BadgeProps): ReactElement {
  return (
    <span
      className={cx(
        badgeBase,
        badgeSizes[size ?? 'md'],
        badgeVariants[variant ?? 'neutral'],
        gameVariant && badgeGameVariants[gameVariant],
        className,
      )}
      {...rest}
    />
  );
});
