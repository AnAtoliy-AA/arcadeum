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
  it('renders game details correctly', () => {
    render(<GamesCatalogCard game={mockGame} />);

    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(
      screen.getByText('The classic strategy board game'),
    ).toBeInTheDocument();
    expect(screen.getByText('Board · Strategy')).toBeInTheDocument();
    expect(screen.getByText('👥 2')).toBeInTheDocument();
    expect(screen.getByText('⏱ 15 min')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders Play button with proper deep link', () => {
    render(<GamesCatalogCard game={mockGame} />);

    const playBtn = screen.getByTestId('game-card-play-chess_v1');
    expect(playBtn).toHaveAttribute('href', '/en/games/chess');
    expect(playBtn).toHaveTextContent('Play Now');
  });

  it('renders Rules button linking to how-to-play anchor', () => {
    render(<GamesCatalogCard game={mockGame} />);

    const rulesBtn = screen.getByTestId('game-card-rules-chess_v1');
    expect(rulesBtn).toHaveAttribute('href', '/en/games/chess#how-to-play');
  });

  it('renders Demo badge and Try Demo CTA for demo games', () => {
    render(<GamesCatalogCard game={mockDemoGame} />);

    expect(screen.getByText('Demo')).toBeInTheDocument();
    const playBtn = screen.getByTestId('game-card-play-glimworm_v1');
    expect(playBtn).toHaveTextContent('Try Demo');
  });

  it('renders disabled state when game is not playable', () => {
    render(<GamesCatalogCard game={mockDisabledGame} />);

    expect(screen.getAllByText('Disabled')).toHaveLength(2);
    const playBtn = screen.getByTestId('game-card-play-future_game');
    expect(playBtn).toHaveAttribute('aria-disabled', 'true');
  });
});
