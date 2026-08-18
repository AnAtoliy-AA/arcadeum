'use client';
import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Reusable Page container component.
 * Handles consistent background, color, and optional viewport height fitting.
 */
export type PageProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * When true, the page is capped to the viewport below the sticky header
   * (100dvh minus the --header-height token). Inner layouts can then fill
   * it with flex (flex-1/min-h-0) and scroll internally. The document shell
   * is content-sized, so the cap is the anchor every flex chain resolves
   * against — without it, tall game widgets would stretch the room (and the
   * chat with it) past the screen.
   */
  fixedHeight?: boolean;
  /**
   * Standard padding for content pages.
   */
  withPadding?: boolean;
  /**
   * Optional radial gradient background for premium look on landing/dashboard pages.
   */
  radialBackground?: boolean;
};

export function Page({
  fixedHeight,
  withPadding,
  radialBackground,
  className,
  style,
  ...props
}: PageProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch relative w-full',
        fixedHeight
          ? 'h-[calc(100dvh-var(--header-height))] min-h-0 overflow-y-auto'
          : 'overflow-y-visible',
        withPadding ? 'p-5 max-[800px]:p-4' : 'p-0',
        className,
      )}
      style={{
        ...(radialBackground
          ? {
              background:
                'radial-gradient(circle at top left, var(--backgroundRadialStart), transparent 55%), radial-gradient(circle at bottom right, var(--backgroundRadialEnd), transparent 55%), var(--background)',
            }
          : { background: 'var(--background)' }),
        ...style,
      }}
      {...props}
    />
  );
}
