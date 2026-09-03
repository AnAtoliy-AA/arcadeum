import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GamesCatalogCard } from './GamesCatalogCard';
import type { CatalogGameItem } from '../GamesCatalogClient';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/en/games',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
}));

const mockGame: CatalogGameItem = {
  id: 'chess_v1',
  slug: 'chess_v1',
  name: 'Chess',
  description: 'The classic strategy board game',
  genre: 'Board',
  pace: 'Strategy',
  category: 'board',
  categoryLabel: 'Board Game',
  players: '2',
  duration: '15 min',
  landingHref: '/en/games/chess',
  accentColor: '#e2e8f0',
  isPlayable: true,
  isDemo: false,
};

const mockDemoGame: CatalogGameItem = {
  id: 'glimworm_v1',
  slug: 'glimworm_v1',
  name: 'Glimworm',
  description: 'A glow-in-the-dark snake battle',
  genre: 'Arcade',
  pace: 'Real-time',
  category: 'casual',
  categoryLabel: 'Action',
  players: '2–10',
  duration: '90 sec',
  landingHref: '/en/games/glimworm',
  accentColor: '#a78bfa',
  isPlayable: true,
  isDemo: true,
};

const mockDisabledGame: CatalogGameItem = {
  ...mockGame,
  id: 'future_game',
  slug: 'future_game',
  name: 'Future Game',
  isPlayable: false,
};

describe('GamesCatalogCard', () => {
  it('renders game details correctly and links to landing page', () => {
    render(<GamesCatalogCard game={mockGame} locale="en" />);

    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(
      screen.getByText('The classic strategy board game'),
    ).toBeInTheDocument();
    expect(screen.getByText('Board · Strategy')).toBeInTheDocument();
    expect(screen.getByText('👥 2')).toBeInTheDocument();
    expect(screen.getByText('⏱ 15 min')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();

    const cardLink = screen.getByTestId('games-catalog-card-chess_v1');
    expect(cardLink).toHaveAttribute('href', '/en/games/chess');
  });

  it('renders Demo badge for demo games', () => {
    render(<GamesCatalogCard game={mockDemoGame} locale="en" />);

    expect(screen.getByText('Demo')).toBeInTheDocument();
    const cardLink = screen.getByTestId('games-catalog-card-glimworm_v1');
    expect(cardLink).toHaveAttribute('href', '/en/games/glimworm');
  });

  it('renders disabled state when game is not playable', () => {
    render(<GamesCatalogCard game={mockDisabledGame} locale="en" />);

    expect(screen.getByText('Disabled')).toBeInTheDocument();
    const cardLink = screen.getByTestId('games-catalog-card-future_game');
    expect(cardLink).toHaveAttribute('aria-disabled', 'true');
  });

  it('offline badge links to absolute locale-prefixed path', () => {
    const gameWithOffline: CatalogGameItem = {
      ...mockGame,
      offlineSlug: 'chess',
    };
    render(
      <GamesCatalogCard
        game={gameWithOffline}
        locale="fr"
        offlineBadgeLabel="Hors ligne"
      />,
    );

    const offlineLink = screen.getByTestId('games-catalog-offline-chess_v1');
    expect(offlineLink).toHaveAttribute('href', '/fr/offline/chess');
  });
});
