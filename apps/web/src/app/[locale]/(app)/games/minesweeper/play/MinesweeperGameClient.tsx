'use client';

import dynamic from 'next/dynamic';

const MinesweeperGame = dynamic(
  () => import('@/widgets/PuzzleGames/MinesweeperGame'),
  { ssr: false },
);

export function MinesweeperGameClient() {
  return <MinesweeperGame />;
}
