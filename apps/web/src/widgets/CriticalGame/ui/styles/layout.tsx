import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import {
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
} from '@arcadeum/ui';

// NOTE: the old `GameContainer` styled wrapper was removed when Critical
// adopted the shared `GameWidgetContainer` (header / fullscreen / chat popup /
// my-turn border now live in the shared shell). The per-variant room
// background it carried is handled by the shared shell + `SceneBackdrop`.

/**
 * Legacy styled-wrapper props that conflict with the base `@arcadeum/ui`
 * classes are carried via inline style so they always win regardless of
 * Tailwind class order.
 */
export function GameBoard({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseGameBoard
      className={cx(
        'box-border flex-col w-full gap-4 max-[800px]:gap-2 max-[800px]:p-0',
        className,
      )}
      style={{
        position: 'relative',
        zIndex: 20,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
        ...style,
      }}
      {...props}
    />
  );
}

export function TableArea({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseTableArea
      className={cx('box-border w-full gap-4 max-[800px]:gap-2', className)}
      style={{
        position: 'relative',
        zIndex: 1,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'column',
        minHeight: 0,
        height: 'auto',
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Widget-mode grid: 3-row stack (opponents · arena · hand) with a max
 * width and explicit gutters. Replaces the legacy `GameBoard` wrapper
 * for `MatchWidget` so the rows don't span full bleed and the hand
 * stays clear of the screen edges on wide monitors.
 *
 * `paddingBottom` on `$sm` reserves room for the sticky `MobileHandBar`
 * which is portaled to body and thus outside this grid's flow.
 */
// §3.3 — `maxWidth` is the upper bound; the actual constraint is the
// `min(1240px, calc(100vw - 48px))` rule in hudStyles.tsx keyed off
// `[data-testid="match-widget-grid"]`. Keep this number in sync with
// the CSS rule if it ever changes. The same selector also sets
// `container-type: inline-size` so `.match-arena` can respond to SLOT
// width via @container queries.
export function MatchWidgetGrid({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch w-full max-w-[1240px] mx-auto px-[12px] py-[12px] gap-3 max-[800px]:px-2 max-[800px]:gap-2 max-[800px]:pb-[120px]',
        className,
      )}
      {...props}
    />
  );
}

export function HandSection({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-4 w-full shrink-0 z-[30] relative border-t border-t-[var(--borderColor)] pt-4 max-[800px]:border-t-0 max-[800px]:pt-0 max-[800px]:gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function HandContainer({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('box-border flex flex-col items-stretch gap-4', className)}
      {...props}
    />
  );
}

export function FrostyVignette({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch absolute inset-0 pointer-events-none z-[5] rounded-[20px]',
        className,
      )}
      style={{
        background:
          'radial-gradient(circle at center, transparent 50%, rgba(255, 255, 255, 0.02) 70%, rgba(125, 211, 252, 0.08) 100%)',
        ...style,
      }}
      {...props}
    />
  );
}
