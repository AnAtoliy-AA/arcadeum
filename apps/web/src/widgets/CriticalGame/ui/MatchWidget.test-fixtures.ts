import { vi } from 'vitest';
import type { MatchWidgetProps } from './MatchWidget';
import type { CriticalCard, CriticalPlayerState } from '../types';

export function makeProps(
  override: Partial<MatchWidgetProps> = {},
): MatchWidgetProps {
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
    handlePlayActionCard: vi.fn(),
    handleOpenEventCombo: vi.fn(),
    handleOpenFiverCombo: vi.fn(),
    formatLogMessage: (m?: string | null) => m ?? '',
    isFullscreen: false,
    toggleFullscreen: vi.fn(),
    autoplayState: { setAllEnabled: vi.fn() } as never,
    idleTimerEnabled: false,
    idleTimerTriggered: false,
    handleIdleTimeout: vi.fn(),
    handleStopAutoplay: vi.fn(),
    ...override,
  } as MatchWidgetProps;
}
