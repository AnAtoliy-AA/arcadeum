import { CriticalBotService } from './critical-bot.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';

function buildBot() {
  const criticalService = {
    completeSession: jest.fn().mockResolvedValue(undefined),
    playActionByRoom: jest.fn().mockResolvedValue({}),
    playNopeByRoom: jest.fn().mockResolvedValue({}),
    drawCardByRoom: jest.fn().mockResolvedValue({}),
  };
  const bot = new CriticalBotService(
    criticalService as unknown as ConstructorParameters<
      typeof CriticalBotService
    >[0],
  );
  return { bot, criticalService };
}

function session(options?: Record<string, unknown>): GameSessionSummary {
  return {
    id: 's-1',
    roomId: 'r-1',
    gameId: 'critical_v1',
    engine: 'critical_v1',
    status: 'active',
    state: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...(options === undefined ? {} : { options }),
  };
}

function botOnlyState() {
  return {
    players: [
      { playerId: 'bot-1', alive: true, hand: ['strike'] },
      { playerId: 'bot-2', alive: true, hand: [] },
    ],
    playerOrder: ['bot-1', 'bot-2'],
    currentTurnIndex: 0,
    deck: [],
  };
}

describe('CriticalBotService', () => {
  it('plays exactly one action when triggers race (single-flight lock)', async () => {
    const { bot, criticalService } = buildBot();
    const s = session({ aiVsAi: true, aiMoveDelayMs: 5 });
    (s as { state: unknown }).state = botOnlyState();

    await Promise.all([bot.checkAndPlay(s), bot.checkAndPlay(s)]);

    expect(criticalService.playActionByRoom).toHaveBeenCalledTimes(1);
  });

  it('keeps playing in an AI-vs-AI match without humans', async () => {
    const { bot, criticalService } = buildBot();
    const s = session({ aiVsAi: true, aiMoveDelayMs: 5 });
    (s as { state: unknown }).state = botOnlyState();

    await bot.checkAndPlay(s);

    expect(criticalService.completeSession).not.toHaveBeenCalled();
    expect(criticalService.playActionByRoom).toHaveBeenCalledTimes(1);
  });

  it('completes the session when no humans remain and it is not AI-vs-AI', async () => {
    const { bot, criticalService } = buildBot();
    const s = session();
    (s as { state: unknown }).state = botOnlyState();

    await bot.checkAndPlay(s);

    expect(criticalService.completeSession).toHaveBeenCalledWith('s-1', 'r-1');
    expect(criticalService.playActionByRoom).not.toHaveBeenCalled();
  });
});
