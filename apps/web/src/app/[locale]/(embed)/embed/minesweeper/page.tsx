import type { Metadata } from 'next';
import { EmbedGameView } from '../../EmbedGameView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Minesweeper — Arcadeum Games',
  description: 'Play Minesweeper online for free',
};

interface EmbedPageProps {
  searchParams: Record<string, string | undefined>;
}

export default function MinesweeperEmbedPage({ searchParams }: EmbedPageProps) {
  return (
    <EmbedGameView
      gameId="minesweeper_v1"
      gameName="Minesweeper"
      theme={searchParams.theme as 'dark' | 'light'}
      size={searchParams.size as 'compact' | 'normal'}
    />
  );
}
