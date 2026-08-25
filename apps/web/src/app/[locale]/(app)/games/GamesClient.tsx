'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { GamesClientProps } from './types';

// Server-rendered (no `ssr: false`) so the server-fetched room list is
// visible in initial HTML instead of a spinner riding along unused.
const GamesPageDynamic = dynamic(() => import('./GamesPage'), {
  loading: () => <PageLoading layout="grid" />,
});

function GamesClient(props: GamesClientProps) {
  return <GamesPageDynamic {...props} />;
}

export type { GamesClientProps };

export default GamesClient;
