'use client';

import dynamic from 'next/dynamic';
import HistoryLoading from './loading';
import type { HistoryPageProps } from './HistoryPage';

const HistoryPageDynamic = dynamic<HistoryPageProps>(
  () => import('./HistoryPage'),
  {
    ssr: false,
    loading: () => <HistoryLoading />,
  },
);

const HistoryClient = ({ initialData }: HistoryPageProps) => {
  return <HistoryPageDynamic initialData={initialData} />;
};

export default HistoryClient;
