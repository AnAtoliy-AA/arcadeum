import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Horizontal flex row on desktop (≥1150px), vertical stack on mobile/tablet.
 * Wraps GameWrapper + ChatPanel side by side. The caller derives
 * `flexDirection` from `useMediaQuery().gtMd`, so the prop is applied
 * directly as the source of truth at every viewport.
 */
export function GameRow({
  flexDirection,
  className,
  style,
  ...props
}: {
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-1 items-stretch gap-4 relative min-h-0',
        flexDirection === 'row' ? 'flex-row' : 'flex-col',
        className,
      )}
      style={style}
      {...props}
    />
  );
}

/**
 * Chat panel — fixed 320px wide on desktop, full width below game on mobile/tablet.
 * Uses glassmorphism for a premium look and separates cleanly from the game.
 */
export function ChatPanel({
  visible,
  className,
  ...props
}: {
  visible?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'w-[350px] min-w-[350px] h-full min-h-[350px] shrink-0 rounded-2xl overflow-hidden max-[1150px]:w-full max-[1150px]:min-w-0 max-[1150px]:min-h-0 max-[1150px]:h-auto max-[1150px]:mt-2 max-[1150px]:rounded-lg',
        visible === false && 'hidden',
        className,
      )}
      {...props}
    />
  );
}
