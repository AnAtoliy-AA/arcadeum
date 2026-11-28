'use client';

import { useCallback, useSyncExternalStore } from 'react';

const COORDS_KEY = 'arcadeum:chess:showCoordinates';
const listeners = new Set<() => void>();
// Fallback when storage is unavailable (private mode, blocked site data).
let memoryValue = true;

function readShowCoordinates(): boolean {
  try {
    const stored = window.localStorage.getItem(COORDS_KEY);
    return stored === null ? memoryValue : stored !== 'false';
  } catch {
    return memoryValue;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === COORDS_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Per-device preference: show the a-h / 1-8 labels on the board edge. */
export function useShowCoordinates() {
  const showCoordinates = useSyncExternalStore(
    subscribe,
    readShowCoordinates,
    () => true,
  );
  const setShowCoordinates = useCallback((value: boolean) => {
    memoryValue = value;
    try {
      window.localStorage.setItem(COORDS_KEY, String(value));
    } catch {
      // Storage unavailable: the in-memory value applies until reload.
    }
    listeners.forEach((l) => l());
  }, []);
  return { showCoordinates, setShowCoordinates };
}
