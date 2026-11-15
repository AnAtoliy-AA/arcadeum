import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleRushGameOver } from '../PuzzleRushGameOver';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.chess_v1.puzzleRush.gameOver': "Time's up!",
        'games.chess_v1.puzzleRush.playAgain': 'Play Again',
        'games.chess_v1.puzzleRush.newPersonalBest': 'New Personal Best!',
        'games.chess_v1.puzzleRush.shareScore': 'Share Brag Card',
        'games.chess_v1.puzzleRush.viewLeaderboard': 'View Leaderboard',
        'games.chess_v1.puzzleRush.survival': 'Survival Mode',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('@/shared/lib/daily-streak', () => ({
  DailyStreakManager: {
    getStreakState: () => ({
      currentStreak: 3,
      longestStreak: 5,
      lastCompletedDateString: '2026-10-04',
      freezeTokens: 1,
    }),
    calculateXpMultiplier: () => 1.3,
  },
}));

describe('PuzzleRushGameOver', () => {
  it('renders scores and buttons', () => {
    const handlePlayAgain = vi.fn();
    const handleLeaderboard = vi.fn();

    render(
      <PuzzleRushGameOver
        score={26}
        bestStreak={12}
        totalTime={180}
        rating={1750}
        mode="survival"
        rank={4}
        isNewBest={true}
        onPlayAgain={handlePlayAgain}
        onOpenLeaderboard={handleLeaderboard}
      />,
    );

    expect(screen.getByTestId('puzzle-rush-gameover')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByTestId('puzzle-rush-new-pb')).toBeInTheDocument();
    expect(screen.getByTestId('puzzle-rush-rank-indicator')).toHaveTextContent(
      '#4',
    );

    const playAgainBtn = screen.getByTestId('puzzle-rush-play-again-btn');
    fireEvent.click(playAgainBtn);
    expect(handlePlayAgain).toHaveBeenCalled();

    const lbBtn = screen.getByTestId('puzzle-rush-view-leaderboard-btn');
    fireEvent.click(lbBtn);
    expect(handleLeaderboard).toHaveBeenCalled();

    const shareBtn = screen.getByTestId('puzzle-rush-share-btn');
    fireEvent.click(shareBtn);
    expect(screen.getByTestId('tactical-share-modal')).toBeInTheDocument();
  });
});
