'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';
import type { GameDetailPage } from './GameDetailPage';

const GameDetailPageDynamic = dynamic<
  React.ComponentProps<typeof GameDetailPage>
>(() => import('./GameDetailPage').then((mod) => mod.GameDetailPage), {
  ssr: false,
  loading: () => <PageLoading />,
});

const GameDetailClient = (
  props: React.ComponentProps<typeof GameDetailPage>,
) => {
  return <GameDetailPageDynamic {...props} />;
};

export default GameDetailClient;
