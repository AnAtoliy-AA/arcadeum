import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChessPuzzleTabs } from '../ChessPuzzleTabs';

describe('ChessPuzzleTabs', () => {
  it('renders all training mode tabs including custom puzzles and duel', () => {
    render(
      <ChessPuzzleTabs
        activeTab="daily"
        locale="en"
        onOpenAnalytics={() => {}}
      />,
    );

    expect(screen.getByTestId('chess-puzzle-tabs')).toBeInTheDocument();
    expect(screen.getByText('Daily Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Rated Puzzles')).toBeInTheDocument();
    expect(screen.getByText('Puzzle Rush')).toBeInTheDocument();
    expect(screen.getByText('Puzzle Duel')).toBeInTheDocument();
    expect(screen.getByText('Custom Puzzles')).toBeInTheDocument();
    expect(screen.getByText('Coordinates')).toBeInTheDocument();
    expect(
      screen.getByTestId('chess-puzzle-tab-analytics'),
    ).toBeInTheDocument();
  });

  it('highlights the active tab with primary styling', () => {
    render(<ChessPuzzleTabs activeTab="daily" locale="en" />);

    const dailyTab = screen.getByTestId('chess-puzzle-tab-daily');
    const ratedTab = screen.getByTestId('chess-puzzle-tab-rated');

    expect(dailyTab.className).toContain('bg-[var(--primary)]');
    expect(ratedTab.className).not.toContain('bg-[var(--primary)]');
  });

  it('links correctly with locale prefix', () => {
    render(<ChessPuzzleTabs activeTab="rated" locale="fr" />);

    expect(screen.getByTestId('chess-puzzle-tab-daily')).toHaveAttribute(
      'href',
      '/fr/games/chess/puzzles/daily',
    );
    expect(screen.getByTestId('chess-puzzle-tab-rated')).toHaveAttribute(
      'href',
      '/fr/games/chess/puzzles',
    );
  });
});
