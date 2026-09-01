'use client';

import dynamic from 'next/dynamic';

const SolitaireGame = dynamic(
  () => import('@/widgets/PuzzleGames/SolitaireGame'),
  { ssr: false },
);

export function SolitaireGameClient() {
  return <SolitaireGame />;
}
