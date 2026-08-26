import type { CSSProperties, ReactNode } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Widget-mode grid: 3-row stack (opponents · arena · hand) with a max
 * width and explicit gutters. Replaces the legacy `GameBoard` wrapper
 * for `MatchWidget` so the rows don't span full bleed and the hand
 * stays clear of the screen edges on wide monitors.
 *
 * `paddingBottom` at small screens reserves room for the sticky `MobileHandBar`
 * which is portaled to body and thus outside this grid's flow.
 */
// §3.3 — `maxWidth` is the upper bound; the actual constraint is the
// `min(1240px, calc(100vw - 48px))` rule in styles/hud.scss keyed off
// `[data-testid="match-widget-grid"]`. Keep this number in sync with
// the CSS rule if it ever changes. The same selector also sets
// `container-type: inline-size` so `.match-arena` can respond to SLOT
// width via @container queries.
export function MatchWidgetGrid({
  className,
  'data-testid': testId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch w-full max-w-[1240px] mx-auto px-[12px] py-[12px] gap-3 max-[800px]:px-2 max-[800px]:gap-2 max-[800px]:pb-[120px]',
        className,
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function FrostyVignette({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch absolute inset-0 pointer-events-none z-[5] rounded-[20px]',
        className,
      )}
      style={{
        background:
          'radial-gradient(circle at center, transparent 50%, rgba(255, 255, 255, 0.02) 70%, rgba(125, 211, 252, 0.08) 100%)',
        ...style,
      }}
    />
  );
}
