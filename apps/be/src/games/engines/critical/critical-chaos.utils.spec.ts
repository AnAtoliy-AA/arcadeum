import { CriticalState, CriticalPlayerState } from '../../critical/critical.state';
import { GameActionResult } from '../base/game-engine.interface';
import { executeScramble, executeEcho, EngineHelpers } from './critical-chaos.utils';

function makeState(
  players: { id: string; hand: string[]; alive?: boolean }[],
  playDirection: 1 | -1 = 1,
): CriticalState {
  return {
    deck: [],
    discardPile: [],
    playerOrder: players.map((p) => p.id),
    currentTurnIndex: 0,
    pendingDraws: 1,
    playDirection,
    expansions: [],
    pendingDefuse: null,
    pendingFavor: null,
    pendingAlter: null,
    pendingAction: null,
    eliminatedPlayers: [],
    allowActionCardCombos: false,
    players: players.map((p) => ({
      playerId: p.id,
      hand: [...p.hand] as import('../../critical/critical.state').CriticalCard[],
      alive: p.alive ?? true,
      stash: [],
      markedCards: [],
    })),
    logs: [],
  } as unknown as CriticalState;
}

function makeHelpers(
  overrides?: Partial<EngineHelpers>,
): EngineHelpers {
  return {
    addLog: () => undefined,
    createLogEntry: () => ({
      id: 'test',
      type: 'action',
      message: '',
      createdAt: new Date().toISOString(),
    }),
    advanceTurn: () => undefined,
    shuffleArray: () => undefined,
    findPlayer: (state: CriticalState, playerId: string) =>
      state.players.find((p) => p.playerId === playerId),
    ...overrides,
  };
}

describe('executeScramble', () => {
  it('basic forward — direction=1: each player receives hand from previous player', () => {
    const state = makeState([
      { id: 'A', hand: ['mark'] },
      { id: 'B', hand: ['evade', 'strike'] },
      { id: 'C', hand: ['reorder'] },
    ], 1);

    const result = executeScramble(state, 'A', makeHelpers()) as GameActionResult<CriticalState>;
    expect(result.success).toBe(true);

    const s = result.state!;
    const getHand = (id: string) => s.players.find((p: CriticalPlayerState) => p.playerId === id)!.hand;

    // direction=1: player[i] receives from player[(i-1+n)%n]
    // A(0) receives from C(2): ['reorder']
    // B(1) receives from A(0): ['mark']
    // C(2) receives from B(1): ['evade', 'strike']
    expect(getHand('A')).toEqual(['reorder']);
    expect(getHand('B')).toEqual(['mark']);
    expect(getHand('C')).toEqual(['evade', 'strike']);
  });

  it('reversed direction — direction=-1: each player passes to the previous, receives from next', () => {
    const state = makeState([
      { id: 'A', hand: ['mark'] },
      { id: 'B', hand: ['evade', 'strike'] },
      { id: 'C', hand: ['reorder'] },
    ], -1);

    const result = executeScramble(state, 'A', makeHelpers()) as GameActionResult<CriticalState>;
    expect(result.success).toBe(true);

    const s = result.state!;
    const getHand = (id: string) => s.players.find((p: CriticalPlayerState) => p.playerId === id)!.hand;

    // direction=-1: player[i] receives from player[(i+1)%n]
    // A(0) receives from B(1): ['evade', 'strike']
    // B(1) receives from C(2): ['reorder']
    // C(2) receives from A(0): ['mark']
    expect(getHand('A')).toEqual(['evade', 'strike']);
    expect(getHand('B')).toEqual(['reorder']);
    expect(getHand('C')).toEqual(['mark']);
  });

  it('skips dead players — only alive players participate in the rotation', () => {
    const state = makeState([
      { id: 'A', hand: ['mark'] },
      { id: 'B', hand: ['evade', 'strike'], alive: false },
      { id: 'C', hand: ['reorder'] },
    ], 1);

    const result = executeScramble(state, 'A', makeHelpers()) as GameActionResult<CriticalState>;
    expect(result.success).toBe(true);

    const s = result.state!;
    const getHand = (id: string) => s.players.find((p: CriticalPlayerState) => p.playerId === id)!.hand;

    // Only A and C are alive. direction=1: A(0) receives from C(1), C(1) receives from A(0)
    expect(getHand('A')).toEqual(['reorder']);
    expect(getHand('C')).toEqual(['mark']);
    // B (dead) hand unchanged
    expect(getHand('B')).toEqual(['evade', 'strike']);
  });

  it('sets pendingAction with type scramble after play', () => {
    const state = makeState([
      { id: 'A', hand: ['mark'] },
      { id: 'B', hand: ['evade'] },
    ], 1);

    const result = executeScramble(state, 'A', makeHelpers()) as GameActionResult<CriticalState>;
    expect(result.success).toBe(true);

    const s = result.state!;
    expect(s.pendingAction).not.toBeNull();
    expect(s.pendingAction!.type).toBe('scramble');
    expect(s.pendingAction!.playerId).toBe('A');
    expect(s.pendingAction!.nopeCount).toBe(0);
  });
});

describe('executeEcho', () => {
  it('re-executes the top card from discard pile via dispatchCard helper', () => {
    const state = makeState([
      { id: 'A', hand: ['echo'] },
      { id: 'B', hand: ['evade'] },
    ], 1);
    state.discardPile = ['strike'] as import('../../critical/critical.state').CriticalCard[];
    state.pendingDraws = 1;

    // dispatchCard mock simulates strike being executed: advances turn, sets pendingDraws=2
    const dispatchCard = jest.fn(
      (s: CriticalState, _pid: string, card: import('../../critical/critical.state').CriticalCard) => {
        s.pendingDraws = 2;
        s.pendingAction = { type: card, playerId: _pid, payload: {}, nopeCount: 0 };
        return { success: true as const, state: s };
      },
    );

    const helpers = makeHelpers({ dispatchCard });
    const result = executeEcho(state, 'A', 'strike' as import('../../critical/critical.state').CriticalCard, helpers) as GameActionResult<CriticalState>;

    expect(result.success).toBe(true);
    expect(dispatchCard).toHaveBeenCalledWith(state, 'A', 'strike', undefined);
    expect(result.state!.pendingDraws).toBe(2);
    expect(result.state!.pendingAction?.type).toBe('strike');
  });

  it('rejects echoing echo (infinite loop guard)', () => {
    const state = makeState([{ id: 'A', hand: ['echo'] }]);
    const result = executeEcho(state, 'A', 'echo' as import('../../critical/critical.state').CriticalCard, makeHelpers());
    expect(result.success).toBe(false);
  });

  it('rejects echoing critical_event', () => {
    const state = makeState([{ id: 'A', hand: ['echo'] }]);
    const result = executeEcho(state, 'A', 'critical_event' as import('../../critical/critical.state').CriticalCard, makeHelpers());
    expect(result.success).toBe(false);
  });

  it('rejects echoing neutralizer', () => {
    const state = makeState([{ id: 'A', hand: ['echo'] }]);
    const result = executeEcho(state, 'A', 'neutralizer' as import('../../critical/critical.state').CriticalCard, makeHelpers());
    expect(result.success).toBe(false);
  });

  it('returns failure when dispatchCard helper is not provided', () => {
    const state = makeState([{ id: 'A', hand: ['echo'] }]);
    // No dispatchCard in helpers
    const result = executeEcho(state, 'A', 'strike' as import('../../critical/critical.state').CriticalCard, makeHelpers());
    expect(result.success).toBe(false);
  });
});
