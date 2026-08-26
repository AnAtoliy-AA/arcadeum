'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { GamesClientProps } from '../games/types';

// Server-rendered (no `ssr: false`) so the room list is crawler-visible
// and paints without a spinner flash.
const RoomsPageDynamic = dynamic(() => import('../games/GamesPage'), {
  loading: () => <PageLoading layout="grid" />,
});

export function RoomsClient({
  initialData,
  gameId,
  pageTitle,
}: GamesClientProps) {
  return (
    <RoomsPageDynamic
      initialData={initialData}
      gameId={gameId}
      pageTitle={pageTitle}
    />
  );
}

export default RoomsClient;
