import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params && 'name' in params) return `${key}:${params.name}`;
      return key;
    },
  }),
}));

vi.mock('./opponents/OpponentsRow', () => ({
  OpponentsRow: ({
    opponents,
    currentTurnPlayerId,
  }: {
    opponents: Array<{ playerId: string }>;
    currentTurnPlayerId: string | null;
  }) => (
    <div
      data-testid="opponents-row-stub"
      data-opponent-count={opponents.length}
      data-current-turn={currentTurnPlayerId ?? ''}
    />
  ),
}));

vi.mock('./arena/Arena', () => ({
  Arena: ({ combo }: { combo?: { kind: string; label: string } }) => (
    <div
      data-testid="arena-stub"
      data-combo-kind={combo?.kind ?? ''}
      data-combo-label={combo?.label ?? ''}
    />
  ),
}));

vi.mock('./hand/HandZone', () => ({
  HandZone: ({
    combo,
    canPlay,
    cards,
    onPlay,
    onToggleSelect,
    onOpenRules,
    onToggleFullscreen,
    isFullscreen,
  }: {
    combo: { kind: string; label: string };
    canPlay: boolean;
    cards: Array<{ uid: string }>;
    onPlay: () => void;
    onToggleSelect: (uid: string) => void;
    onOpenRules?: () => void;
    onToggleFullscreen?: () => void;
    isFullscreen?: boolean;
  }) => (
    <div
      data-testid="hand-zone-stub"
      data-combo-kind={combo.kind}
      data-can-play={canPlay ? 'true' : 'false'}
      data-card-uids={cards.map((c) => c.uid).join(',')}
      data-is-fullscreen={isFullscreen ? 'true' : 'false'}
    >
      <button
        type="button"
        data-testid="hand-zone-stub-play"
        onClick={onPlay}
      />
      <button
        type="button"
        data-testid="hand-zone-stub-select-strike-0"
        onClick={() => onToggleSelect('strike-0')}
      />
      <button
        type="button"
        data-testid="hand-zone-stub-select-strike-1"
        onClick={() => onToggleSelect('strike-1')}
      />
      {onOpenRules && (
        <button
          type="button"
          data-testid="hand-zone-stub-rules"
          onClick={onOpenRules}
        />
      )}
      {onToggleFullscreen && (
        <button
          type="button"
          data-testid="hand-zone-stub-fullscreen"
          onClick={onToggleFullscreen}
        />
      )}
    </div>
  ),
}));

vi.mock('./RulesModal', () => ({
  RulesModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="rules-modal-stub">
        <button
          type="button"
          data-testid="rules-modal-close"
          onClick={onClose}
        />
      </div>
    ) : null,
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
    hand: ['strike', 'strike', 'evade'] as CriticalCard[],
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
    allowActionCardCombos: true,
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
    formatLogMessage: (m?: string | null) => m ?? '',
    isFullscreen: false,
    toggleFullscreen: vi.fn(),
    ...override,
  } as MatchWidgetProps;
}

describe('MatchWidget (ARC-635)', () => {
  it('renders the three-row layout: OpponentsRow + Arena + HandZone', () => {
    render(<MatchWidget {...makeProps()} />);
    expect(screen.getByTestId('opponents-row-stub')).toBeInTheDocument();
    expect(screen.getByTestId('arena-stub')).toBeInTheDocument();
    expect(screen.getByTestId('hand-zone-stub')).toBeInTheDocument();
  });

  it('hides HandZone when the current player is eliminated', () => {
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
    expect(screen.queryByTestId('hand-zone-stub')).not.toBeInTheDocument();
  });

  it('hides HandZone when the game is over', () => {
    render(<MatchWidget {...makeProps({ isGameOver: true })} />);
    expect(screen.queryByTestId('hand-zone-stub')).not.toBeInTheDocument();
  });

  it('drives Arena + HandZone with the same combo (placeholder by default)', () => {
    render(<MatchWidget {...makeProps()} />);
    expect(screen.getByTestId('arena-stub')).toHaveAttribute(
      'data-combo-kind',
      'none',
    );
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-combo-kind',
      'none',
    );
  });

  it('upgrades combo to `pair` when two same-name cards are selected', () => {
    render(<MatchWidget {...makeProps()} />);
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-1'));
    expect(screen.getByTestId('arena-stub')).toHaveAttribute(
      'data-combo-kind',
      'pair',
    );
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-can-play',
      'true',
    );
  });

  it('routes single-card plays to handlePlayActionCard', () => {
    const handlePlayActionCard = vi.fn();
    render(<MatchWidget {...makeProps({ handlePlayActionCard })} />);
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(handlePlayActionCard).toHaveBeenCalledWith('strike');
  });

  it('routes pair combos to handleOpenEventCombo', () => {
    const handleOpenEventCombo = vi.fn();
    render(<MatchWidget {...makeProps({ handleOpenEventCombo })} />);
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-1'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(handleOpenEventCombo).toHaveBeenCalledTimes(1);
    expect(handleOpenEventCombo).toHaveBeenCalledWith(
      ['strike', 'strike'],
      ['strike', 'strike', 'evade'],
    );
  });

  it('disables play when it is not your turn', () => {
    render(<MatchWidget {...makeProps({ isMyTurn: false })} />);
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-0'));
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-can-play',
      'false',
    );
  });

  it('forwards fullscreen state + toggle to HandZone for the chrome menu', () => {
    const toggleFullscreen = vi.fn();
    render(
      <MatchWidget {...makeProps({ isFullscreen: true, toggleFullscreen })} />,
    );
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-is-fullscreen',
      'true',
    );
    fireEvent.click(screen.getByTestId('hand-zone-stub-fullscreen'));
    expect(toggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('mounts RulesModal in-place and toggles it via HandRail menu', () => {
    render(<MatchWidget {...makeProps()} />);
    expect(screen.queryByTestId('rules-modal-stub')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('hand-zone-stub-rules'));
    expect(screen.getByTestId('rules-modal-stub')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('rules-modal-close'));
    expect(screen.queryByTestId('rules-modal-stub')).not.toBeInTheDocument();
  });
});
