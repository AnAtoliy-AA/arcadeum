'use client';

import { type ReactNode } from 'react';
import BrowserRegistry from '@/app/BrowserRegistry';
import { StatsReplay } from '@/shared/ui/StatsReplay';
import { RootModals } from '@/app/[locale]/RootModals';

/**
 * BrowserRegistry (socket.io) must mount on every page so notifications,
 * live stats, and real-time features work everywhere.
 *
 * StatsReplay and RootModals are lightweight — safe to keep global.
 */
export function InteractiveShell({ children }: { children: ReactNode }) {
  return (
    <BrowserRegistry>
      {children}
      <RootModals />
      <StatsReplay />
    </BrowserRegistry>
  );
}
