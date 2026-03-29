'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

export const HomeClient = dynamic(
  () => import('@/app/home/HomePage').then((mod) => mod.HomePage),
  {
    ssr: false,
    loading: () => <PageLoading layout="grid" />,
  },
);
