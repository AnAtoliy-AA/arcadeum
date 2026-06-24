import { CascadeEngine } from './cascade.engine';
import type { GameActionContext } from '../base/game-engine.interface';
import type { CascadeState } from './cascade.types';

const engine = new CascadeEngine();

function ctx(
  userId: string,
  overrides: Partial<GameActionContext> = {},
): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
    ...overrides,
  };
}

/**
 * Build a 3-player state where `playerId` is about to drop to one card by
 * playing the matching number card. Used by every test in this file.
 */
function setupOneCardLeft(playerId: string): CascadeState {
  let state = engine.initializeState(['a', 'b', 'c']);
  state = {
    ...state,
    topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
    activeColor: 'R',
    currentTurnIndex: 0,
  };
  const playerIdx = state.players.findIndex((p) => p.playerId === playerId);
  state.players[playerIdx].hand = [
    { id: 'play', color: 'R', kind: 'NUMBER', value: 2 },
    { id: 'remaining', color: 'B', kind: 'NUMBER', value: 7 },
  ];
  return state;
}

describe('CascadeEngine — Last-Card race (Cascade call)', () => {
  it('opens a window when a play drops the player to one card', () => {
    const state = setupOneCardLeft('a');
    const res = engine.executeAction(state, 'play_card', ctx('a'), {
      cardId: 'play',
    });
    expect(res.success).toBe(true);
    expect(res.state!.lastCardWindow).not.toBeNull();
    expect(res.state!.lastCardWindow!.playerId).toBe('a');
  });

  it('does NOT open a window when lastCardCallEnabled is false', () => {
    let state = engine.initializeState(['a', 'b', 'c'], {
      options: { lastCardCallEnabled: false },
    });
    state = {
      ...state,
      topCard: { id: 't', color: 'R', kind: 'NUMBER', value: 1 },
      activeColor: 'R',
      currentTurnIndex: 0,
    };
    state.players[0].hand = [
      { id: 'play', color: 'R', kind: 'NUMBER', value: 2 },
      { id: 'remaining', color: 'B', kind: 'NUMBER', value: 7 },
    ];
    const res = engine.executeAction(state, 'play_card', ctx('a'), {
      cardId: 'play',
    });
    expect(res.success).toBe(true);
    expect(res.state!.lastCardWindow).toBeNull();
  });

  it('self-call closes the window safely with no penalty', () => {
    const openState = engine.executeAction(
      setupOneCardLeft('a'),
      'play_card',
      ctx('a'),
      { cardId: 'play' },
    ).state!;
    const handBefore = openState.players[0].hand.length;
    const res = engine.executeAction(openState, 'call_cascade', ctx('a'));
    expect(res.success).toBe(true);
    expect(res.state!.lastCardWindow).toBeNull();
    expect(res.state!.players[0].hand.length).toBe(handBefore);
  });

  it('other-call penalises the at-risk player with 2 draw cards', () => {
    const openState = engine.executeAction(
      setupOneCardLeft('a'),
      'play_card',
      ctx('a'),
      { cardId: 'play' },
    ).state!;
    const handBefore = openState.players[0].hand.length;
    const res = engine.executeAction(openState, 'call_cascade', ctx('b'));
    expect(res.success).toBe(true);
    expect(res.state!.lastCardWindow).toBeNull();
    expect(res.state!.players[0].hand.length).toBe(handBefore + 2);
  });

  it('first call wins — a second call after window closed is rejected', () => {
    const openState = engine.executeAction(
      setupOneCardLeft('a'),
      'play_card',
      ctx('a'),
      { cardId: 'play' },
    ).state!;
    const firstCall = engine.executeAction(openState, 'call_cascade', ctx('a'));
    expect(firstCall.success).toBe(true);
    const secondCall = engine.executeAction(
      firstCall.state!,
      'call_cascade',
      ctx('b'),
    );
    expect(secondCall.success).toBe(false);
  });

  it('calledBy set after first call — second call on post-call state is rejected', () => {
    const openState = engine.executeAction(
      setupOneCardLeft('a'),
      'play_card',
      ctx('a'),
      { cardId: 'play' },
    ).state!;
    // b calls first
    const afterB = engine.executeAction(openState, 'call_cascade', ctx('b'));
    expect(afterB.success).toBe(true);
    expect(afterB.state!.lastCardWindow).toBeNull();
    // c calls on post-call state — rejected (window closed)
    const afterC = engine.executeAction(
      afterB.state!,
      'call_cascade',
      ctx('c'),
    );
    expect(afterC.success).toBe(false);
  });

  it('window auto-closes when the at-risk player takes their next turn (draws)', () => {
    const openState = engine.executeAction(
      setupOneCardLeft('a'),
      'play_card',
      ctx('a'),
      { cardId: 'play' },
    ).state!;
    let state = openState;
    state = engine.executeAction(state, 'draw', ctx('b')).state!;
    state = engine.executeAction(state, 'draw', ctx('c')).state!;
    expect(state.lastCardWindow).not.toBeNull();
    state = engine.executeAction(state, 'draw', ctx('a')).state!;
    expect(state.lastCardWindow).toBeNull();
  });

  it('available actions include call_cascade for every alive player while open', () => {
    const openState = engine.executeAction(
      setupOneCardLeft('a'),
      'play_card',
      ctx('a'),
      { cardId: 'play' },
    ).state!;
    expect(engine.getAvailableActions(openState, 'a')).toContain(
      'call_cascade',
    );
    expect(engine.getAvailableActions(openState, 'b')).toContain(
      'call_cascade',
    );
    expect(engine.getAvailableActions(openState, 'c')).toContain(
      'call_cascade',
    );
  });
});
