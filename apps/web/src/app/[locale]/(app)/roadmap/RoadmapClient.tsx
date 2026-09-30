'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

import type { RoadmapData } from './roadmap-parser';
import { TIERS, PHASES, STATS } from './roadmap-data';

const RoadmapPageDynamic = dynamic(() => import('./RoadmapPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

export default function RoadmapClient({
  initialData,
}: {
  initialData?: RoadmapData;
}) {
  const safeData =
    initialData && initialData.tiers && initialData.tiers.length > 0
      ? initialData
      : {
          tiers: TIERS,
          phases: PHASES,
          stats: STATS,
        };
  return <RoadmapPageDynamic initialData={safeData} />;
}
