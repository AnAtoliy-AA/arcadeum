'use client';

import { ActiveGameContent } from './ActiveGameContent';
import type { ComponentProps } from 'react';

export type MatchWidgetProps = ComponentProps<typeof ActiveGameContent>;

/**
 * Entry point for the Critical game widget rework (ARC-631).
 *
 * For this ticket the widget is a transparent pass-through to the legacy
 * `ActiveGameContent`, mounted only when the `widget_mode` feature flag
 * is on. No behavior change vs. flag-off.
 *
 * Follow-up tickets restructure the inside of this component into the
 * three-row preview layout (opponents / arena / hand) — see
 * `docs/handoffs/PR-631-review2.md` §7 (ARC-632 — ARC-636).
 */
export function MatchWidget(props: MatchWidgetProps) {
  return (
    <div data-testid="match-widget">
      <ActiveGameContent {...props} />
    </div>
  );
}
