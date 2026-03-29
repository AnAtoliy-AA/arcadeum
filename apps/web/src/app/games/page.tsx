'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const GamesPage = dynamic(
  () => import('./GamesPage').then((mod) => mod.GamesPage),
  {
    ssr: false,
    loading: () => <PageLoading layout="grid" />,
  },
);

export default function GamesRoute() {
  return <GamesPage />;
}
