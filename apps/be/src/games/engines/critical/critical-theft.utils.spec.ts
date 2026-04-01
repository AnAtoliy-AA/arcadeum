import { CriticalState, CriticalPlayerState } from '../../critical/critical.state';
import { EngineHelpers } from './critical-theft.utils';
import { executeSwapHands } from './critical-theft.utils';

function makePlayer(
  playerId: string,
  hand: string[],
  alive = true,
): CriticalPlayerState {
  return {
    playerId,
    hand: hand as CriticalPlayerState['hand'],
    alive,
    score: 0,
    stash: [],
    markedCards: [],
  } as unknown as CriticalPlayerState;
}

function makeState(players: CriticalPlayerState[]): CriticalState {
  return {
    players,
    deck: [],
    discardPile: [],
    playerOrder: players.map((p) => p.playerId),
    currentTurnIndex: 0,
    pendingDraws: 1,
    pendingAction: null,
    pendingFavor: null,
    pendingDefuse: null,
    pendingAlter: null,
    logs: [],
    allowActionCardCombos: false,
  } as unknown as CriticalState;
}

const helpers: EngineHelpers = {
  addLog: () => undefined,
  createLogEntry: (_type, message) =>
    ({ type: _type, message }) as ReturnType<EngineHelpers['createLogEntry']>,
  advanceTurn: () => undefined,
  shuffleArray: () => undefined,
  findPlayer: (state, id) => state.players.find((p) => p.playerId === id),
};

describe('executeSwapHands', () => {
  it('basic swap — swaps player hands and sets pendingAction', () => {
    // Simulate state AFTER dispatcher's playCard() has already removed swap_hands
    // (dispatcher calls playCard() before executeSwapHands)
    const playerA = makePlayer('playerA', ['mark', 'steal_draw']);
    const playerB = makePlayer('playerB', ['evade', 'strike', 'reorder']);
    const state = makeState([playerA, playerB]);
    state.discardPile = ['swap_hands']; // already discarded by dispatcher

    const result = executeSwapHands(state, 'playerA', 'playerB', helpers);

    expect(result.success).toBe(true);

    const stateA = state.players.find((p) => p.playerId === 'playerA')!;
    const stateB = state.players.find((p) => p.playerId === 'playerB')!;

    // After swap, playerA should have B's original hand
    expect(stateA.hand).toEqual(['evade', 'strike', 'reorder']);
    // playerB should have A's original hand (minus swap_hands already removed by dispatcher)
    expect(stateB.hand).toEqual(['mark', 'steal_draw']);

    // pendingAction should be set
    expect(state.pendingAction).toMatchObject({
      type: 'swap_hands',
      playerId: 'playerA',
      payload: { targetPlayerId: 'playerB' },
      nopeCount: 0,
    });
  });

  it('fails if target is dead', () => {
    const playerA = makePlayer('playerA', ['swap_hands', 'mark']);
    const playerB = makePlayer('playerB', ['evade', 'strike'], false);
    const state = makeState([playerA, playerB]);

    const result = executeSwapHands(state, 'playerA', 'playerB', helpers);

    expect(result.success).toBe(false);
  });

  it('fails if no target player found', () => {
    const playerA = makePlayer('playerA', ['swap_hands', 'mark']);
    const state = makeState([playerA]);

    const result = executeSwapHands(state, 'playerA', 'nonexistent', helpers);

    expect(result.success).toBe(false);
  });
});
