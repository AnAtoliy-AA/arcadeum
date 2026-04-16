'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const HomeClient = dynamic(() => import('@/app/home/HomePage'), {
  ssr: false,
  loading: () => <PageLoading layout="home" />,
});

export default HomeClient;
