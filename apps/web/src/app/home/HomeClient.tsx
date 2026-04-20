'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const HomeClient = dynamic(() => import('./HomePage'), {
  ssr: false,
  loading: () => <PageLoading layout="home" />,
});

export default HomeClient;
