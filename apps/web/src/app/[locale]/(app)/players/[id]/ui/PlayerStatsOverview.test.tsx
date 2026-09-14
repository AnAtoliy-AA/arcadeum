import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerStatsOverview } from './PlayerStatsOverview';

describe('PlayerStatsOverview', () => {
  it('renders total matches, victories, defeats, and draws correctly', () => {
    render(
      <PlayerStatsOverview
        wins={120}
        losses={30}
        draws={10}
        winrate={0.75}
        streak={5}
        rating={2450}
        rank={1}
        tier="mythic"
      />,
    );

    expect(screen.getByTestId('stat-total-games')).toHaveTextContent('160');
    expect(screen.getByTestId('stat-wins')).toHaveTextContent('120');
    expect(screen.getByTestId('stat-losses')).toHaveTextContent('30');
    expect(screen.getByTestId('stat-draws')).toHaveTextContent('10');
    expect(screen.getByText('Rank #1')).toBeInTheDocument();
    expect(screen.getByText('mythic')).toBeInTheDocument();
    expect(screen.getByText(/5 Streak/)).toBeInTheDocument();
    expect(screen.getByText('75% Win Rate')).toBeInTheDocument();
  });

  it('handles zero matches gracefully without division errors', () => {
    render(
      <PlayerStatsOverview
        wins={0}
        losses={0}
        draws={0}
        winrate={0}
        rating={1500}
        rank={500}
        tier="bronze"
      />,
    );

    expect(screen.getByTestId('stat-total-games')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-wins')).toHaveTextContent('0');
    expect(screen.getByText('0% Win Rate')).toBeInTheDocument();
  });
});
