'use client';

import dynamic from 'next/dynamic';

const Game2048 = dynamic(() => import('@/widgets/PuzzleGames/Game2048'), {
  ssr: false,
});

export function Game2048Client() {
  return <Game2048 />;
}
