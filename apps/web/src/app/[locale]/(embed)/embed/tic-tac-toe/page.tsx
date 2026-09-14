import type { Metadata } from 'next';
import { EmbedGameView } from '../../EmbedGameView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tic-Tac-Toe — Arcadeum Games',
  description: 'Play Tic-Tac-Toe online for free',
};

interface EmbedPageProps {
  searchParams: Record<string, string | undefined>;
}

export default function TicTacToeEmbedPage({ searchParams }: EmbedPageProps) {
  return (
    <EmbedGameView
      gameId="tic_tac_toe_v1"
      gameName="Tic-Tac-Toe"
      theme={searchParams.theme as 'dark' | 'light'}
      size={searchParams.size as 'compact' | 'normal'}
    />
  );
}
