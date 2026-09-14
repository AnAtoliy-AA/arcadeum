'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const MinesweeperGame = dynamic(
  () => import('@/widgets/PuzzleGames/MinesweeperGame'),
  { ssr: false, loading: () => <PageLoading /> },
);

export function MinesweeperGameClient() {
  return <MinesweeperGame />;
}
