import { Rotation } from './rotation';
import { GAMES, validateGames } from './games';
import type { GameConfig } from './types';

const seeded = (start: number) => {
  let seed = start;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const mk = (over: Partial<GameConfig>): GameConfig => ({
  id: 'x',
  title: 'X',
  maxDurationMs: 1,
  stuckMs: 1,
  moveDelayMs: 2000,
  themes: ['a'],
  weight: 1,
  personalities: null,
  ...over,
});

describe('games config', () => {
  it('covers the 12 AI-vs-AI games and excludes unsupported ones', () => {
    expect(GAMES).toHaveLength(12);
    const ids = GAMES.map((g) => g.id);
    expect(ids).not.toContain('texas_holdem_v1');
    expect(ids).not.toContain('glimworm_v1');
    expect(validateGames(GAMES)).toEqual([]);
    expect(GAMES.every((g) => g.moveDelayMs === 2000)).toBe(true);
  });

  it('rejects excluded, bad delay and duplicates', () => {
    const p = validateGames([
      mk({ id: 'glimworm_v1' }),
      mk({ id: 'chess_v1', moveDelayMs: 100 }),
      mk({ id: 'chess_v1' }),
    ]).join('|');
    expect(p).toMatch(/not supported/);
    expect(p).toMatch(/moveDelayMs/);
    expect(p).toMatch(/duplicate/);
  });
});

describe('Rotation', () => {
  it('never plays the same game back to back, across many bags', () => {
    const r = new Rotation(GAMES, seeded(7));
    let prev: string | null = null;
    for (let i = 0; i < 500; i++) {
      const { game } = r.next();
      expect(game.id).not.toBe(prev);
      prev = game.id;
    }
  });

  it('plays every game once per cycle', () => {
    const r = new Rotation(GAMES, seeded(3));
    const seen = new Set<string>();
    for (let i = 0; i < GAMES.length; i++) seen.add(r.next().game.id);
    expect(seen.size).toBe(GAMES.length);
  });

  it('rotates themes per game and differs from the previous theme', () => {
    const games = [
      mk({ id: 'a', themes: ['x', 'y', 'z'] }),
      mk({ id: 'b', themes: ['x', 'y', 'z'] }),
    ];
    const r = new Rotation(games, seeded(1));
    const picks = Array.from({ length: 12 }, () => r.next());
    for (let i = 1; i < picks.length; i++) {
      expect(picks[i].theme).not.toBe(picks[i - 1].theme);
    }
    const aThemes = new Set(
      picks.filter((p) => p.game.id === 'a').map((p) => p.theme),
    );
    expect(aThemes.size).toBeGreaterThan(1);
  });

  it('peek returns the game next() will return', () => {
    const r = new Rotation(GAMES, seeded(9));
    for (let i = 0; i < 30; i++) {
      const p = r.peek();
      expect(r.next().game.id).toBe(p.id);
    }
  });

  it('needs two games', () => {
    expect(() => new Rotation([GAMES[0]])).toThrow();
  });
});

describe('Rotation weights and live updates', () => {
  const g = (id: string, weight: number) => mk({ id, weight });

  it('plays a heavier game more often but never back to back', () => {
    const r = new Rotation([g('a', 3), g('b', 1), g('c', 1)], seeded(11));
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    let prev: string | null = null;
    for (let i = 0; i < 500; i++) {
      const { game } = r.next();
      expect(game.id).not.toBe(prev);
      prev = game.id;
      counts[game.id] += 1;
    }
    expect(counts.a).toBeGreaterThan(counts.b);
    expect(counts.a).toBeGreaterThan(counts.c);
  });

  it('survives a dominant weight with only two games', () => {
    const r = new Rotation([g('a', 10), g('b', 1)], seeded(5));
    let prev: string | null = null;
    for (let i = 0; i < 100; i++) {
      const { game } = r.next();
      expect(game.id).not.toBe(prev);
      prev = game.id;
    }
  });

  it('setGames drops disabled games and applies new weights live', () => {
    const r = new Rotation([g('a', 1), g('b', 1), g('c', 1)], seeded(2));
    r.next();
    r.setGames([g('b', 1), g('c', 1)]);
    for (let i = 0; i < 40; i++) {
      expect(['b', 'c']).toContain(r.next().game.id);
    }
    expect(() => r.setGames([g('b', 1)])).toThrow();
  });
});
