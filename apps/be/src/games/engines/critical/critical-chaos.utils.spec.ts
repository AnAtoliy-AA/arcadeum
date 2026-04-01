import { CriticalState, CriticalPlayerState } from '../../critical/critical.state';
import { GameActionResult } from '../base/game-engine.interface';
import { executeScramble } from './critical-chaos.utils';
import { EngineHelpers } from './critical-chaos.utils';

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

function makeHelpers(): EngineHelpers {
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
