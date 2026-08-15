'use client';
import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { HEADER_HEIGHT } from '@/shared/config/layout';

/**
 * Reusable Page container component.
 * Handles consistent background, color, and optional viewport height fitting.
 */
export type PageProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * When true, the page will fit exactly within the viewport
   * by subtracting the header height and hiding overflow.
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
    <main
      className={cx(
        'box-border flex flex-col items-stretch relative w-full',
        fixedHeight ? 'overflow-y-auto' : 'overflow-y-visible',
        withPadding ? 'p-5 max-[800px]:p-4' : 'p-0',
        className,
      )}
      style={{
        ...(fixedHeight ? { height: `calc(100vh - ${HEADER_HEIGHT}px)` } : {}),
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
