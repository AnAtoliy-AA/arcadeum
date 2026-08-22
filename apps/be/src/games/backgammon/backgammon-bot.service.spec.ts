import { BackgammonBotService } from './backgammon-bot.service';
import { BackgammonEngine } from '../engines/backgammon/backgammon.engine';
import { ACTION } from '../engines/backgammon/backgammon.constants';
import type { GameActionContext } from '../engines/base/game-engine.interface';

describe('BackgammonBotService', () => {
  let botService: BackgammonBotService;
  const humanId = 'user-1';
  const botId = 'bot-1';

  const makeContext = (userId: string): GameActionContext => ({
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  });

  const makeEngine = (...rolls: Array<[number, number]>): BackgammonEngine => {
    const queue = [...rolls];
    return new BackgammonEngine(() => queue.shift() ?? [1, 1]);
  };

  beforeEach(() => {
    botService = new BackgammonBotService({} as never);
  });

  it('identifies bot userIds properly', () => {
    expect(botService.isBot('bot-123')).toBe(true);
    expect(botService.isBot('user-456')).toBe(false);
  });

  it('picks a valid move from rolled dice', () => {
    const engine = makeEngine([3, 5]);
    const state = engine.initializeState([botId, humanId]);
    state.currentTurnIndex = 0;
    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(botId),
    );

    const move = botService.pickMove(rolled.state!, botId);
    expect(move).not.toBeNull();
    expect(typeof move?.from === 'number' || move?.from === 'bar').toBe(true);
  });

  it('prioritizes hitting opponent blot when available', () => {
    const engine = makeEngine([3, 1]);
    const state = engine.initializeState([botId, humanId]);
    state.currentTurnIndex = 0;
    state.points[20] = { playerId: humanId, count: 1 };
    state.points[23] = { playerId: botId, count: 2 };

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(botId),
    );

    const move = botService.pickMove(rolled.state!, botId);
    expect(move).toEqual({ from: 23, to: 20 });
  });

  it('prioritizes bearing off when home board is clear', () => {
    const engine = makeEngine([3, 4]);
    const state = engine.initializeState([botId, humanId]);
    state.currentTurnIndex = 0;
    for (let i = 0; i < 24; i++) {
      state.points[i] = { playerId: null, count: 0 };
    }
    state.points[2] = { playerId: botId, count: 2 };
    state.borneOff[botId] = 13;

    const rolled = engine.executeAction(
      state,
      ACTION.ROLL_DICE,
      makeContext(botId),
    );

    const move = botService.pickMove(rolled.state!, botId);
    expect(move).toEqual({ from: 2, to: 'off' });
  });
});
