'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { GamesClientProps } from '../games/types';

const RoomsPageDynamic = dynamic(() => import('../games/GamesPage'), {
  ssr: false,
  loading: () => <PageLoading layout="grid" />,
});

export function RoomsClient(props: GamesClientProps) {
  return <RoomsPageDynamic {...props} />;
}

export default RoomsClient;
