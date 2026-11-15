import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleAnalyticsModal } from '../PuzzleAnalyticsModal';

vi.mock('@/features/chess/lib/puzzle-analytics', () => ({
  getPuzzleAnalytics: vi.fn().mockReturnValue({
    overall: {
      totalAttempts: 10,
      totalSolved: 8,
      currentStreak: 4,
      bestStreak: 7,
      themeStats: {
        fork: { attempts: 6, solved: 5 },
        pin: { attempts: 4, solved: 1 },
      },
    },
    themeBreakdown: [
      { theme: 'fork', attempts: 6, solved: 5, accuracy: 83 },
      { theme: 'pin', attempts: 4, solved: 1, accuracy: 25 },
    ],
    weakestTheme: 'pin',
  }),
  loadMistakesQueue: vi.fn().mockReturnValue([
    {
      puzzle: {
        puzzleId: 'mistake_1',
        fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
        moves: ['e1e8'],
        rating: 1400,
        themes: ['pin'],
        openingTags: ['Missed Pin Test'],
      },
      failedAt: Date.now(),
      wrongMoves: ['e1e2'],
    },
  ]),
  removeMistakeFromQueue: vi.fn(),
  clearMistakesQueue: vi.fn(),
}));

describe('PuzzleAnalyticsModal', () => {
  it('renders analytics modal with overall stats and radar', () => {
    render(<PuzzleAnalyticsModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByTestId('puzzle-analytics-modal')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('🔥 4')).toBeInTheDocument();
    expect(screen.getByTestId('weakest-theme-card')).toBeInTheDocument();
    expect(
      screen.getByText('Target Weakness Detected: pin'),
    ).toBeInTheDocument();
  });

  it('switches to mistakes queue and renders missed puzzles', () => {
    render(<PuzzleAnalyticsModal isOpen={true} onClose={() => {}} />);

    const mistakesTab = screen.getByTestId('tab-mistakes');
    fireEvent.click(mistakesTab);

    expect(screen.getByText('Missed Pin Test')).toBeInTheDocument();
    expect(screen.getByTestId('mistake-card-mistake_1')).toBeInTheDocument();
  });
});
