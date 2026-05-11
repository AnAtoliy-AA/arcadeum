'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  WIDGET_MODE_PARAM,
  WIDGET_MODE_STORAGE_KEY,
  resolveWidgetMode,
} from '../lib/widgetMode';

function subscribeToStorage(notify: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', notify);
  return () => window.removeEventListener('storage', notify);
}

function getStorageSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(WIDGET_MODE_STORAGE_KEY);
}

// Server renders pre-storage; the client re-renders with the real value
// once hydration completes.
function getServerSnapshot(): string | null {
  return null;
}

/**
 * Returns whether the Critical widget rework should render in place of the
 * legacy `ActiveGameContent` layout. Resolution order: URL search param,
 * then localStorage, then env var. See `lib/widgetMode.ts` for details.
 *
 * The URL param is also persisted into localStorage on change so a QA can
 * flip the flag once via URL and have it stick across in-app navigation.
 */
export function useWidgetMode(): boolean {
  const searchParams = useSearchParams();
  const paramValue = searchParams?.get(WIDGET_MODE_PARAM) ?? null;
  const storageValue = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (paramValue === null) return;
    if (window.localStorage.getItem(WIDGET_MODE_STORAGE_KEY) === paramValue) {
      return;
    }
    window.localStorage.setItem(WIDGET_MODE_STORAGE_KEY, paramValue);
    // localStorage `storage` events don't fire in the same tab that wrote
    // the value, so we nudge our own subscriber to re-read.
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: WIDGET_MODE_STORAGE_KEY,
        newValue: paramValue,
      }),
    );
  }, [paramValue]);

  return resolveWidgetMode({ paramValue, storageValue });
}
