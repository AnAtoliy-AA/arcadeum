import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerGameHistory } from './PlayerGameHistory';

describe('PlayerGameHistory', () => {
  it('renders matches list corresponding to recent form results', () => {
    render(
      <PlayerGameHistory
        recentForm={['W', 'L', 'D']}
        playerName="Nightblade"
        modes={['chess', 'critical', 'sea_battle']}
      />,
    );

    expect(screen.getByTestId('player-game-history')).toBeInTheDocument();
    expect(screen.getByTestId('match-item-0')).toHaveTextContent('Victory');
    expect(screen.getByTestId('match-item-0')).toHaveTextContent('+16 pts');
    expect(screen.getByTestId('match-item-1')).toHaveTextContent('Defeat');
    expect(screen.getByTestId('match-item-1')).toHaveTextContent('-14 pts');
    expect(screen.getByTestId('match-item-2')).toHaveTextContent('Draw');
    expect(screen.getByTestId('match-item-2')).toHaveTextContent('±0 pts');
  });

  it('renders empty message when no recent form is provided', () => {
    render(<PlayerGameHistory recentForm={[]} playerName="GhostRoot" />);

    expect(
      screen.getByText(/No recent matches found for GhostRoot/),
    ).toBeInTheDocument();
  });
});
