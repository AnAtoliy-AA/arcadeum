'use client';

/**
 * This component exists solely to perform a side-effect import of the Tamagui config.
 * By being a Client Component rendered in the layout, it ensures the global config
 * is initialized during the SSR pass and on the client, but is ignored during the
 * React Server Components (RSC) pass, avoiding 'createContext' errors.
 */
import '@/shared/config/tamagui.config';

export function TamaguiConfig() {
  return null;
}
