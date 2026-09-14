import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerFavoriteGames } from './PlayerFavoriteGames';

describe('PlayerFavoriteGames', () => {
  it('renders favorite game cards with rank and rating', () => {
    render(
      <PlayerFavoriteGames
        modeRanks={[
          { mode: 'chess_v1', rank: 4, rating: 2150 },
          { mode: 'critical_v1', rank: 12, rating: 1890 },
          { mode: 'sea_battle_v1', rank: 25, rating: 1740 },
        ]}
      />,
    );

    expect(screen.getByTestId('player-favorite-games')).toBeInTheDocument();
    expect(screen.getByTestId('fav-game-chess_v1')).toHaveTextContent('Chess');
    expect(screen.getByTestId('fav-game-chess_v1')).toHaveTextContent(
      'Rank #4',
    );
    expect(screen.getByTestId('fav-game-chess_v1')).toHaveTextContent(
      '2150 Elo',
    );
    expect(screen.getByTestId('fav-game-critical_v1')).toHaveTextContent(
      'Critical',
    );
  });
});
