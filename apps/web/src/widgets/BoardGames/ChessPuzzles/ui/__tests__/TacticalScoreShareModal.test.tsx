import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TacticalScoreShareModal } from '../TacticalScoreShareModal';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.chess_v1.puzzleRush.survival': 'Survival Mode',
        'games.chess_v1.puzzleRush.timed': 'Timed Mode',
        'games.chess_v1.puzzleRush.dailyModeTitle': 'Daily Tactical',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('TacticalScoreShareModal', () => {
  it('renders modal with score, streak, time and rating', () => {
    render(
      <TacticalScoreShareModal
        open={true}
        onClose={vi.fn()}
        gameMode="timed"
        score={28}
        bestStreak={14}
        totalTimeSeconds={180}
        rating={1920}
        streakMultiplier={1.5}
      />,
    );

    expect(screen.getByTestId('tactical-share-modal')).toBeInTheDocument();
    expect(screen.getByTestId('tactical-share-score')).toHaveTextContent('28');
    expect(screen.getByTestId('tactical-share-streak')).toHaveTextContent('14');
    expect(screen.getByTestId('tactical-share-multiplier')).toHaveTextContent(
      '1.5x XP Bonus',
    );
    expect(screen.getByTestId('tactical-share-preview-text')).toHaveTextContent(
      'Mode: Timed Mode',
    );
  });

  it('triggers copy to clipboard when Copy Text is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(
      <TacticalScoreShareModal
        open={true}
        onClose={vi.fn()}
        gameMode="survival"
        score={35}
        bestStreak={20}
        totalTimeSeconds={240}
        rating={2100}
      />,
    );

    const copyBtn = screen.getByTestId('tactical-share-copy-btn');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeText).toHaveBeenCalled();
  });
});
