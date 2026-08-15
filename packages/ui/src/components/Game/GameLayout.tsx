import type { HTMLAttributes } from 'react';
import type { GameVariant } from './GameContainer';
import { cx } from '../../utils/cx';

export type GameHeaderProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GameVariant;
};

/**
 * Per-game accent colors (static tokens → hex literals).
 * Written as full string literals on purpose — Tailwind's scanner only
 * emits CSS for classes that appear verbatim in source files.
 */
const GAME_ACCENT_COLORS: Partial<Record<GameVariant, string>> = {
  cyberpunk: '#06b6d4',
  underwater: '#22d3ee',
  crime: '#dc2626',
  horror: '#10b981',
  adventure: '#f59e0b',
  'high-altitude-hike': '#38bdf8',
};

export function GameHeader({ variant, className, style, ...props }: GameHeaderProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-between gap-4 border-b bg-[var(--glassBg)] p-4 backdrop-blur-[16px] z-[30] shrink-0',
        className,
      )}
      style={{
        borderBottomColor: variant ? GAME_ACCENT_COLORS[variant] : 'var(--glassBorder)',
        ...style,
      }}
      {...props}
    />
  );
}

export type GameBoardProps = HTMLAttributes<HTMLDivElement>;

export function GameBoard({ className, style, ...props }: GameBoardProps) {
  return (
    <div
      className={cx('relative flex flex-1 flex-col overflow-hidden p-4 z-[1]', className)}
      style={style}
      {...props}
    />
  );
}

export type TableAreaProps = HTMLAttributes<HTMLDivElement>;

export function TableArea({ className, style, ...props }: TableAreaProps) {
  return (
    <div
      className={cx('relative flex flex-1 flex-row items-stretch gap-4 h-full', className)}
      style={style}
      {...props}
    />
  );
}

export type GameTitleProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GameVariant;
};

export function GameTitle({ variant, className, style, ...props }: GameTitleProps) {
  return (
    <div
      className={cx('flex flex-col items-stretch gap-1', className)}
      style={variant ? { ...style, color: GAME_ACCENT_COLORS[variant] } : style}
      {...props}
    />
  );
}
