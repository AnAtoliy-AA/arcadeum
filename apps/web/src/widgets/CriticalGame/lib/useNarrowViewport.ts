'use client';

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

/**
 * True while the viewport is ≤maxWidth — phones in portrait at 480. Used
 * to gate widget-mode mobile branches that the tamagui `sm` breakpoint
 * (≤800px) fires too eagerly for.
 *
 * Synchronous initializer reads `matchMedia` on first paint so phone
 * users don't get a desktop-layout flash before the effect runs. The
 * server pass falls back to `false`; the client first paint is already
 * correct.
 */
export function useNarrowViewport(maxWidth = 480): boolean {
  const [narrow, setNarrow] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [maxWidth]);
  return narrow;
}

// Sentinel marks "no provider" so consumers can fall back to subscribing
// directly. We can't default the context value to `false` because that
// reads as "definitely desktop" — undefined means "ask the hook yourself".
const NarrowViewportContext = createContext<boolean | undefined>(undefined);

interface NarrowViewportProviderProps {
  maxWidth?: number;
  children: ReactNode;
}

/**
 * Computes `isNarrow` once at the widget root and broadcasts to all
 * children, so the 5 components that previously subscribed to
 * `matchMedia(max-width: 480px)` independently (Arena, HandZone,
 * OpponentsRow, TurnBanner, and indirectly the piles via Arena) commit
 * the same value on the same React frame. Without this, viewport flips
 * could split the layout state across the tree for a frame at the
 * boundary, flashing mismatched border radii on resize.
 */
export function NarrowViewportProvider({
  maxWidth = 480,
  children,
}: NarrowViewportProviderProps) {
  const isNarrow = useNarrowViewport(maxWidth);
  return createElement(
    NarrowViewportContext.Provider,
    { value: isNarrow },
    children,
  );
}

/**
 * Reads the broadcast `isNarrow` value when wrapped in a
 * `NarrowViewportProvider`; falls back to subscribing directly via
 * `useNarrowViewport` so consumers rendered in isolation (tests,
 * Storybook) still get the right value.
 */
export function useIsNarrow(maxWidth = 480): boolean {
  const ctx = useContext(NarrowViewportContext);
  const fallback = useNarrowViewport(maxWidth);
  return ctx ?? fallback;
}
