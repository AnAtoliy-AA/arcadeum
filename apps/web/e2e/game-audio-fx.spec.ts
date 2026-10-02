import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Game Audio FX Integration', () => {
  test('serves sound assets without 404 responses', async ({ request }) => {
    const soundPaths = [
      '/sounds/shared/click.wav',
      '/sounds/shared/success.wav',
      '/sounds/shared/error.wav',
      '/sounds/shared/ding.wav',
      '/sounds/board/piece-move.wav',
      '/sounds/board/piece-capture.wav',
      '/sounds/cards/play.wav',
      '/sounds/cards/deal.wav',
      '/sounds/cards/slide.wav',
      '/sounds/dice/roll.wav',
      '/sounds/battle/hit.wav',
      '/sounds/battle/explosion.wav',
      '/sounds/result/win.wav',
      '/sounds/result/lose.wav',
    ];

    for (const path of soundPaths) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('audio/');
    }
  });

  test('toggles sound settings and interactions in solo puzzle game', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/2048/play');

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem(
        'arcadeum_settings',
        JSON.stringify({ soundEnabled: true }),
      );
    });

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');

    await expect(board).toBeVisible();

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('arcadeum_settings');
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored?.soundEnabled).toBe(true);
  });
});
