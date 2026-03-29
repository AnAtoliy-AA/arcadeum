'use client';

import dynamic from 'next/dynamic';

import { PageLoading } from '@/shared/ui';

export const StatsClient = dynamic(
  () => import('./StatsPage').then((mod) => mod.StatsPage),
  {
    ssr: false,
    loading: () => <PageLoading layout="stats" />,
  },
);
