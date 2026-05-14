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
    targetPlayerId,
    onSelectTarget,
  }: {
    opponents: Array<{ playerId: string }>;
    currentTurnPlayerId: string | null;
    targetPlayerId?: string | null;
    onSelectTarget?: (id: string) => void;
  }) => (
    <div
      data-testid="opponents-row-stub"
      data-opponent-count={opponents.length}
      data-current-turn={currentTurnPlayerId ?? ''}
      data-target={targetPlayerId ?? ''}
      data-selectable={onSelectTarget ? 'true' : 'false'}
    >
      {opponents.map((o) => (
        <button
          key={o.playerId}
          type="button"
          data-testid={`opponents-row-stub-select-${o.playerId}`}
          onClick={() => onSelectTarget?.(o.playerId)}
        />
      ))}
    </div>
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
      data-combo-label={combo.label}
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
      <button
        type="button"
        data-testid="hand-zone-stub-select-targeted_strike-0"
        onClick={() => onToggleSelect('targeted_strike-0')}
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
  MatchWidgetGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="match-widget-grid-stub">{children}</div>
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
      playActionCard: vi.fn(),
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

describe('MatchWidget target selection (ARC-637/638)', () => {
  function makeTargetProps(
    overrides: Partial<MatchWidgetProps> = {},
  ): MatchWidgetProps {
    const currentPlayer: CriticalPlayerState = {
      playerId: 'me',
      hand: ['targeted_strike', 'strike'] as CriticalCard[],
      alive: true,
    };
    const opponent: CriticalPlayerState = {
      playerId: 'opp1',
      hand: ['strike'] as CriticalCard[],
      alive: true,
    };
    return makeProps({
      currentPlayer,
      currentUserId: 'me',
      snapshot: {
        deck: [] as CriticalCard[],
        discardPile: [] as CriticalCard[],
        playerOrder: ['me', 'opp1'],
        currentTurnIndex: 0,
        pendingDraws: 1,
        pendingDefuse: null,
        pendingFavor: null,
        pendingAlter: null,
        pendingAction: null,
        players: [currentPlayer, opponent],
        logs: [],
        allowActionCardCombos: true,
      } as never,
      ...overrides,
    });
  }

  it('forwards onSelectTarget only while it is my turn', () => {
    render(<MatchWidget {...makeTargetProps()} />);
    expect(screen.getByTestId('opponents-row-stub')).toHaveAttribute(
      'data-selectable',
      'true',
    );
  });

  it('does not pass onSelectTarget when it is not my turn', () => {
    render(<MatchWidget {...makeTargetProps({ isMyTurn: false })} />);
    expect(screen.getByTestId('opponents-row-stub')).toHaveAttribute(
      'data-selectable',
      'false',
    );
  });

  it('records the armed target and clears it on re-click (toggle)', () => {
    render(<MatchWidget {...makeTargetProps()} />);
    fireEvent.click(screen.getByTestId('opponents-row-stub-select-opp1'));
    expect(screen.getByTestId('opponents-row-stub')).toHaveAttribute(
      'data-target',
      'opp1',
    );
    fireEvent.click(screen.getByTestId('opponents-row-stub-select-opp1'));
    expect(screen.getByTestId('opponents-row-stub')).toHaveAttribute(
      'data-target',
      '',
    );
  });

  it('disables play and shows "pick a target" label for a targeted single without a target', () => {
    render(<MatchWidget {...makeTargetProps()} />);
    fireEvent.click(
      screen.getByTestId('hand-zone-stub-select-targeted_strike-0'),
    );
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-can-play',
      'false',
    );
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-combo-label',
      'games.table.hud.combo.pickTarget',
    );
  });

  it('enables play once both targeted single and target are armed', () => {
    render(<MatchWidget {...makeTargetProps()} />);
    fireEvent.click(
      screen.getByTestId('hand-zone-stub-select-targeted_strike-0'),
    );
    fireEvent.click(screen.getByTestId('opponents-row-stub-select-opp1'));
    expect(screen.getByTestId('hand-zone-stub')).toHaveAttribute(
      'data-can-play',
      'true',
    );
  });

  it('calls actions.playActionCard with targetPlayerId on play and clears the target', () => {
    const playActionCard = vi.fn();
    const handlePlayActionCard = vi.fn();
    render(
      <MatchWidget
        {...makeTargetProps({
          handlePlayActionCard,
          actions: {
            drawCard: vi.fn(),
            playNope: vi.fn(),
            playSeeTheFuture: vi.fn(),
            playFavor: vi.fn(),
            giveFavorCard: vi.fn(),
            playDefuse: vi.fn(),
            playActionCard,
          } as never,
        })}
      />,
    );
    fireEvent.click(
      screen.getByTestId('hand-zone-stub-select-targeted_strike-0'),
    );
    fireEvent.click(screen.getByTestId('opponents-row-stub-select-opp1'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(playActionCard).toHaveBeenCalledWith('targeted_strike', {
      targetPlayerId: 'opp1',
    });
    // Targeted singles must NOT also fall through to the legacy modal
    // path (handlePlayActionCard would open the target picker).
    expect(handlePlayActionCard).not.toHaveBeenCalled();
    // Target clears after play so the next turn doesn't inherit it.
    expect(screen.getByTestId('opponents-row-stub')).toHaveAttribute(
      'data-target',
      '',
    );
  });

  it('still routes non-targeted singles through handlePlayActionCard', () => {
    const playActionCard = vi.fn();
    const handlePlayActionCard = vi.fn();
    render(
      <MatchWidget
        {...makeTargetProps({
          handlePlayActionCard,
          actions: {
            drawCard: vi.fn(),
            playNope: vi.fn(),
            playSeeTheFuture: vi.fn(),
            playFavor: vi.fn(),
            giveFavorCard: vi.fn(),
            playDefuse: vi.fn(),
            playActionCard,
          } as never,
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('hand-zone-stub-select-strike-1'));
    fireEvent.click(screen.getByTestId('hand-zone-stub-play'));
    expect(handlePlayActionCard).toHaveBeenCalledWith('strike');
    expect(playActionCard).not.toHaveBeenCalled();
  });
});
