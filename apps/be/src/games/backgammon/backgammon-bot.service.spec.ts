import { BackgammonBotService } from './backgammon-bot.service';
import { BackgammonEngine } from '../engines/backgammon/backgammon.engine';
import { ACTION } from '../engines/backgammon/backgammon.constants';
import type { GameActionContext } from '../engines/base/game-engine.interface';

describe('BackgammonBotService', () => {
  let botService: BackgammonBotService;
  let engine: BackgammonEngine;
  const humanId = 'user-1';
  const botId = 'bot-1';

  const makeContext = (userId: string): GameActionContext => ({
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  });

  beforeEach(() => {
    botService = new BackgammonBotService({} as never);
    engine = new BackgammonEngine();
  });

  it('identifies bot userIds properly', () => {
    expect(botService.isBot('bot-123')).toBe(true);
    expect(botService.isBot('user-456')).toBe(false);
  });

  it('picks a valid move from rolled dice', () => {
    const state = engine.initializeState([botId, humanId]);
    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(botId),
      { dice: [3, 5] },
    );

    const move = botService.pickMove(rolled.state!, botId);
    expect(move).not.toBeNull();
    expect(typeof move?.from === 'number' || move?.from === 'bar').toBe(true);
  });

  it('prioritizes hitting opponent blot when available', () => {
    const state = engine.initializeState([botId, humanId]);
    state.points[20] = { playerId: humanId, count: 1 };
    state.points[23] = { playerId: botId, count: 2 };

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(botId),
      { dice: [3, 1] },
    );

    const move = botService.pickMove(rolled.state!, botId);
    expect(move).toEqual({ from: 23, to: 20 });
  });

  it('prioritizes bearing off when home board is clear', () => {
    const state = engine.initializeState([botId, humanId]);
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }
    state.points[2] = { playerId: botId, count: 2 };
    state.borneOff[botId] = 13;

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(botId),
      { dice: [3, 4] },
    );

    const move = botService.pickMove(rolled.state!, botId);
    expect(move).toEqual({ from: 2, to: 'off' });
  });
});
