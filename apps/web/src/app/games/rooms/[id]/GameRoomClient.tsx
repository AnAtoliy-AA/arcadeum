'use client';

import dynamic from 'next/dynamic';
import GameRoomLoading from './loading';

import type { GameInitialData } from '@/shared/types/games';

const GameRoomPageDynamic = dynamic(() => import('./components/GameRoomPage'), {
  ssr: false,
  loading: () => <GameRoomLoading />,
});

interface GameRoomClientProps {
  initialData: GameInitialData | null;
  params: Promise<{ id: string }>;
}

const GameRoomClient = (props: GameRoomClientProps) => {
  return <GameRoomPageDynamic {...props} />;
};

export default GameRoomClient;
