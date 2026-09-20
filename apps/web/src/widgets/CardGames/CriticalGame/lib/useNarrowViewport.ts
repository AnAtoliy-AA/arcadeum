'use client';

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export function useNarrowViewport(maxWidth = 540): boolean {
  const [narrow, setNarrow] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(`(max-width: ${maxWidth}px), (max-height: 520px)`)
      .matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(
      `(max-width: ${maxWidth}px), (max-height: 520px)`,
    );
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [maxWidth]);
  return narrow;
}

export function useIsShortHeight(maxHeight = 520): boolean {
  const [short, setShort] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(`(max-height: ${maxHeight}px)`).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-height: ${maxHeight}px)`);
    const apply = () => setShort(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [maxHeight]);
  return short;
}

const NarrowViewportContext = createContext<boolean | undefined>(undefined);

interface NarrowViewportProviderProps {
  maxWidth?: number;
  children: ReactNode;
}

export function NarrowViewportProvider({
  maxWidth = 540,
  children,
}: NarrowViewportProviderProps) {
  const isNarrow = useNarrowViewport(maxWidth);
  return createElement(
    NarrowViewportContext.Provider,
    { value: isNarrow },
    children,
  );
}

export function useIsNarrow(maxWidth = 540): boolean {
  const ctx = useContext(NarrowViewportContext);
  const fallback = useNarrowViewport(maxWidth);
  return ctx ?? fallback;
}
