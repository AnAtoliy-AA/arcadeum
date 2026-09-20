import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpadesBoard } from './SpadesBoard';
import type { SpadesClientState } from '../types';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params?.n !== undefined) return `${key}:${params.n}`;
      return key;
    },
  }),
}));

const mockSnapshot: SpadesClientState = {
  phase: 'bidding',
  options: { nilEnabled: true, targetScore: 250 },
  handNumber: 0,
  players: [
    { playerId: 'p1' },
    { playerId: 'p2' },
    { playerId: 'p3' },
    { playerId: 'p4' },
  ],
  playerOrder: ['p1', 'p2', 'p3', 'p4'],
  currentTurnIndex: 0,
  hands: {
    p1: ['AS', 'KS', '4C', 'QS'],
    p2: ['5C', '6C'],
    p3: ['7C', '8C'],
    p4: ['9C', '10C'],
  },
  taken: {},
  bids: { p1: null, p2: null, p3: null, p4: null },
  scores: { p1: 0, p2: 0, p3: 0, p4: 0 },
  bags: { p1: 0, p2: 0 },
  currentTrick: { plays: [], leadSuit: null },
  spadesBroken: false,
  winnerIds: null,
  isDraw: false,
  logs: [],
};

describe('SpadesBoard', () => {
  it('renders bidding controls during bidding phase and triggers onBid', () => {
    const onBid = vi.fn();

    render(
      <SpadesBoard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myHand={['AS', 'KS', '4C', 'QS']}
        legalIds={['AS', 'KS', '4C', 'QS']}
        canAct={true}
        canBid={true}
        hasBid={false}
        onPlayCard={vi.fn()}
        onBid={onBid}
      />,
    );

    expect(screen.getByTestId('spades-board')).toBeInTheDocument();
    expect(screen.getByTestId('spades-bid-3')).toBeInTheDocument();
    expect(screen.getByTestId('spades-bid-nil')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('spades-bid-3'));
    fireEvent.click(screen.getByTestId('spades-confirm-bid'));
    expect(onBid).toHaveBeenCalledWith(3);
  });

  it('renders played cards and allows playing card in trick phase', () => {
    const playingSnapshot: SpadesClientState = {
      ...mockSnapshot,
      phase: 'playing',
      bids: { p1: 3, p2: 2, p3: 4, p4: 1 },
      currentTrick: {
        plays: [{ playerId: 'p2', card: '2C' }],
        leadSuit: 'C',
      },
    };

    const onPlayCard = vi.fn();

    render(
      <SpadesBoard
        snapshot={playingSnapshot}
        currentUserId="p1"
        myHand={['AS', 'KS', '4C']}
        legalIds={['4C']}
        canAct={true}
        canBid={false}
        hasBid={true}
        onPlayCard={onPlayCard}
        onBid={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('spades-confirm-bid')).not.toBeInTheDocument();
    const legalCard = screen.getByTestId('spades-card-4C');
    expect(legalCard).not.toBeDisabled();
    fireEvent.click(legalCard);
    expect(onPlayCard).toHaveBeenCalledWith('4C');
  });
});
