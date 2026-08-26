'use client';

import dynamic from 'next/dynamic';
import StatsLoading from './loading';
import type { StatsPageProps } from './StatsPage';

const StatsPageDynamic = dynamic<StatsPageProps>(() => import('./StatsPage'), {
  ssr: false,
  loading: () => <StatsLoading />,
});

const StatsClient = ({ initialStats, initialLeaderboard }: StatsPageProps) => {
  return (
    <StatsPageDynamic
      initialStats={initialStats}
      initialLeaderboard={initialLeaderboard}
    />
  );
};

export default StatsClient;
