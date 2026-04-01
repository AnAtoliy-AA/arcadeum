'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const HistoryPage = dynamic(
  () => import('./HistoryPage').then((mod) => mod.HistoryPage),
  {
    ssr: false,
    loading: () => <PageLoading />,
  },
);

export default function HistoryRoute() {
  return <HistoryPage />;
}
