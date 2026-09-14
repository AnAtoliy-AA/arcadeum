import type { Metadata } from 'next';
import { EmbedGameView } from '../../EmbedGameView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '2048 — Arcadeum Games',
  description: 'Play 2048 online for free',
};

interface EmbedPageProps {
  searchParams: Record<string, string | undefined>;
}

export default function Game2048EmbedPage({ searchParams }: EmbedPageProps) {
  return (
    <EmbedGameView
      gameId="game_2048_v1"
      gameName="2048"
      theme={searchParams.theme as 'dark' | 'light'}
      size={searchParams.size as 'compact' | 'normal'}
    />
  );
}
