'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useVisionModeSetting } from '@/shared/hooks/useVisionModeSetting';
import { applyVisionModeToGameTheme } from '@/shared/lib/colorblind';

/**
 * Factory that creates a typed theme context, provider, and hook.
 *
 * Usage:
 * ```ts
 * const { Provider, useTheme } = createGameThemeContext(getTheme, 'cosmic');
 * ```
 *
 * The resolved theme is automatically recolored when a color-vision
 * accessibility mode (ARC-896) is active, so every game board picks up the
 * setting without per-widget changes.
 */
export function createGameThemeContext<T>(
  getTheme: (variant: string) => T,
  defaultVariant: string,
) {
  const Context = createContext<T>(getTheme(defaultVariant));

  function Provider({
    variant,
    children,
  }: {
    variant?: string;
    children: ReactNode;
  }) {
    const { visionMode } = useVisionModeSetting();
    const value = useMemo(
      () =>
        applyVisionModeToGameTheme(
          getTheme(variant ?? defaultVariant),
          visionMode,
        ),
      [variant, visionMode],
    );
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useTheme(): T {
    return useContext(Context);
  }

  return { Provider, useTheme } as const;
}
