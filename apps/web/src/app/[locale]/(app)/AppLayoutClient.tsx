'use client';

import { useThemeController } from '@/app/theme/ThemeContext';
import dynamic from 'next/dynamic';

const RootModals = dynamic(
  () => import('../RootModals').then((m) => m.RootModals),
  { ssr: false },
);

/**
 * Client half of the (app) route-group layout. Theme state is provided by
 * AppThemeProvider in the root layout; this wrapper exists so the route
 * group keeps a stable composition point.
 */
export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  useThemeController();
  return (
    <>
      {children}
      <RootModals />
    </>
  );
}
