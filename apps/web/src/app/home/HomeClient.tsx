'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

export const HomeClient = dynamic(() => import('@/app/home/HomePage'), {
  ssr: false,
  loading: () => <PageLoading layout="home" />,
});
