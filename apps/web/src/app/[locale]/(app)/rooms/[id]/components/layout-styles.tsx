import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Horizontal flex row on desktop (≥1150px), vertical stack below.
 * Wraps GameWrapper + ChatPanel side by side.
 */
export function GameRow({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row flex-1 items-stretch gap-4 relative min-h-0 max-[1150px]:flex-col',
        className,
      )}
    >
      {children}
    </div>
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
  children,
  'data-testid': dataTestId,
}: {
  visible?: boolean;
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'w-[350px] min-w-[350px] h-full min-h-0 shrink-0 rounded-2xl overflow-hidden max-[1150px]:w-full max-[1150px]:min-w-0 max-[1150px]:min-h-0 max-[1150px]:max-h-[50vh] max-[1150px]:mt-2 max-[1150px]:rounded-lg',
        visible === false && 'hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}
