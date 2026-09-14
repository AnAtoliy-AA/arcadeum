import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyChessPuzzleClient } from '../DailyChessPuzzleClient';

vi.mock('@/widgets/BoardGames/ChessPuzzles/ui/Game', () => ({
  PuzzleGame: ({ mode }: { mode?: string }) => (
    <div data-testid="mock-puzzle-game" data-mode={mode}>
      Mock Puzzle Game ({mode})
    </div>
  ),
}));

describe('DailyChessPuzzleClient', () => {
  it('renders daily challenge header and countdown timer', () => {
    render(<DailyChessPuzzleClient locale="en" />);

    expect(screen.getByText('Daily Chess Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Daily Challenge')).toBeInTheDocument();
    expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
    expect(screen.getByTestId('daily-streak-badge')).toBeInTheDocument();
  });

  it('renders mock puzzle game in daily mode', () => {
    render(<DailyChessPuzzleClient locale="en" />);

    const game = screen.getByTestId('mock-puzzle-game');
    expect(game).toBeInTheDocument();
    expect(game).toHaveAttribute('data-mode', 'daily');
  });

  it('renders chess puzzle tabs with active daily tab', () => {
    render(<DailyChessPuzzleClient locale="en" />);

    const tabs = screen.getByTestId('chess-puzzle-tabs');
    expect(tabs).toBeInTheDocument();
    const dailyTab = screen.getByTestId('chess-puzzle-tab-daily');
    expect(dailyTab.className).toContain('bg-[var(--primary)]');
  });
});
