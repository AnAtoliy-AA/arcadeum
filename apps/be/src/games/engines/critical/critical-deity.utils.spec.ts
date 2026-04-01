import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
} from '../../critical/critical.state';
import { executeResurrection } from './critical-deity.utils';
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
    playerOrder: ['playerA', 'playerB'],
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
      makePlayer('playerA', ['resurrection']),
      makePlayer('playerB', [], false),
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
    advanceTurn: () => {},
    shuffleArray: () => {},
    findPlayer: (state: CriticalState, playerId: string) =>
      state.players.find((p) => p.playerId === playerId),
  };
}

describe('executeResurrection', () => {
  it('revives the most recently eliminated player', () => {
    const state = makeState({
      eliminatedPlayers: ['playerB'],
      deck: [
        'strike',
        'evade',
        'reorder',
        'strike',
        'evade',
        'reorder',
        'insight',
        'trade',
        'cancel',
        'insight',
      ],
    });
    const helpers = makeHelpers();

    const result = executeResurrection(state, 'playerA', helpers);

    expect(result.success).toBe(true);
    const revived = state.players.find((p) => p.playerId === 'playerB');
    expect(revived?.alive).toBe(true);
  });

  it('removes the revived player from eliminatedPlayers', () => {
    const state = makeState({
      eliminatedPlayers: ['playerB'],
      deck: [
        'strike',
        'evade',
        'reorder',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
      ] as CriticalCard[],
    });
    const helpers = makeHelpers();

    executeResurrection(state, 'playerA', helpers);

    expect(state.eliminatedPlayers).not.toContain('playerB');
    expect(state.eliminatedPlayers.length).toBe(0);
  });

  it('gives 3 cards from the bottom of the deck to the revived player', () => {
    const deck: CriticalCard[] = [
      'strike',
      'evade',
      'reorder',
      'strike',
      'evade',
      'reorder',
      'insight',
      'cancel',
      'trade',
      'insight', // last 3: cancel, trade, insight
    ];
    const state = makeState({
      eliminatedPlayers: ['playerB'],
      deck: [...deck],
    });
    const helpers = makeHelpers();

    executeResurrection(state, 'playerA', helpers);

    const revived = state.players.find((p) => p.playerId === 'playerB');
    expect(revived?.hand).toHaveLength(3);
    expect(revived?.hand).toEqual(['cancel', 'trade', 'insight']);
    expect(state.deck).toHaveLength(7);
  });

  it('removes exactly 3 cards from the deck', () => {
    const deck: CriticalCard[] = Array(10).fill('strike') as CriticalCard[];
    const state = makeState({
      eliminatedPlayers: ['playerB'],
      deck: [...deck],
    });
    const helpers = makeHelpers();

    executeResurrection(state, 'playerA', helpers);

    expect(state.deck).toHaveLength(7);
  });

  it('fails if eliminatedPlayers is empty', () => {
    const state = makeState({
      eliminatedPlayers: [],
      deck: ['strike', 'evade', 'reorder'] as CriticalCard[],
    });
    const helpers = makeHelpers();

    const result = executeResurrection(state, 'playerA', helpers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('sets pendingAction correctly after resurrection', () => {
    const state = makeState({
      eliminatedPlayers: ['playerB'],
      deck: ['strike', 'evade', 'reorder', 'a', 'b', 'c'] as CriticalCard[],
    });
    const helpers = makeHelpers();

    executeResurrection(state, 'playerA', helpers);

    expect(state.pendingAction).not.toBeNull();
    expect(state.pendingAction?.type).toBe('resurrection');
    expect(state.pendingAction?.playerId).toBe('playerA');
    const payload = state.pendingAction?.payload as { targetPlayerId: string };
    expect(payload.targetPlayerId).toBe('playerB');
    expect(state.pendingAction?.nopeCount).toBe(0);
  });

  it('revives only the last eliminated player when multiple are eliminated', () => {
    const state = makeState({
      players: [
        makePlayer('playerA', ['resurrection']),
        makePlayer('playerB', [], false),
        makePlayer('playerC', [], false),
      ],
      playerOrder: ['playerA', 'playerB', 'playerC'],
      eliminatedPlayers: ['playerB', 'playerC'],
      deck: Array(10).fill('strike') as CriticalCard[],
    });
    const helpers = makeHelpers();

    executeResurrection(state, 'playerA', helpers);

    const playerB = state.players.find((p) => p.playerId === 'playerB');
    const playerC = state.players.find((p) => p.playerId === 'playerC');
    expect(playerC?.alive).toBe(true);
    expect(playerB?.alive).toBe(false);
    expect(state.eliminatedPlayers).toEqual(['playerB']);
  });

  it('fails if the player executing resurrection does not exist', () => {
    const state = makeState({
      eliminatedPlayers: ['playerB'],
      deck: Array(5).fill('strike') as CriticalCard[],
    });
    const helpers = makeHelpers();

    const result = executeResurrection(state, 'nonExistentPlayer', helpers);

    expect(result.success).toBe(false);
  });
});
