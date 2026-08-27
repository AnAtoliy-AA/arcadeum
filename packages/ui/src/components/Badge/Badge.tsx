import { memo } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { GameVariant } from '../Button/types';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

const badgeBase =
  'inline-flex flex-row items-center gap-[6px] justify-center whitespace-nowrap rounded-full border border-solid font-bold uppercase tracking-[0.16em] backdrop-blur';

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-[9px] py-1 text-[10px]',
  md: 'px-3 py-1 text-[12px]',
};

const badgeVariants: Record<BadgeVariant, { border: string; text: string; dotColor?: string }> = {
  success: {
    border: 'border-[rgba(16,185,129,0.35)]',
    text: 'text-[#6ee7b7]',
    dotColor: '#10b981',
  },
  warning: {
    border: 'border-[rgba(245,158,11,0.35)]',
    text: 'text-[#fcd34d]',
    dotColor: '#f59e0b',
  },
  error: {
    border: 'border-[rgba(239,68,68,0.35)]',
    text: 'text-[#fca5a5]',
    dotColor: '#ef4444',
  },
  info: {
    border: 'border-[rgba(56,189,248,0.35)]',
    text: 'text-[#7dd3fc]',
    dotColor: '#38bdf8',
  },
  neutral: {
    border: 'border-[rgba(148,163,184,0.35)]',
    text: 'text-[#cbd5e1]',
    dotColor: '#94a3b8',
  },
};

const badgeGameVariants: Record<GameVariant, string> = {
  cyberpunk: 'border-[#c026d3] text-[#22d3ee]',
  underwater: 'border-[#0ea5e9] text-[#22d3ee]',
  crime: 'border-[#991b1b] text-[#f87171]',
  horror: 'border-[#065f46] text-[#34d399]',
  adventure: 'border-[#b45309] text-[#fbbf24]',
  'high-altitude-hike': 'border-[#0ea5e9] text-[#38bdf8]',
};

export type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  accent?: string;
  dot?: boolean;
  gameVariant?: GameVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
};

export const Badge = memo(function Badge({
  variant,
  size,
  accent,
  dot = false,
  gameVariant,
  title,
  className,
  children,
}: BadgeProps): ReactElement {
  if (accent) {
    const style = { '--pill-accent': accent } as CSSProperties;
    return (
      <span
        title={title}
        className={cx(
          badgeBase,
          badgeSizes[size ?? 'sm'],
          'border-[color:color-mix(in_srgb,var(--pill-accent)_35%,transparent)] text-[color:color-mix(in_srgb,var(--pill-accent)_80%,white)]',
          className,
        )}
        style={style}
      >
        {dot ? (
          <span
            className="inline-block h-[5px] w-[5px] rounded-full bg-[var(--pill-accent)] shadow-[0_0_8px_var(--pill-accent)]"
            aria-hidden
          />
        ) : null}
        {children}
      </span>
    );
  }

  const resolvedVariant = badgeVariants[variant ?? 'neutral'];

  return (
    <span
      title={title}
      className={cx(
        badgeBase,
        badgeSizes[size ?? 'sm'],
        resolvedVariant.border,
        resolvedVariant.text,
        gameVariant && badgeGameVariants[gameVariant],
        className,
      )}
    >
      {dot && resolvedVariant.dotColor ? (
        <span
          className="inline-block h-[5px] w-[5px] rounded-full shadow-[0_0_8px_currentColor]"
          style={{ backgroundColor: resolvedVariant.dotColor }}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
});
