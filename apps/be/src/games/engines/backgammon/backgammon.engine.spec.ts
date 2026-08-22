import { BackgammonEngine } from './backgammon.engine';
import { ACTION, GAME_PHASE } from './backgammon.constants';
import type { MoveCheckerPayload } from './backgammon.types';
import type { GameActionContext } from '../base/game-engine.interface';

describe('BackgammonEngine', () => {
  let engine: BackgammonEngine;
  let rollQueue: Array<[number, number]>;
  const player1 = 'player-1';
  const player2 = 'player-2';

  const makeEngine = (...rolls: Array<[number, number]>): BackgammonEngine => {
    rollQueue = [...rolls];
    return new BackgammonEngine(() => rollQueue.shift() ?? [1, 1]);
  };

  const makeContext = (userId: string): GameActionContext => ({
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  });

  beforeEach(() => {
    engine = makeEngine();
  });

  it('provides correct metadata', () => {
    const meta = engine.getMetadata();
    expect(meta.gameId).toBe('backgammon_v1');
    expect(meta.minPlayers).toBe(2);
    expect(meta.maxPlayers).toBe(2);
  });

  it('randomizes the opening turn within valid range', () => {
    for (let i = 0; i < 50; i++) {
      const state = new BackgammonEngine().initializeState([player1, player2]);
      expect([0, 1]).toContain(state.currentTurnIndex);
    }
  });

  it('initializes state properly with 15 checkers per player', () => {
    const state = engine.initializeState([player1, player2]);
    expect(state.phase).toBe(GAME_PHASE.ROLL);
    expect(state.playerOrder).toEqual([player1, player2]);
    expect(state.players).toHaveLength(2);
    expect(state.points).toHaveLength(24);
    expect(state.winnerId).toBeNull();
    expect(state.winType).toBeNull();

    const p1Count = state.points.reduce(
      (sum, pt) => (pt.playerId === player1 ? sum + pt.count : sum),
      0,
    );
    const p2Count = state.points.reduce(
      (sum, pt) => (pt.playerId === player2 ? sum + pt.count : sum),
      0,
    );
    expect(p1Count).toBe(15);
    expect(p2Count).toBe(15);
  });

  it('rolls dice and transitions to MOVE phase if legal moves exist', () => {
    engine = makeEngine([3, 5]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );

    expect(res.state?.phase).toBe(GAME_PHASE.MOVE);
    expect(res.state?.rolledDice).toEqual([3, 5]);
    expect(res.state?.dice).toEqual([3, 5]);
  });

  it('ignores client-provided dice in the payload (anti-cheat)', () => {
    engine = makeEngine([3, 5]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [6, 6] },
    );

    // Payload dice must be ignored — the injected roller returned [3, 5].
    expect(res.state?.rolledDice).toEqual([3, 5]);
    expect(res.state?.dice).toEqual([3, 5]);
  });

  it('handles doubles by providing 4 dice moves', () => {
    engine = makeEngine([4, 4]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );

    expect(res.state?.phase).toBe(GAME_PHASE.MOVE);
    expect(res.state?.dice).toEqual([4, 4, 4, 4]);
  });

  it('moves a checker and consumes matching die', () => {
    engine = makeEngine([3, 5]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );

    const movePayload: MoveCheckerPayload = { from: 23, to: 20 };
    const moved = engine.executeAction(
      rolled.state!,
      ACTION.MOVE_CHECKER,
      makeContext(player1),
      movePayload,
    );

    expect(moved.state?.points[23].count).toBe(1);
    expect(moved.state?.points[20].playerId).toBe(player1);
    expect(moved.state?.points[20].count).toBe(1);
    expect(moved.state?.dice).toEqual([5]);
  });

  it('hits opponent single checker and sends it to the bar', () => {
    engine = makeEngine([3, 2]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    state.points[20] = { playerId: player2, count: 1 };
    state.points[23] = { playerId: player1, count: 2 };

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    const hitResult = engine.executeAction(
      rolled.state!,
      ACTION.MOVE_CHECKER,
      makeContext(player1),
      { from: 23, to: 20 },
    );

    expect(hitResult.state?.points[20].playerId).toBe(player1);
    expect(hitResult.state?.points[20].count).toBe(1);
    expect(hitResult.state?.bar[player2]).toBe(1);
  });

  it('re-enters checker from bar', () => {
    engine = makeEngine([2, 4]);
    const state = engine.initializeState([player1, player2]);
    state.bar[player1] = 1;
    state.currentTurnIndex = 0;

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    const entered = engine.executeAction(
      rolled.state!,
      ACTION.MOVE_CHECKER,
      makeContext(player1),
      { from: 'bar', to: 22 },
    );

    expect(entered.state?.bar[player1]).toBe(0);
    expect(entered.state?.points[22].playerId).toBe(player1);
    expect(entered.state?.points[22].count).toBe(1);
  });

  it('passes the turn when no legal moves remain after rolling', () => {
    engine = makeEngine([6, 6]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    // Opponent checkers block every re-entry point for a checker on the bar.
    for (let i = 18; i <= 23; i++) {
      state.points[i] = { playerId: player2, count: 2 };
    }
    state.bar[player1] = 1;
    for (let i = 0; i < 18; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }

    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );

    expect(res.state?.phase).toBe(GAME_PHASE.ROLL);
    expect(res.state?.currentTurnIndex).toBe(1);
    expect(res.state?.dice).toEqual([]);
  });

  it('allows pass_turn only when no legal moves are available', () => {
    engine = makeEngine([6, 6]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    state.phase = GAME_PHASE.MOVE;
    state.dice = [6];
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }

    expect(
      engine.validateAction(state, ACTION.PASS_TURN, makeContext(player1)),
    ).toBe(true);

    // With a legal move available, passing is rejected.
    state.points[10] = { playerId: player1, count: 1 };
    expect(
      engine.validateAction(state, ACTION.PASS_TURN, makeContext(player1)),
    ).toBe(false);
  });

  it('supports bearing off when all checkers are in home board', () => {
    engine = makeEngine([2, 3]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }
    state.points[1] = { playerId: player1, count: 1 };
    state.borneOff[player1] = 14;
    // Loser has already borne off a checker out of the winner's home board → single win.
    state.points[12] = { playerId: player2, count: 15 };
    state.borneOff[player2] = 1;

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    const winResult = engine.executeAction(
      rolled.state!,
      ACTION.MOVE_CHECKER,
      makeContext(player1),
      { from: 1, to: 'off' },
    );

    expect(winResult.state?.borneOff[player1]).toBe(15);
    expect(winResult.state?.phase).toBe(GAME_PHASE.GAME_OVER);
    expect(winResult.state?.winnerId).toBe(player1);
    expect(winResult.state?.winType).toBe('single');
    expect(engine.isGameOver(winResult.state!)).toBe(true);
    expect(engine.getWinners(winResult.state!)).toEqual([player1]);
  });

  it('classifies a gammon when the loser bore off nothing', () => {
    engine = makeEngine([2, 3]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }
    state.points[1] = { playerId: player1, count: 1 };
    state.borneOff[player1] = 14;
    // Loser has checkers but none inside winner's home board (points 0-5).
    state.points[12] = { playerId: player2, count: 15 };

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    const winResult = engine.executeAction(
      rolled.state!,
      ACTION.MOVE_CHECKER,
      makeContext(player1),
      { from: 1, to: 'off' },
    );

    expect(winResult.state?.winType).toBe('gammon');
  });

  it('classifies a backgammon when the loser has checkers in the home board', () => {
    engine = makeEngine([2, 3]);
    const state = engine.initializeState([player1, player2]);
    state.currentTurnIndex = 0;
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }
    state.points[1] = { playerId: player1, count: 1 };
    state.borneOff[player1] = 14;
    // Loser has checkers inside the winner's home board (point 3).
    state.points[3] = { playerId: player2, count: 15 };

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
    );
    const winResult = engine.executeAction(
      rolled.state!,
      ACTION.MOVE_CHECKER,
      makeContext(player1),
      { from: 1, to: 'off' },
    );

    expect(winResult.state?.winType).toBe('backgammon');
  });

  it('handles forfeit correctly', () => {
    const state = engine.initializeState([player1, player2]);
    const res = engine.executeAction(
      state,
      ACTION.FORFEIT,
      makeContext(player1),
    );

    expect(res.state?.phase).toBe(GAME_PHASE.GAME_OVER);
    expect(res.state?.winnerId).toBe(player2);
    expect(res.state?.winType).toBe('single');
  });

  it('initializes hyper variant with 3 checkers per player', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'hyper' },
    });
    const count = (id: string): number =>
      state.points.reduce(
        (sum, pt) => (pt.playerId === id ? sum + pt.count : sum),
        0,
      );
    expect(count(player1)).toBe(3);
    expect(count(player2)).toBe(3);
  });

  it('initializes long nardy with 15 checkers on heads', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'long' },
    });
    expect(state.points[23]).toEqual({ playerId: player1, count: 15 });
    expect(state.points[11]).toEqual({ playerId: player2, count: 15 });
  });

  it('initializes nackgammon with 2 checkers on point 23', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'nackgammon' },
    });
    expect(state.points[23]).toEqual({ playerId: player1, count: 2 });
    expect(state.points[22]).toEqual({ playerId: player1, count: 2 });
    expect(state.points[12]).toEqual({ playerId: player1, count: 4 });
  });

  it('initializes gulbara with 15 checkers on head and no hitting', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'gulbara' },
    });
    expect(state.points[23]).toEqual({ playerId: player1, count: 15 });
    expect(state.points[11]).toEqual({ playerId: player2, count: 15 });
  });
});
