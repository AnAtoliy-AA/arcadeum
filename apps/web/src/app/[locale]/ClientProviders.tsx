'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

const PWAProvider = dynamic(
  () => import('@/features/pwa/PWAContext').then((m) => m.PWAProvider),
  { ssr: false },
);

const SoundProvider = dynamic(
  () => import('@/shared/lib/sound').then((m) => m.SoundProvider),
  { ssr: false },
);

const StatsReplay = dynamic(
  () => import('@/shared/ui/StatsReplay').then((m) => m.StatsReplay),
  { ssr: false },
);

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <PWAProvider>
      <SoundProvider>
        {children}
        <StatsReplay />
      </SoundProvider>
    </PWAProvider>
  );
}
