'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@arcadeum/ui';

const MonitoringView = dynamic(
  () => import('./MonitoringView').then((mod) => mod.MonitoringView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[var(--bg)] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    ),
  },
);

interface MonitoringClientProps {
  t?: Record<string, string>;
}

export function MonitoringClient({ t }: MonitoringClientProps) {
  return <MonitoringView t={t} />;
}
