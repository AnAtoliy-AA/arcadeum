'use client';

import dynamic from 'next/dynamic';

import { PageLoading } from '@/shared/ui';

import type { StatsPageProps } from './StatsPage';

export const StatsClient = dynamic<StatsPageProps>(
  () => import('./StatsPage').then((mod) => mod.StatsPage),
  {
    ssr: false,
    loading: () => <PageLoading layout="stats" />,
  },
);
