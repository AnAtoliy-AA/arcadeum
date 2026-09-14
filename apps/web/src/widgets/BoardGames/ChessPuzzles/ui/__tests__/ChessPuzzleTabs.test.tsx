import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChessPuzzleTabs } from '../ChessPuzzleTabs';

describe('ChessPuzzleTabs', () => {
  it('renders all four training mode tabs', () => {
    render(<ChessPuzzleTabs activeTab="daily" locale="en" />);

    expect(screen.getByTestId('chess-puzzle-tabs')).toBeInTheDocument();
    expect(screen.getByText('Daily Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Rated Puzzles')).toBeInTheDocument();
    expect(screen.getByText('Puzzle Rush')).toBeInTheDocument();
    expect(screen.getByText('Coordinates')).toBeInTheDocument();
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
