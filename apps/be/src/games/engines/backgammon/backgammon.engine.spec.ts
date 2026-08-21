import { BackgammonEngine } from './backgammon.engine';
import { ACTION, GAME_PHASE } from './backgammon.constants';
import type { MoveCheckerPayload } from './backgammon.types';
import type { GameActionContext } from '../base/game-engine.interface';

describe('BackgammonEngine', () => {
  let engine: BackgammonEngine;
  const player1 = 'player-1';
  const player2 = 'player-2';

  const makeContext = (userId: string): GameActionContext => ({
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  });

  beforeEach(() => {
    engine = new BackgammonEngine();
  });

  it('provides correct metadata', () => {
    const meta = engine.getMetadata();
    expect(meta.gameId).toBe('backgammon_v1');
    expect(meta.minPlayers).toBe(2);
    expect(meta.maxPlayers).toBe(2);
  });

  it('initializes state properly with 15 checkers per player', () => {
    const state = engine.initializeState([player1, player2]);
    expect(state.phase).toBe(GAME_PHASE.ROLL);
    expect(state.playerOrder).toEqual([player1, player2]);
    expect(state.players).toHaveLength(2);
    expect(state.points).toHaveLength(24);
    expect(state.bar[player1]).toBe(0);
    expect(state.bar[player2]).toBe(0);
    expect(state.borneOff[player1]).toBe(0);
    expect(state.borneOff[player2]).toBe(0);
    expect(state.winnerId).toBeNull();

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
    const state = engine.initializeState([player1, player2]);
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [3, 5] },
    );

    expect(res.state?.phase).toBe(GAME_PHASE.MOVE);
    expect(res.state?.rolledDice).toEqual([3, 5]);
    expect(res.state?.dice).toEqual([3, 5]);
  });

  it('handles doubles by providing 4 dice moves', () => {
    const state = engine.initializeState([player1, player2]);
    const res = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [4, 4] },
    );

    expect(res.state?.phase).toBe(GAME_PHASE.MOVE);
    expect(res.state?.dice).toEqual([4, 4, 4, 4]);
  });

  it('moves a checker and consumes matching die', () => {
    const state = engine.initializeState([player1, player2]);
    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [3, 5] },
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
    const state = engine.initializeState([player1, player2]);
    state.points[20] = { playerId: player2, count: 1 };
    state.points[23] = { playerId: player1, count: 2 };

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [3, 2] },
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
    const state = engine.initializeState([player1, player2]);
    state.bar[player1] = 1;
    state.currentTurnIndex = 0;

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [2, 4] },
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

  it('supports bearing off when all checkers are in home board', () => {
    const state = engine.initializeState([player1, player2]);
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }
    state.points[1] = { playerId: player1, count: 1 };
    state.borneOff[player1] = 14;

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(player1),
      { dice: [2, 3] },
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
    expect(engine.isGameOver(winResult.state!)).toBe(true);
    expect(engine.getWinners(winResult.state!)).toEqual([player1]);
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
  });

  it('initializes hyper variant with 3 checkers per player', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'hyper' },
    });
    const p1Count = state.points.reduce(
      (sum, pt) => (pt.playerId === player1 ? sum + pt.count : sum),
      0,
    );
    const p2Count = state.points.reduce(
      (sum, pt) => (pt.playerId === player2 ? sum + pt.count : sum),
      0,
    );
    expect(p1Count).toBe(3);
    expect(p2Count).toBe(3);
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
    const p1Total = state.points.reduce(
      (sum, pt) => (pt.playerId === player1 ? sum + pt.count : sum),
      0,
    );
    expect(p1Total).toBe(15);
  });

  it('initializes gulbara with 15 checkers on head and no hitting', () => {
    const state = engine.initializeState([player1, player2], {
      options: { ruleVariant: 'gulbara' },
    });
    expect(state.points[23]).toEqual({ playerId: player1, count: 15 });
    expect(state.points[11]).toEqual({ playerId: player2, count: 15 });
  });
});
