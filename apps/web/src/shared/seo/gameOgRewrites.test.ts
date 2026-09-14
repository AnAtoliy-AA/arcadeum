import { describe, it, expect } from 'vitest';
import { buildGameOgRewrites, GAME_OG_SLUGS } from './gameOgRewrites';

describe('buildGameOgRewrites', () => {
  it('generates paired rewrites for all game slugs', () => {
    const rewrites = buildGameOgRewrites();
    expect(rewrites).toHaveLength(GAME_OG_SLUGS.length * 2);

    const chessOg = rewrites.find(
      (r) => r.source === '/:locale/games/chess/opengraph-image',
    );
    expect(chessOg?.destination).toBe(
      '/:locale/games/chess/opengraph-image-g73f6m',
    );

    const chessTw = rewrites.find(
      (r) => r.source === '/:locale/games/chess/twitter-image',
    );
    expect(chessTw?.destination).toBe(
      '/:locale/games/chess/twitter-image-g73f6m',
    );
  });
});
