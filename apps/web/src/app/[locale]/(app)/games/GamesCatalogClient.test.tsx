import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GamesCatalogClient, type CatalogGameItem } from './GamesCatalogClient';

const mockGames: CatalogGameItem[] = [
  {
    id: 'chess_v1',
    slug: 'chess_v1',
    name: 'Chess',
    description: 'Strategy game',
    genre: 'Board',
    category: 'board',
    categoryLabel: 'Board Game',
    players: '2',
    duration: '15 min',
    landingHref: '/en/games/chess',
    accentColor: '#ffffff',
    isPlayable: true,
  },
  {
    id: 'hearts_v1',
    slug: 'hearts_v1',
    name: 'Hearts',
    description: 'Card game',
    genre: 'Card',
    category: 'card',
    categoryLabel: 'Card Game',
    players: '4',
    duration: '10 min',
    landingHref: '/en/games/hearts',
    accentColor: '#ffffff',
    isPlayable: true,
  },
];

describe('GamesCatalogClient', () => {
  it('renders filter chips with counts', () => {
    render(
      <GamesCatalogClient locale="en" games={mockGames} roomsHref="/en/rooms">
        <div key="chess_v1" data-category="board" data-testid="card-chess_v1">
          Chess
        </div>
        <div key="hearts_v1" data-category="card" data-testid="card-hearts_v1">
          Hearts
        </div>
      </GamesCatalogClient>,
    );

    expect(screen.getByTestId('category-filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('category-filter-board')).toBeInTheDocument();
    expect(screen.getByTestId('card-chess_v1')).toBeInTheDocument();
    expect(screen.getByTestId('card-hearts_v1')).toBeInTheDocument();
  });

  it('filters children when a category chip is selected', () => {
    render(
      <GamesCatalogClient locale="en" games={mockGames} roomsHref="/en/rooms">
        <div key="chess_v1" data-category="board" data-testid="card-chess_v1">
          Chess
        </div>
        <div key="hearts_v1" data-category="card" data-testid="card-hearts_v1">
          Hearts
        </div>
      </GamesCatalogClient>,
    );

    fireEvent.click(screen.getByTestId('category-filter-board'));

    expect(screen.getByTestId('card-chess_v1')).toBeInTheDocument();
    expect(screen.queryByTestId('card-hearts_v1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('category-filter-puzzle'));
    expect(screen.getByText('No games found')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('category-filter-all'));
    expect(screen.getByTestId('card-chess_v1')).toBeInTheDocument();
    expect(screen.getByTestId('card-hearts_v1')).toBeInTheDocument();
  });
});
