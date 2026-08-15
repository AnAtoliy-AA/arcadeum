import type { HTMLAttributes } from 'react';
import type { GameVariant } from './GameContainer';
import { cx } from '../../utils/cx';
import { GAME_ACCENT_COLORS } from './gamePalette';

export type GameHeaderProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GameVariant;
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
