'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { GameInitialData } from '@/shared/types/games';

const GameRoomPageDynamic = dynamic(() => import('./components/GameRoomPage'), {
  ssr: false,
  loading: () => <PageLoading layout="room" />,
});

interface GameRoomClientProps {
  initialData: GameInitialData | null;
  params: Promise<{ id: string }>;
}

const GameRoomClient = ({ initialData }: GameRoomClientProps) => {
  return <GameRoomPageDynamic initialData={initialData} />;
};

export default GameRoomClient;
