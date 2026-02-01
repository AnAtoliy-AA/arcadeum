import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return window.navigator.userAgent;
}

function getServerSnapshot() {
  return '';
}

export function usePlatform() {
  const userAgent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const isIos = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  return { isIos, isAndroid };
}
