'use client';

import { useThemeController } from '@/app/theme/ThemeContext';

/**
 * Client half of the (app) route-group layout. Theme state is provided by
 * AppThemeProvider in the root layout; this wrapper exists so the route
 * group keeps a stable composition point.
 */
export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  useThemeController();
  return <>{children}</>;
}
