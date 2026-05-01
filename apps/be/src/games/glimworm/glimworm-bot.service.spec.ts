import { GlimwormBotService } from './glimworm-bot.service';
import { GLIMWORM_BASE_SPEED } from './glimworm.constants';
import type { GlimwormSession, Worm } from './glimworm.types';

const makeWorm = (overrides: Partial<Worm> = {}): Worm => ({
  id: 'a',
  color: '#fff',
  segments: [{ x: 1000, y: 1000 }],
  heading: 0,
  speed: GLIMWORM_BASE_SPEED,
  alive: true,
  livesLeft: 1,
  score: 0,
  ready: true,
  activePowerup: null,
  inventoryPowerup: null,
  ...overrides,
});

const makeSession = (worms: Worm[]): GlimwormSession => ({
  roomId: 'r1',
  hostUserId: 'u1',
  variant: 'time_attack',
  powerupsEnabled: false,
  status: 'playing',
  startedAt: 0,
  endsAt: null,
  arena: { width: 2000, height: 2000 },
  worms: Object.fromEntries(worms.map((w) => [w.id, w])),
  food: [],
  powerups: [],
  winner: null,
  tickNum: 0,
  lastInputAt: {},
  lastPowerupSpawnAt: 0,
  damageTickAt: {},
});

describe('GlimwormBotService', () => {
  const service = new GlimwormBotService();

  it('picks angle toward nearest food when no obstacles', () => {
    const bot = makeWorm({ id: 'bot-1', segments: [{ x: 1000, y: 1000 }] });
    const s = makeSession([bot]);
    s.food.push({ id: 'f1', pos: { x: 1500, y: 1000 }, value: 1 });
    const angle = service.pickAngle(s, bot);
    expect(Math.abs(angle)).toBeLessThan(0.01);
  });

  it('biases away from a near wall (left) even if food is past the wall', () => {
    const bot = makeWorm({ id: 'bot-1', segments: [{ x: 50, y: 1000 }] });
    const s = makeSession([bot]);
    s.food.push({ id: 'f1', pos: { x: 10, y: 1000 }, value: 1 });
    const angle = service.pickAngle(s, bot);
    expect(Math.cos(angle)).toBeGreaterThan(0);
  });

  it('avoids a very close trail blocking the food path', () => {
    const bot = makeWorm({ id: 'bot-1', segments: [{ x: 1000, y: 1000 }] });
    const other = makeWorm({
      id: 'other',
      segments: [{ x: 1010, y: 1000 }],
    });
    const s = makeSession([bot, other]);
    s.food.push({ id: 'f1', pos: { x: 1500, y: 1000 }, value: 1 });
    const angle = service.pickAngle(s, bot);
    expect(Math.cos(angle)).toBeLessThan(0.5);
  });

  it('returns current heading when nothing influences the bot', () => {
    const bot = makeWorm({
      id: 'bot-1',
      segments: [{ x: 1000, y: 1000 }],
      heading: 1.234,
    });
    const s = makeSession([bot]);
    expect(service.pickAngle(s, bot)).toBe(1.234);
  });

  it('returns current heading when bot has no segments', () => {
    const bot = makeWorm({ id: 'bot-1', segments: [], heading: 0.5 });
    const s = makeSession([bot]);
    expect(service.pickAngle(s, bot)).toBe(0.5);
  });
});
