import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ChessClientState } from '../types';
import { ChessGameResultModal } from './ChessGameResultModal';

vi.mock('@/features/games/ui/GameResultModal', () => ({
  GameResultModal: ({
    messages,
  }: {
    messages?: { title: string; message: string };
  }) => (
    <div>
      <h2>{messages?.title}</h2>
      <p data-testid="result-message">{messages?.message}</p>
    </div>
  ),
}));
vi.mock('@/features/analysis/ui/PostGameAnalysis', () => ({
  PostGameAnalysis: () => null,
}));
vi.mock('@/features/achievements/actions', () => ({
  checkNewlyUnlockedAchievements: () => Promise.resolve([]),
}));

const snapshot = {
  variant: 'standard',
  winnerColor: 'white',
  clocks: {
    white: { remainingSeconds: 40, lastMoveTimestamp: 1 },
    black: { remainingSeconds: 0, lastMoveTimestamp: 1 },
  },
  isCheckmate: false,
  isStalemate: false,
  isDrawByRepetition: false,
  isDrawByFiftyMoveRule: false,
  isInsufficientMaterial: false,
  isDrawByAgreement: false,
  moveHistory: [],
  positionHistory: [],
} as unknown as ChessClientState;

const t = ((key: string) => key) as never;

describe('ChessGameResultModal', () => {
  it('replaces the generic checkmate copy with the real end reason', () => {
    render(
      <ChessGameResultModal
        isOpen
        result="victory"
        t={t}
        messages={{ title: 'You won!', message: 'Checkmate! You defeated...' }}
        snapshot={snapshot}
      />,
    );
    expect(screen.getByText('You won!')).toBeDefined();
    expect(screen.getByTestId('result-message').textContent).toBe(
      'games.chess_v1.endReason.timeout',
    );
  });

  it('keeps the provided messages when there is no snapshot', () => {
    render(
      <ChessGameResultModal
        isOpen
        result="defeat"
        t={t}
        messages={{ title: 'You lost.', message: 'Original' }}
        snapshot={null}
      />,
    );
    expect(screen.getByTestId('result-message').textContent).toBe('Original');
  });
});
