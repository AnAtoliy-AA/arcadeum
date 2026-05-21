'use client';

import { useCallback, useState } from 'react';

const STORAGE_KEY = 'arcadeum.chat.collapsed';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useChatCollapsed(): [boolean, (next: boolean) => void] {
  const [collapsed, setCollapsedState] = useState<boolean>(() => readInitial());

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // best-effort persistence
    }
  }, []);

  return [collapsed, setCollapsed];
}
