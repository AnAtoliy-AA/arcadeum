import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HeartsBoard } from './HeartsBoard';
import type { HeartsClientState } from '../types';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params?.n !== undefined) return `${key}:${params.n}`;
      return key;
    },
  }),
}));

const mockSnapshot: HeartsClientState = {
  phase: 'passing',
  options: { passingEnabled: true, targetScore: 100 },
  handNumber: 0,
  passDirection: 'left',
  players: [
    { playerId: 'p1' },
    { playerId: 'p2' },
    { playerId: 'p3' },
    { playerId: 'p4' },
  ],
  playerOrder: ['p1', 'p2', 'p3', 'p4'],
  currentTurnIndex: 0,
  hands: {
    p1: ['2C', '3C', '4C', 'QS'],
    p2: ['5C', '6C'],
    p3: ['7C', '8C'],
    p4: ['9C', '10C'],
  },
  taken: {},
  pendingPasses: {},
  scores: { p1: 0, p2: 0, p3: 0, p4: 0 },
  handScores: { p1: 0, p2: 0, p3: 0, p4: 0 },
  currentTrick: { plays: [], leadSuit: null },
  heartsBroken: false,
  winnerIds: null,
  winType: null,
  isDraw: false,
  logs: [],
};

describe('HeartsBoard', () => {
  it('renders the board and passing controls during passing phase', () => {
    const onToggleCard = vi.fn();
    const onConfirmPass = vi.fn();

    render(
      <HeartsBoard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myHand={['2C', '3C', '4C', 'QS']}
        legalIds={['2C', '3C', '4C', 'QS']}
        canAct={true}
        hasPassed={false}
        selectedCards={['2C', '3C']}
        onPlayCard={vi.fn()}
        onToggleCard={onToggleCard}
        onConfirmPass={onConfirmPass}
      />,
    );

    expect(screen.getByTestId('hearts-board')).toBeInTheDocument();
    expect(screen.getByTestId('hearts-pass-button')).toBeDisabled();
    expect(screen.getByTestId('hearts-card-2C')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('hearts-card-QS'));
    expect(onToggleCard).toHaveBeenCalledWith('QS');
  });

  it('enables the pass button when 3 cards are selected and triggers onConfirmPass', () => {
    const onConfirmPass = vi.fn();

    render(
      <HeartsBoard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myHand={['2C', '3C', '4C', 'QS']}
        legalIds={['2C', '3C', '4C', 'QS']}
        canAct={true}
        hasPassed={false}
        selectedCards={['2C', '3C', '4C']}
        onPlayCard={vi.fn()}
        onToggleCard={vi.fn()}
        onConfirmPass={onConfirmPass}
      />,
    );

    const passBtn = screen.getByTestId('hearts-pass-button');
    expect(passBtn).not.toBeDisabled();
    fireEvent.click(passBtn);
    expect(onConfirmPass).toHaveBeenCalled();
  });

  it('renders played cards in trick area during playing phase', () => {
    const playingSnapshot: HeartsClientState = {
      ...mockSnapshot,
      phase: 'playing',
      currentTrick: {
        plays: [{ playerId: 'p1', card: '2C' }],
        leadSuit: 'C',
      },
    };

    const onPlayCard = vi.fn();

    render(
      <HeartsBoard
        snapshot={playingSnapshot}
        currentUserId="p1"
        myHand={['3C', '4C', 'QS']}
        legalIds={['3C', '4C']}
        canAct={true}
        hasPassed={true}
        selectedCards={[]}
        onPlayCard={onPlayCard}
        onToggleCard={vi.fn()}
        onConfirmPass={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('hearts-pass-button')).not.toBeInTheDocument();
    const legalCard = screen.getByTestId('hearts-card-3C');
    expect(legalCard).not.toBeDisabled();
    fireEvent.click(legalCard);
    expect(onPlayCard).toHaveBeenCalledWith('3C');
  });
});
