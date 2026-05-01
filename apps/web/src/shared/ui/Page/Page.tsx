'use client';
import { styled, GetProps, Main } from 'tamagui';
import { HEADER_HEIGHT } from '@/shared/config/layout';

/**
 * Reusable Page container component.
 * Handles consistent background, color, and optional viewport height fitting.
 */
export const Page = styled(Main, {
  name: 'Page',
  flexDirection: 'column',
  backgroundColor: '$background',
  position: 'relative',
  width: '100%',

  variants: {
    /**
     * When true, the page will fit exactly within the viewport
     * by subtracting the header height and hiding overflow.
     */
    fixedHeight: {
      true: {
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        overflowY: 'auto' as unknown as 'scroll',
      },
      false: {
        height: 'auto',
        overflowY: 'visible' as unknown as 'scroll',
      },
    },
    /**
     * Standard padding for content pages.
     */
    withPadding: {
      true: {
        padding: '$5',
        $sm: {
          padding: '$4',
        },
      },
      false: {
        padding: 0,
      },
    },
    /**
     * Optional radial gradient background for premium look on landing/dashboard pages.
     */
    radialBackground: {
      true: {
        background:
          'radial-gradient(circle at top left, $backgroundRadialStart, transparent 55%), radial-gradient(circle at bottom right, $backgroundRadialEnd, transparent 55%), $background',
      },
      false: {
        background: '$background',
      },
    },
  } as const,
});

export type PageProps = GetProps<typeof Page>;
