import { PachisiEngine } from './pachisi.engine';
import { ACTION, GAME_PHASE } from './pachisi.constants';
import type { GameActionContext } from '../base/game-engine.interface';

describe('PachisiEngine', () => {
  let engine: PachisiEngine;
  let rollQueue: number[];
  const player1 = 'player-1';
  const player2 = 'player-2';

  const makeEngine = (...rolls: number[]): PachisiEngine => {
    rollQueue = [...rolls];
    return new PachisiEngine(() => rollQueue.shift() ?? 1);
  };

  const makeContext = (userId: string): GameActionContext => ({
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  });

  /** Force a roll for the current player and return the resulting state. */
  const roll = (
    state: ReturnType<PachisiEngine['initializeState']>,
    die: number,
  ) => {
    engine = makeEngine(die);
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(state.playerOrder[state.currentTurnIndex]),
    );
    expect(res.success).toBe(true);
    return res.state!;
  };

  beforeEach(() => {
    engine = makeEngine();
  });

  it('provides correct metadata', () => {
    const meta = engine.getMetadata();
    expect(meta.gameId).toBe('pachisi_v1');
    expect(meta.minPlayers).toBe(2);
    expect(meta.maxPlayers).toBe(4);
  });

  it('assigns opposite seats in a two-player match', () => {
    const state = engine.initializeState([player1, player2]);
    expect(state.seats[player1]).toBe(0);
    expect(state.seats[player2]).toBe(2);
    expect(state.tokens[player1]).toHaveLength(4);
    expect(state.tokens[player2]).toHaveLength(4);
  });

  it('supports the quick variant with 2 tokens', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'quick' },
    });
    expect(state.tokens[player1]).toHaveLength(2);
    expect(state.options.ruleVariant).toBe('quick');
  });

  it('rejects invalid config ruleVariant', () => {
    expect(engine.validateConfig({ options: { ruleVariant: 'bogus' } })).toBe(
      false,
    );
    expect(engine.validateConfig({ options: { ruleVariant: 'quick' } })).toBe(
      true,
    );
  });

  it('rolls a die and transitions to MOVE when legal moves exist', () => {
    // All tokens are in the yard; only a 6 produces a legal move.
    engine = makeEngine(6);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    const ctx = makeContext(player1);
    const res = engine.executeAction(state, ACTION.ROLL_DICE, ctx);

    expect(res.state?.phase).toBe(GAME_PHASE.MOVE);
    expect(res.state?.die).toBe(6);
    expect(res.state?.currentTurnIndex).toBe(0);
  });

  it('passes the turn when a non-six is rolled from an all-yard start', () => {
    engine = makeEngine(3);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );

    expect(res.state?.phase).toBe(GAME_PHASE.ROLL);
    expect(res.state?.die).toBeNull();
    expect(res.state?.currentTurnIndex).toBe(1);
  });

  it('ignores client-provided dice in the payload (anti-cheat)', () => {
    engine = makeEngine(4);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    // A token on the board makes the rolled 4 playable.
    state.tokens[player1][0].progress = 10;
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { die: 6 },
    );

    expect(res.state?.die).toBe(4);
    expect(res.state?.phase).toBe(GAME_PHASE.MOVE);
  });

  it('requires a 6 to leave the yard and grants an extra roll on six', () => {
    engine = makeEngine(6);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;

    // Non-6 move attempt is rejected.
    expect(
      engine.validateAction(state, ACTION.MOVE_TOKEN, makeContext(player1), {
        tokenId: 0,
      }),
    ).toBe(false);

    const afterRoll = roll(state, 6);
    expect(afterRoll.phase).toBe(GAME_PHASE.MOVE);
    expect(afterRoll.consecutiveSixes).toBe(1);

    // Exit the yard with token 0.
    const moved = engine.executeAction(
      afterRoll,
      ACTION.MOVE_TOKEN,
      makeContext(player1),
      { tokenId: 0 },
    );
    expect(moved.success).toBe(true);
    expect(moved.state?.tokens[player1][0].progress).toBe(0);

    // Extra roll: same player stays on the clock in ROLL phase.
    expect(moved.state?.phase).toBe(GAME_PHASE.ROLL);
    expect(moved.state?.currentTurnIndex).toBe(0);
    expect(moved.state?.die).toBeNull();
  });

  it('voids the turn after three consecutive sixes', () => {
    engine = makeEngine(6, 6, 6);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;

    const r1 = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    expect(r1.state?.consecutiveSixes).toBe(1);

    // Move out of the yard (extra-roll loop keeps same player).
    const m1 = engine.executeAction(
      r1.state!,
      ACTION.MOVE_TOKEN,
      makeContext(player1),
      { tokenId: 0 },
    );
    expect(m1.state?.currentTurnIndex).toBe(0);

    const r2 = engine.executeAction(
      m1.state!,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    expect(r2.state!.consecutiveSixes).toBe(2);

    const m2 = engine.executeAction(
      r2.state!,
      ACTION.MOVE_TOKEN,
      makeContext(player1),
      { tokenId: 1 },
    );

    const r3 = engine.executeAction(
      m2.state!,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    // Third six voids the turn immediately: counters reset, turn advances.
    expect(r3.state?.phase).toBe(GAME_PHASE.ROLL);
    expect(r3.state?.currentTurnIndex).toBe(1);
    expect(r3.state?.die).toBeNull();
    expect(r3.state?.logs.some((l) => l.message.includes('Three sixes'))).toBe(
      true,
    );
  });

  it('captures an opponent token landing on the same track cell', () => {
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    // Seat plan: p1 seat 0 (start 0), p2 seat 2 (start 26).
    // Put p1 token just behind cell 30 and p2 token on cell 30.
    state.tokens[player1][0].progress = 29; // abs 29
    state.tokens[player2][0].progress = 4; // abs (26+4)%52 = 30
    state.die = null;
    state.phase = GAME_PHASE.ROLL;

    const afterRoll = roll({ ...state }, 1);
    // p1 token at 29 + 1 → abs 30 where p2 sits → capture.
    expect(afterRoll.phase).toBe(GAME_PHASE.MOVE);

    const moved = engine.executeAction(
      afterRoll,
      ACTION.MOVE_TOKEN,
      makeContext(player1),
      { tokenId: 0 },
    );
    expect(moved.success).toBe(true);
    expect(moved.state?.tokens[player1][0].progress).toBe(30);
    expect(moved.state?.tokens[player2][0].progress).toBe(-1);
  });

  it('does not capture on star cells or own start cells', () => {
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    // Star cell 8: reachable by p1 at progress 8.
    state.tokens[player1][0].progress = 7;
    // p2 (seat 2, start 26) token travels to abs cell 8 at progress 34.
    state.tokens[player2][0].progress = 34;
    state.phase = GAME_PHASE.ROLL;

    const afterRoll = roll({ ...state }, 1);
    const moved = engine.executeAction(
      afterRoll,
      ACTION.MOVE_TOKEN,
      makeContext(player1),
      { tokenId: 0 },
    );
    expect(moved.success).toBe(true);
    // Token coexists on the protected star cell — not sent home.
    expect(moved.state?.tokens[player2][0].progress).toBe(34);
  });

  it('rejects overshooting the exact finish', () => {
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    state.tokens[player1][0].progress = 55; // one step from home
    state.phase = GAME_PHASE.ROLL;

    engine = makeEngine(3);
    const afterRoll = engine.executeAction(
      { ...state },
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    // Only legal moves survive: other yard tokens need a six, so no moves.
    expect(afterRoll.state?.phase).toBe(GAME_PHASE.ROLL);
    expect(afterRoll.state?.currentTurnIndex).toBe(1);
  });

  it('finishes exactly on 56 and wins the game', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'quick' },
    });
    state.currentTurnIndex = 0;
    // quick mode: tokens [0, 1]; put both near the end.
    state.tokens[player1][0].progress = 56;
    state.tokens[player1][1].progress = 53;
    state.phase = GAME_PHASE.ROLL;

    engine = makeEngine(3);
    const afterRoll = engine.executeAction(
      { ...state },
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    const moved = engine.executeAction(
      afterRoll.state!,
      ACTION.MOVE_TOKEN,
      makeContext(player1),
      { tokenId: 1 },
    );
    expect(moved.state?.phase).toBe(GAME_PHASE.GAME_OVER);
    expect(moved.state?.winnerId).toBe(player1);
    expect(engine.getWinners(moved.state!)).toEqual([player1]);
    expect(engine.isGameOver(moved.state!)).toBe(true);
  });

  it('forfeit awards the win to the remaining player', () => {
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 1;
    const res = engine.executeAction(
      state,
      ACTION.FORFEIT,
      makeContext(player1),
    );
    expect(res.state?.phase).toBe(GAME_PHASE.GAME_OVER);
    expect(res.state?.winnerId).toBe(player2);
  });

  it('forfeit in a 3-player match awards all remaining players', () => {
    const player3 = 'player-3';
    const state = engine.initializeState([player1, player2, player3]);
    state.currentTurnIndex = 1;
    const res = engine.executeAction(
      state,
      ACTION.FORFEIT,
      makeContext(player1),
    );
    expect(res.state?.phase).toBe(GAME_PHASE.GAME_OVER);
    expect(res.state?.winnerIds).toEqual([player2, player3]);
    expect(res.state?.winnerId).toBe(player2);
    expect(engine.getWinners(res.state!)).toEqual([player2, player3]);
  });

  it('blocks actions from non-current players', () => {
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    expect(
      engine.validateAction(state, ACTION.ROLL_DICE, makeContext(player2)),
    ).toBe(false);
    expect(
      engine.validateAction(state, ACTION.FORFEIT, makeContext(player2)),
    ).toBe(true);
  });

  it('exposes available actions per phase', () => {
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    expect(engine.getAvailableActions(state, player1)).toContain(
      ACTION.ROLL_DICE,
    );
    expect(engine.getAvailableActions(state, player2)).toEqual([
      ACTION.FORFEIT,
    ]);
  });
});
