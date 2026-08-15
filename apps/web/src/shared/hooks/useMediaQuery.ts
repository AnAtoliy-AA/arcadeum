'use client';

import { useEffect, useState } from 'react';

/**
 * Mirrors the old Tamagui `useMedia()` shape so call sites port 1:1.
 * Breakpoint queries match the values used across the app (see
 * /tailwind-pro responsive variant map).
 */
export const MEDIA_QUERIES = {
  xs: '(max-width: 660px)',
  sm: '(max-width: 800px)',
  md: '(max-width: 1150px)',
  tablet: '(max-width: 1023px)',
  lg: '(max-width: 1280px)',
  xl: '(max-width: 1420px)',
  xxl: '(max-width: 1600px)',
  gtXs: '(min-width: 661px)',
  gtSm: '(min-width: 801px)',
  gtTablet: '(min-width: 1024px)',
  gtMd: '(min-width: 1151px)',
  gtLg: '(min-width: 1281px)',
  short: '(max-height: 480px)',
  tall: '(min-height: 820px)',
  hoverNone: '(hover: none)',
  pointerCoarse: '(pointer: coarse)',
} as const;

export type MediaQueryKey = keyof typeof MEDIA_QUERIES;

export type MediaQuerySnapshot = Record<MediaQueryKey, boolean>;

const SERVER_SNAPSHOT: MediaQuerySnapshot = Object.fromEntries(
  Object.keys(MEDIA_QUERIES).map((key) => [key, false]),
) as MediaQuerySnapshot;

function readSnapshot(): MediaQuerySnapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  const snapshot = {} as MediaQuerySnapshot;
  for (const [key, query] of Object.entries(MEDIA_QUERIES)) {
    snapshot[key as MediaQueryKey] = window.matchMedia(query).matches;
  }
  return snapshot;
}

/** Same API shape as the legacy Tamagui useMedia() — boolean per breakpoint. */
export function useMediaQuery(): MediaQuerySnapshot {
  const [snapshot, setSnapshot] = useState<MediaQuerySnapshot>(SERVER_SNAPSHOT);

  useEffect(() => {
    const listener = () => setSnapshot(readSnapshot());
    listener();

    const mqls = Object.values(MEDIA_QUERIES).map((query) =>
      window.matchMedia(query),
    );

    mqls.forEach((mql) => {
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', listener);
      } else {
        mql.addListener(listener);
      }
    });

    return () => {
      mqls.forEach((mql) => {
        if (typeof mql.removeEventListener === 'function') {
          mql.removeEventListener('change', listener);
        } else {
          mql.removeListener(listener);
        }
      });
    };
  }, []);

  return snapshot;
}
