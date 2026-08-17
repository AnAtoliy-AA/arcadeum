import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Horizontal flex row on desktop (≥1150px), vertical stack below.
 * Wraps GameWrapper + ChatPanel side by side.
 */
export function GameRow({
  className,
  ...props
}: {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row flex-1 items-stretch gap-4 relative min-h-0 max-[1150px]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Chat panel — fixed 350px wide on desktop, full width below the game on
 * mobile/tablet. Fills the room's row height (h-full) so it always fits the
 * screen; internal scrolling handles message overflow.
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
        'w-[350px] min-w-[350px] h-full min-h-0 shrink-0 rounded-2xl overflow-hidden max-[1150px]:w-full max-[1150px]:min-w-0 max-[1150px]:min-h-0 max-[1150px]:h-auto max-[1150px]:mt-2 max-[1150px]:rounded-lg',
        visible === false && 'hidden',
        className,
      )}
      {...props}
    />
  );
}
