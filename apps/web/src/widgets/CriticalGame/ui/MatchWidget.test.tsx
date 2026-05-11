import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./GameTableSection', () => ({
  GameTableSection: ({ centerSlot }: { centerSlot?: React.ReactNode }) => (
    <div data-testid="game-table-section-stub">{centerSlot}</div>
  ),
}));

vi.mock('./PlayerHand', () => ({
  PlayerHand: () => <div data-testid="player-hand-stub" />,
}));

vi.mock('./arena/Arena', () => ({
  Arena: () => <div data-testid="arena-stub" />,
}));

vi.mock('./styles/layout', () => ({
  GameBoard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="game-board-stub">{children}</div>
  ),
  TableArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="table-area-stub">{children}</div>
  ),
}));

import { MatchWidget, type MatchWidgetProps } from './MatchWidget';
import type { CriticalCard, CriticalPlayerState } from '../types';

function makeProps(override: Partial<MatchWidgetProps> = {}): MatchWidgetProps {
  const currentPlayer: CriticalPlayerState = {
    playerId: 'p1',
    hand: ['strike'] as CriticalCard[],
    alive: true,
  };
  const baseSnapshot = {
    deck: [] as CriticalCard[],
    discardPile: [] as CriticalCard[],
    playerOrder: ['p1'],
    currentTurnIndex: 0,
    pendingDraws: 1,
    pendingDefuse: null,
    pendingFavor: null,
    pendingAlter: null,
    pendingAction: null,
    players: [currentPlayer],
    logs: [],
    allowActionCardCombos: false,
  };
  return {
    room: { id: 'room' } as never,
    snapshot: baseSnapshot,
    currentUserId: 'p1',
    currentPlayer,
    cardVariant: 'cyberpunk',
    isGameOver: false,
    isMyTurn: true,
    canAct: true,
    canPlayNope: false,
    actionBusy: null,
    aliveOpponents: [],
    handLayout: 'grid',
    setHandLayout: vi.fn(),
    resolveDisplayName: (_id?: string, fb?: string) => fb,
    t: ((k: string) => k) as never,
    actions: {
      drawCard: vi.fn(),
      playNope: vi.fn(),
      playSeeTheFuture: vi.fn(),
      playFavor: vi.fn(),
      giveFavorCard: vi.fn(),
      playDefuse: vi.fn(),
    } as never,
    idleTimerTriggered: false,
    autoplayState: { setAllEnabled: vi.fn() },
    handleUnstash: vi.fn(),
    handlePlayActionCard: vi.fn(),
    handleOpenFavorModal: vi.fn(),
    handleOpenEventCombo: vi.fn(),
    handleOpenFiverCombo: vi.fn(),
    ...override,
  } as MatchWidgetProps;
}

describe('MatchWidget (ARC-632)', () => {
  it('renders the table shell with Arena slotted as the center', () => {
    render(<MatchWidget {...makeProps()} />);
    expect(screen.getByTestId('match-widget')).toBeInTheDocument();
    expect(screen.getByTestId('game-table-section-stub')).toBeInTheDocument();
    // Arena lands inside GameTableSection's centerSlot (the stub re-renders
    // children inline so we can see the arena inside the table stub).
    expect(screen.getByTestId('arena-stub')).toBeInTheDocument();
  });

  it('mounts PlayerHand when the current player is alive and game is live', () => {
    render(<MatchWidget {...makeProps()} />);
    expect(screen.getByTestId('player-hand-stub')).toBeInTheDocument();
  });

  it('hides PlayerHand when the current player is eliminated', () => {
    render(
      <MatchWidget
        {...makeProps({
          currentPlayer: {
            playerId: 'p1',
            hand: [],
            alive: false,
          },
        })}
      />,
    );
    expect(screen.queryByTestId('player-hand-stub')).not.toBeInTheDocument();
  });

  it('hides PlayerHand when the game is over', () => {
    render(<MatchWidget {...makeProps({ isGameOver: true })} />);
    expect(screen.queryByTestId('player-hand-stub')).not.toBeInTheDocument();
  });
});
