'use client';

import dynamic from 'next/dynamic';

const TicTacToeView = dynamic(
  () => import('./TicTacToeView').then((m) => m.TicTacToeView),
  { ssr: false },
);

export default function TicTacToeClient() {
  return <TicTacToeView />;
}
