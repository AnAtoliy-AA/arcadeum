'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const RoadmapPageDynamic = dynamic(() => import('./RoadmapPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

export default function RoadmapClient() {
  return <RoadmapPageDynamic />;
}
