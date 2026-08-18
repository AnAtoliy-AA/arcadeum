'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

import type { RoadmapData } from './roadmap-parser';

const RoadmapPageDynamic = dynamic(() => import('./RoadmapPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

export default function RoadmapClient({ initialData }: { initialData: RoadmapData }) {
  return <RoadmapPageDynamic initialData={initialData} />;
}
