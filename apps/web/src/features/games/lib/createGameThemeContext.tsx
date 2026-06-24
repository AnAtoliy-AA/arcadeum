'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Factory that creates a typed theme context, provider, and hook.
 *
 * Usage:
 * ```ts
 * const { Provider, useTheme } = createGameThemeContext(getTheme, 'cosmic');
 * ```
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
    const value = useMemo(() => getTheme(variant ?? defaultVariant), [variant]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useTheme(): T {
    return useContext(Context);
  }

  return { Provider, useTheme } as const;
}
