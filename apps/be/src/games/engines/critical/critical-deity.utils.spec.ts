import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
} from '../../critical/critical.state';
import { executeProphecy, executeCommitProphecy } from './critical-deity.utils';
import { EngineHelpers } from './critical-future.utils';
import { GameLogEntry } from '../base/game-engine.interface';

function makePlayer(
  playerId: string,
  hand: CriticalCard[] = [],
  alive = true,
): CriticalPlayerState {
  return { playerId, hand, alive, stash: [], markedCards: [] };
}

function makeHelpers(): EngineHelpers {
  return {
    addLog: (state: CriticalState, entry: GameLogEntry) => {
      state.logs.push(entry as CriticalState['logs'][number]);
    },
    createLogEntry: (
      _type: string,
      message: string,
      options?: Record<string, unknown>,
    ): GameLogEntry => ({
      id: 'test-id',
      type: 'action',
      message,
      createdAt: new Date().toISOString(),
      ...(options ?? {}),
    }),
    advanceTurn: (state: CriticalState) => {
      state.currentTurnIndex =
        (state.currentTurnIndex +
          state.playDirection +
          state.playerOrder.length) %
        state.playerOrder.length;
      state.pendingDraws = 1;
    },
    shuffleArray: () => {},
    findPlayer: (state: CriticalState, playerId: string) =>
      state.players.find((p) => p.playerId === playerId),
  };
}

describe('executeProphecy', () => {
  function makeState(overrides: Partial<CriticalState> = {}): CriticalState {
    return {
      deck: [
        'strike',
        'evade',
        'reorder',
        'insight',
        'cancel',
        'trade',
        'neutralizer',
        'strike',
        'evade',
        'reorder',
      ] as CriticalCard[],
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
      players: [makePlayer('playerA', ['prophecy']), makePlayer('playerB', [])],
      logs: [],
      ...overrides,
    };
  }

  it('sends private log with top 5 cards', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeProphecy(state, 'playerA', helpers);

    const privateLog = state.logs.find(
      (l) => l.scope === 'private' && l.message.startsWith('prophecy.reveal:'),
    );
    expect(privateLog).toBeDefined();
    expect(privateLog?.senderId).toBe('playerA');
    // Deck has 10 cards, top 5 are indices 0-4
    expect(privateLog?.message).toBe(
      'prophecy.reveal:cards:strike,cards:evade,cards:reorder,cards:insight,cards:cancel',
    );
  });

  it('sets pendingProphecy state with playerId and top5', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeProphecy(state, 'playerA', helpers);

    expect(state.pendingProphecy).toBeDefined();
    expect(state.pendingProphecy?.playerId).toBe('playerA');
    expect(state.pendingProphecy?.top5).toHaveLength(5);
    expect(state.pendingProphecy?.top5).toEqual([
      'strike',
      'evade',
      'reorder',
      'insight',
      'cancel',
    ]);
  });

  it('fails if deck is empty', () => {
    const state = makeState({ deck: [] });
    const helpers = makeHelpers();

    const result = executeProphecy(state, 'playerA', helpers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('peeks at fewer than 5 if deck has fewer cards', () => {
    const state = makeState({
      deck: ['strike', 'evade', 'reorder'] as CriticalCard[],
    });
    const helpers = makeHelpers();

    executeProphecy(state, 'playerA', helpers);

    expect(state.pendingProphecy?.top5).toHaveLength(3);
  });
});

describe('executeCommitProphecy', () => {
  function makeState(overrides: Partial<CriticalState> = {}): CriticalState {
    const top5: CriticalCard[] = [
      'strike',
      'evade',
      'reorder',
      'insight',
      'cancel',
    ];
    return {
      deck: [
        'strike',
        'evade',
        'reorder',
        'insight',
        'cancel',
        'trade',
        'neutralizer',
      ] as CriticalCard[],
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
      pendingProphecy: { playerId: 'playerA', top5 },
      players: [makePlayer('playerA', []), makePlayer('playerB', [])],
      logs: [],
      ...overrides,
    };
  }

  it('reorders top 2 cards in chosen order', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(state.deck[0]).toBe('evade');
    expect(state.deck[1]).toBe('strike');
  });

  it('clears pendingProphecy after commit', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(state.pendingProphecy).toBeUndefined();
  });

  it('advances turn after commit', () => {
    const state = makeState();
    const helpers = makeHelpers();

    executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(state.currentTurnIndex).toBe(1);
  });

  it('fails if no pendingProphecy', () => {
    const state = makeState({ pendingProphecy: undefined });
    const helpers = makeHelpers();

    const result = executeCommitProphecy(
      state,
      'playerA',
      ['evade', 'strike'],
      helpers,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails if pendingProphecy belongs to different player', () => {
    const state = makeState({
      pendingProphecy: {
        playerId: 'playerB',
        top5: ['strike', 'evade', 'reorder', 'insight', 'cancel'],
      },
    });
    const helpers = makeHelpers();

    const result = executeCommitProphecy(
      state,
      'playerA',
      ['evade', 'strike'],
      helpers,
    );

    expect(result.success).toBe(false);
  });

  it('fails if reorderedTop2 does not contain cards from top5', () => {
    const state = makeState();
    const helpers = makeHelpers();

    const result = executeCommitProphecy(
      state,
      'playerA',
      ['neutralizer', 'trade'] as CriticalCard[],
      helpers,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails if reorderedTop2 does not have exactly 2 cards', () => {
    const state = makeState();
    const helpers = makeHelpers();

    const result = executeCommitProphecy(
      state,
      'playerA',
      ['strike'] as CriticalCard[],
      helpers,
    );

    expect(result.success).toBe(false);
  });

  it('rejects duplicate cards that bypass validation', () => {
    // top5 has only one 'strike', so ['strike', 'strike'] should be invalid
    const state = makeState();
    const helpers = makeHelpers();

    const result = executeCommitProphecy(
      state,
      'playerA',
      ['strike', 'strike'] as CriticalCard[],
      helpers,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
