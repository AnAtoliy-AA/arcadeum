import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
} from '../../critical/critical.state';
import { executeJudgment } from './critical-deity.utils';
import { EngineHelpers } from './critical-future.utils';
import { GameLogEntry } from '../base/game-engine.interface';

function makePlayer(
  playerId: string,
  hand: CriticalCard[] = [],
  alive = true,
): CriticalPlayerState {
  return { playerId, hand, alive, stash: [], markedCards: [] };
}

function makeState(overrides: Partial<CriticalState> = {}): CriticalState {
  return {
    deck: [],
    discardPile: [],
    playerOrder: ['playerA', 'playerB', 'playerC'],
    currentTurnIndex: 0,
    pendingDraws: 1,
    playDirection: 1,
    expansions: ['deity'],
    allowActionCardCombos: false,
    pendingDefuse: null,
    pendingFavor: null,
    pendingAlter: null,
    pendingAction: null,
    eliminatedPlayers: [],
    players: [
      makePlayer('playerA', ['judgment']),
      makePlayer('playerB', ['strike', 'evade', 'insight', 'trade', 'reorder']),
      makePlayer('playerC', ['strike', 'evade', 'insight', 'trade']),
    ],
    logs: [],
    ...overrides,
  };
}

function makeHelpers(): EngineHelpers {
  return {
    addLog: (state: CriticalState, entry: GameLogEntry) => {
      state.logs.push(entry as CriticalState['logs'][number]);
    },
    createLogEntry: (_type: string, message: string): GameLogEntry => ({
      id: 'test-id',
      type: 'action',
      message,
      createdAt: new Date().toISOString(),
    }),
    advanceTurn: (state: CriticalState) => {
      state.currentTurnIndex =
        (state.currentTurnIndex + state.playDirection + state.playerOrder.length) %
        state.playerOrder.length;
      state.pendingDraws = 1;
    },
    shuffleArray: () => {},
    findPlayer: (state: CriticalState, playerId: string) =>
      state.players.find((p) => p.playerId === playerId),
  };
}

describe('executeJudgment', () => {
  it('sets pendingJudgment on all other alive players', () => {
    const state = makeState();
    const helpers = makeHelpers();

    const result = executeJudgment(state, 'playerA', helpers);

    expect(result.success).toBe(true);
    const playerB = state.players.find((p) => p.playerId === 'playerB') as CriticalPlayerState;
    const playerC = state.players.find((p) => p.playerId === 'playerC') as CriticalPlayerState;
    expect(playerB.pendingJudgment).toBe(true);
    expect(playerC.pendingJudgment).toBe(true);
  });

  it('does NOT set pendingJudgment on the player who played judgment', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeJudgment(state, 'playerA', helpers);

    const playerA = state.players.find((p) => p.playerId === 'playerA') as CriticalPlayerState;
    expect(playerA.pendingJudgment).toBeUndefined();
  });

  it('skips dead players when setting pendingJudgment', () => {
    const state = makeState({
      players: [
        makePlayer('playerA', ['judgment']),
        makePlayer('playerB', ['strike', 'evade', 'insight'], false),
        makePlayer('playerC', ['strike', 'evade', 'insight', 'trade']),
      ],
    });
    const helpers = makeHelpers();

    executeJudgment(state, 'playerA', helpers);

    const playerB = state.players.find((p) => p.playerId === 'playerB') as CriticalPlayerState;
    const playerC = state.players.find((p) => p.playerId === 'playerC') as CriticalPlayerState;
    expect(playerB.pendingJudgment).toBeUndefined();
    expect(playerC.pendingJudgment).toBe(true);
  });

  it('advances turn after playing judgment', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeJudgment(state, 'playerA', helpers);

    // Turn should have advanced from playerA (index 0) to playerB (index 1)
    expect(state.currentTurnIndex).toBe(1);
  });

  it('sets pendingAction with type judgment', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeJudgment(state, 'playerA', helpers);

    expect(state.pendingAction).not.toBeNull();
    expect(state.pendingAction?.type).toBe('judgment');
    expect(state.pendingAction?.playerId).toBe('playerA');
    expect(state.pendingAction?.nopeCount).toBe(0);
  });

  it('returns failure when player is not found', () => {
    const state = makeState();
    const helpers = makeHelpers();

    const result = executeJudgment(state, 'nonExistent', helpers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
