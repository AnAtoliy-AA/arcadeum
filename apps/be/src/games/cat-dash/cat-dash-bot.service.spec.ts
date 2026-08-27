import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { CatDashBotService } from './cat-dash-bot.service';

function buildBot() {
  const catDashService = {
    completeSession: jest.fn().mockResolvedValue(undefined),
    rollDice: jest.fn().mockResolvedValue({}),
  };
  const bot = new CatDashBotService(
    catDashService as unknown as ConstructorParameters<
      typeof CatDashBotService
    >[0],
  );
  return { bot, catDashService };
}

function session(options?: Record<string, unknown>): GameSessionSummary {
  return {
    id: 's-1',
    roomId: 'r-1',
    gameId: 'cat_dash_v1',
    engine: 'cat_dash_v1',
    status: 'active',
    state: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...(options === undefined ? {} : { options }),
  };
}

function botOnlyState(currentPlayerIndex = 0) {
  return {
    gameOver: false,
    players: [{ playerId: 'bot-a' }, { playerId: 'bot-b' }],
    currentPlayerIndex,
  };
}

describe('CatDashBotService', () => {
  it('keeps bot-only games alive in AI-vs-AI mode', async () => {
    const { bot, catDashService } = buildBot();
    const s = session({ aiVsAi: true, aiMoveDelayMs: 5 });
    (s as { state: unknown }).state = botOnlyState();

    await bot.checkAndPlay(s);

    expect(catDashService.completeSession).not.toHaveBeenCalled();
    expect(catDashService.rollDice).toHaveBeenCalledWith('bot-a', 'r-1');
  });

  it('completes bot-only sessions when not in AI-vs-AI mode', async () => {
    const { bot, catDashService } = buildBot();
    const s = session();
    (s as { state: unknown }).state = botOnlyState();

    await bot.checkAndPlay(s);

    expect(catDashService.completeSession).toHaveBeenCalledWith('s-1', 'r-1');
    expect(catDashService.rollDice).not.toHaveBeenCalled();
  });

  it('skips when the current player is human', async () => {
    const { bot, catDashService } = buildBot();
    const s = session({ aiVsAi: true, aiMoveDelayMs: 5 });
    (s as { state: unknown }).state = {
      ...botOnlyState(),
      players: [{ playerId: 'user-1' }, { playerId: 'bot-b' }],
    };

    await bot.checkAndPlay(s);

    expect(catDashService.rollDice).not.toHaveBeenCalled();
  });
});
