'use client';

import { useSyncExternalStore } from 'react';

/**
 * Breakpoint queries matching the values used across the app (see
 * /tailwind-pro responsive variant map).
 */
const MEDIA_QUERIES = {
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

type MediaQueryKey = keyof typeof MEDIA_QUERIES;

type MediaQuerySnapshot = Record<MediaQueryKey, boolean>;

const SERVER_SNAPSHOT: MediaQuerySnapshot = Object.fromEntries(
  Object.keys(MEDIA_QUERIES).map((key) => [key, false]),
) as MediaQuerySnapshot;

// One shared matchMedia subscription for the whole app: the snapshot is read
// once per change event instead of once per hook instance.
let snapshot: MediaQuerySnapshot = SERVER_SNAPSHOT;
let mqls: MediaQueryList[] | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): MediaQuerySnapshot {
  const next = {} as MediaQuerySnapshot;
  for (const [key, query] of Object.entries(MEDIA_QUERIES)) {
    next[key as MediaQueryKey] = window.matchMedia(query).matches;
  }
  return next;
}

function emitChange(): void {
  snapshot = readSnapshot();
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void): () => void {
  if (!mqls) {
    mqls = Object.values(MEDIA_QUERIES).map((query) =>
      window.matchMedia(query),
    );
    mqls.forEach((mql) => {
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', emitChange);
      } else {
        mql.addListener(emitChange);
      }
    });
    snapshot = readSnapshot();
  }
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && mqls) {
      mqls.forEach((mql) => {
        if (typeof mql.removeEventListener === 'function') {
          mql.removeEventListener('change', emitChange);
        } else {
          mql.removeListener(emitChange);
        }
      });
      mqls = null;
      snapshot = SERVER_SNAPSHOT;
    }
  };
}

function getSnapshot(): MediaQuerySnapshot {
  return snapshot;
}

/** Media-query snapshot — boolean per breakpoint. */
export function useMediaQuery(): MediaQuerySnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}
