'use client';

import dynamic from 'next/dynamic';
import HistoryLoading from './loading';
import type { HistoryPageProps } from './HistoryPage';

const HistoryPageDynamic = dynamic<HistoryPageProps>(
  () => import('./HistoryPage').then((mod) => mod.HistoryPage),
  {
    ssr: false,
    loading: () => <HistoryLoading />,
  },
);

const HistoryClient = (props: HistoryPageProps) => {
  return <HistoryPageDynamic {...props} />;
};

export default HistoryClient;
