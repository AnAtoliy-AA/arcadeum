'use client';

import dynamic from 'next/dynamic';
import GamesLoading from './loading';
import type { GamesClientProps } from './types';

const GamesPageDynamic = dynamic(
  () => import('./GamesPage'),
  {
    ssr: false,
    loading: () => <GamesLoading />,
  },
);

function GamesClient(props: GamesClientProps) {
  return <GamesPageDynamic {...props} />;
}

export default GamesClient;
