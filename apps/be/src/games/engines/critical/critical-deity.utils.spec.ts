import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
} from '../../critical/critical.state';
import {
  executeResurrection,
  executeJudgment,
  executeProphecy,
  executeCommitProphecy,
} from './critical-deity.utils';
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

describe('executeJudgment', () => {
  function makeJudgmentState(overrides: Partial<CriticalState> = {}): CriticalState {
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

  function makeAdvancingHelpers(): EngineHelpers {
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

  it('sets pendingJudgment on all other alive players', () => {
    const state = makeJudgmentState();
    const helpers = makeAdvancingHelpers();

    const result = executeJudgment(state, 'playerA', helpers);

    expect(result.success).toBe(true);
    const playerB = state.players.find((p) => p.playerId === 'playerB') as CriticalPlayerState;
    const playerC = state.players.find((p) => p.playerId === 'playerC') as CriticalPlayerState;
    expect(playerB.pendingJudgment).toBe(true);
    expect(playerC.pendingJudgment).toBe(true);
  });

  it('does NOT set pendingJudgment on the player who played judgment', () => {
    const state = makeJudgmentState();
    const helpers = makeAdvancingHelpers();

    executeJudgment(state, 'playerA', helpers);

    const playerA = state.players.find((p) => p.playerId === 'playerA') as CriticalPlayerState;
    expect(playerA.pendingJudgment).toBeUndefined();
  });

  it('skips dead players when setting pendingJudgment', () => {
    const state = makeJudgmentState({
      players: [
        makePlayer('playerA', ['judgment']),
        makePlayer('playerB', ['strike', 'evade', 'insight'], false),
        makePlayer('playerC', ['strike', 'evade', 'insight', 'trade']),
      ],
    });
    const helpers = makeAdvancingHelpers();

    executeJudgment(state, 'playerA', helpers);

    const playerB = state.players.find((p) => p.playerId === 'playerB') as CriticalPlayerState;
    const playerC = state.players.find((p) => p.playerId === 'playerC') as CriticalPlayerState;
    expect(playerB.pendingJudgment).toBeUndefined();
    expect(playerC.pendingJudgment).toBe(true);
  });

  it('advances turn after playing judgment', () => {
    const state = makeJudgmentState();
    const helpers = makeAdvancingHelpers();

    executeJudgment(state, 'playerA', helpers);

    // Turn should have advanced from playerA (index 0) to playerB (index 1)
    expect(state.currentTurnIndex).toBe(1);
  });

  it('sets pendingAction with type judgment', () => {
    const state = makeJudgmentState();
    const helpers = makeAdvancingHelpers();

    executeJudgment(state, 'playerA', helpers);

    expect(state.pendingAction).not.toBeNull();
    expect(state.pendingAction?.type).toBe('judgment');
    expect(state.pendingAction?.playerId).toBe('playerA');
    expect(state.pendingAction?.nopeCount).toBe(0);
  });

  it('returns failure when player is not found', () => {
    const state = makeJudgmentState();
    const helpers = makeAdvancingHelpers();

    const result = executeJudgment(state, 'nonExistent', helpers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('executeProphecy', () => {
  function makeProphecyState(overrides: Partial<CriticalState> = {}): CriticalState {
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
      players: [
        makePlayer('playerA', ['prophecy']),
        makePlayer('playerB', []),
      ],
      logs: [],
      ...overrides,
    };
  }

  function makeAdvancingHelpers(): EngineHelpers {
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
          (state.currentTurnIndex + state.playDirection + state.playerOrder.length) %
          state.playerOrder.length;
        state.pendingDraws = 1;
      },
      shuffleArray: () => {},
      findPlayer: (state: CriticalState, playerId: string) =>
        state.players.find((p) => p.playerId === playerId),
    };
  }

  it('sends private log with top 5 cards', () => {
    const state = makeProphecyState();
    const helpers = makeAdvancingHelpers();

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
    const state = makeProphecyState();
    const helpers = makeAdvancingHelpers();

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
    const state = makeProphecyState({ deck: [] });
    const helpers = makeAdvancingHelpers();

    const result = executeProphecy(state, 'playerA', helpers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('peeks at fewer than 5 if deck has fewer cards', () => {
    const state = makeProphecyState({
      deck: ['strike', 'evade', 'reorder'] as CriticalCard[],
    });
    const helpers = makeAdvancingHelpers();

    executeProphecy(state, 'playerA', helpers);

    expect(state.pendingProphecy?.top5).toHaveLength(3);
  });
});

describe('executeCommitProphecy', () => {
  function makeCommitState(overrides: Partial<CriticalState> = {}): CriticalState {
    const top5: CriticalCard[] = ['strike', 'evade', 'reorder', 'insight', 'cancel'];
    return {
      deck: ['strike', 'evade', 'reorder', 'insight', 'cancel', 'trade', 'neutralizer'] as CriticalCard[],
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
      players: [
        makePlayer('playerA', []),
        makePlayer('playerB', []),
      ],
      logs: [],
      ...overrides,
    };
  }

  function makeAdvancingHelpers(): EngineHelpers {
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
          (state.currentTurnIndex + state.playDirection + state.playerOrder.length) %
          state.playerOrder.length;
        state.pendingDraws = 1;
      },
      shuffleArray: () => {},
      findPlayer: (state: CriticalState, playerId: string) =>
        state.players.find((p) => p.playerId === playerId),
    };
  }

  it('reorders top 2 cards in chosen order', () => {
    const state = makeCommitState();
    const helpers = makeAdvancingHelpers();

    executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(state.deck[0]).toBe('evade');
    expect(state.deck[1]).toBe('strike');
  });

  it('clears pendingProphecy after commit', () => {
    const state = makeCommitState();
    const helpers = makeAdvancingHelpers();

    executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(state.pendingProphecy).toBeUndefined();
  });

  it('advances turn after commit', () => {
    const state = makeCommitState();
    const helpers = makeAdvancingHelpers();

    executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(state.currentTurnIndex).toBe(1);
  });

  it('fails if no pendingProphecy', () => {
    const state = makeCommitState({ pendingProphecy: undefined });
    const helpers = makeAdvancingHelpers();

    const result = executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails if pendingProphecy belongs to different player', () => {
    const state = makeCommitState({
      pendingProphecy: {
        playerId: 'playerB',
        top5: ['strike', 'evade', 'reorder', 'insight', 'cancel'],
      },
    });
    const helpers = makeAdvancingHelpers();

    const result = executeCommitProphecy(state, 'playerA', ['evade', 'strike'], helpers);

    expect(result.success).toBe(false);
  });

  it('fails if reorderedTop2 does not contain cards from top5', () => {
    const state = makeCommitState();
    const helpers = makeAdvancingHelpers();

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
    const state = makeCommitState();
    const helpers = makeAdvancingHelpers();

    const result = executeCommitProphecy(state, 'playerA', ['strike'] as CriticalCard[], helpers);

    expect(result.success).toBe(false);
  });
});
