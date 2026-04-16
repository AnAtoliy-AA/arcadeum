'use client';

import dynamic from 'next/dynamic';
import StatsLoading from './loading';
import type { StatsPageProps } from './StatsPage';

const StatsPageDynamic = dynamic<StatsPageProps>(
  () => import('./StatsPage').then((mod) => mod.StatsPage),
  {
    ssr: false,
    loading: () => <StatsLoading />,
  },
);

const StatsClient = (props: StatsPageProps) => {
  return <StatsPageDynamic {...props} />;
};

export default StatsClient;
