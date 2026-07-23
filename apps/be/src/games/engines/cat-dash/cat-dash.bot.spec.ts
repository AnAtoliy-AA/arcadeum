import { CatDashEngine } from './cat-dash.engine';
import type { CatDashState, CatDashPlayer } from './cat-dash.types';

function makeState(
  overrides: Partial<CatDashState> & { players: CatDashPlayer[] },
): CatDashState {
  return {
    trackType: 'linear',
    theme: 'village',
    currentPlayerIndex: 0,
    turnNumber: 1,
    track: Array.from({ length: 21 }, (_, i) => ({
      id: i,
      type:
        i === 0 || i === 20
          ? 'normal'
          : i % 5 === 0
            ? 'obstacle'
            : i % 3 === 0
              ? 'bonus'
              : 'normal',
    })),
    gameOver: false,
    winner: undefined,
    logs: [],
    ...overrides,
  };
}

describe('CatDashBotService', () => {
  const engine = new CatDashEngine();

  it('bot can always roll dice when it is their turn', () => {
    const botId = 'bot-abc123';
    const state = makeState({
      players: [
        {
          playerId: botId,
          catId: 'neon',
          position: 5,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
        {
          playerId: 'p1',
          catId: 'whiskers',
          position: 3,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
      ],
      currentPlayerIndex: 0,
    });

    const actions = engine.getAvailableActions(state, botId);
    expect(actions).toContain('rollDice');
  });

  it('bot has no available actions when not their turn', () => {
    const botId = 'bot-abc123';
    const state = makeState({
      players: [
        {
          playerId: 'p1',
          catId: 'whiskers',
          position: 3,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
        {
          playerId: botId,
          catId: 'neon',
          position: 5,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
      ],
      currentPlayerIndex: 0,
    });

    const actions = engine.getAvailableActions(state, botId);
    expect(actions).toEqual([]);
  });

  it('bot rollDice moves the bot forward', () => {
    const botId = 'bot-abc123';
    const state = makeState({
      players: [
        {
          playerId: botId,
          catId: 'neon',
          position: 5,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
        {
          playerId: 'p1',
          catId: 'whiskers',
          position: 3,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
      ],
      currentPlayerIndex: 0,
    });

    const result = engine.executeAction(state, 'rollDice', {
      userId: botId,
      roomId: 'room-1',
      sessionId: 'session-1',
      timestamp: new Date(),
    });

    expect(result.success).toBe(true);
    if (result.state) {
      const bot = result.state.players.find((p) => p.playerId === botId)!;
      expect(bot.position).toBeGreaterThan(5);
    }
  });

  it('bot can use ability when available', () => {
    const botId = 'bot-abc123';
    const state = makeState({
      players: [
        {
          playerId: botId,
          catId: 'neon',
          position: 5,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
        {
          playerId: 'p1',
          catId: 'whiskers',
          position: 3,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
      ],
      currentPlayerIndex: 0,
    });

    const actions = engine.getAvailableActions(state, botId);
    expect(actions).toContain('useAbility');
  });

  it('bot cannot use ability when no power tokens', () => {
    const botId = 'bot-abc123';
    const state = makeState({
      players: [
        {
          playerId: botId,
          catId: 'neon',
          position: 5,
          powerTokens: 0,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
        {
          playerId: 'p1',
          catId: 'whiskers',
          position: 3,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
      ],
      currentPlayerIndex: 0,
    });

    const actions = engine.getAvailableActions(state, botId);
    expect(actions).not.toContain('useAbility');
  });

  it('bot has no actions when game is over', () => {
    const botId = 'bot-abc123';
    const state = makeState({
      players: [
        {
          playerId: botId,
          catId: 'neon',
          position: 20,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
        {
          playerId: 'p1',
          catId: 'whiskers',
          position: 3,
          powerTokens: 3,
          abilitiesUsed: [],
          isReady: true,
          hasBonus: false,
        },
      ],
      currentPlayerIndex: 0,
      gameOver: true,
      winner: botId,
    });

    const actions = engine.getAvailableActions(state, botId);
    expect(actions).toEqual([]);
  });
});
