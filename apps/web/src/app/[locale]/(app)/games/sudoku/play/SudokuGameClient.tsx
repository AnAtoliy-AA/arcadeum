'use client';

import dynamic from 'next/dynamic';

const SudokuGame = dynamic(() => import('@/widgets/PuzzleGames/SudokuGame'), {
  ssr: false,
});

export function SudokuGameClient() {
  return <SudokuGame />;
}
