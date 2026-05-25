'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { GamesClientProps } from './types';

const GamesPageDynamic = dynamic(() => import('./GamesPage'), {
  ssr: false,
  loading: () => <PageLoading layout="grid" />,
});

function GamesClient(props: GamesClientProps) {
  return <GamesPageDynamic {...props} />;
}

export type { GamesClientProps };

export default GamesClient;
