import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

test.describe('Chess Puzzle Rush Leaderboard and Tactical Streak Sharing', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/chess/puzzles/rush/leaderboard*', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }
      await handleRoute(route, [
        {
          rank: 1,
          userId: 'bot_magnus',
          username: 'MagnusVibe',
          score: 48,
          bestStreak: 48,
          totalTimeSeconds: 520,
          rating: 2650,
          createdAt: new Date().toISOString(),
        },
        {
          rank: 2,
          userId: 'bot_anna',
          username: 'TacticalQueen',
          score: 41,
          bestStreak: 35,
          totalTimeSeconds: 460,
          rating: 2420,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    await page.route('**/chess/puzzles/rush/run', async (route) => {
      await handleRoute(route, {
        ok: true,
        rank: 1,
        bestScore: 15,
        isNewBest: true,
      });
    });

    await page.route('**/chess/puzzles/random*', async (route) => {
      await handleRoute(route, {
        puzzleId: 'e2e-puzzle-1',
        fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
        moves: ['c4f7', 'e8f7'],
        rating: 1200,
        themes: ['fork'],
        openingTags: ['Italian Game'],
      });
    });
  });

  test('views puzzle rush menu, switches to leaderboard, and checks entries', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/rush');

    await expect(page.getByTestId('puzzle-rush-survival-btn')).toBeVisible();
    await expect(page.getByTestId('puzzle-rush-timed-btn')).toBeVisible();

    const lbBtn = page.getByTestId('puzzle-rush-leaderboard-btn');
    await expect(lbBtn).toBeVisible();
    await lbBtn.click();

    await expect(page.getByTestId('puzzle-rush-leaderboard')).toBeVisible();
    await expect(page.getByText('MagnusVibe')).toBeVisible();
    await expect(page.getByText('TacticalQueen')).toBeVisible();

    const backBtn = page.getByTestId('rush-leaderboard-back-btn');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page.getByTestId('puzzle-rush-survival-btn')).toBeVisible();
  });

  test('plays a rush run, ends it, and opens tactical share modal', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/rush');

    await page.getByTestId('puzzle-rush-survival-btn').click();

    const endRunBtn = page.getByTestId('puzzle-rush-end-run-btn');
    await expect(endRunBtn).toBeVisible();
    await endRunBtn.click();

    await expect(page.getByTestId('puzzle-rush-gameover')).toBeVisible();

    const shareBtn = page.getByTestId('puzzle-rush-share-btn');
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    await expect(page.getByTestId('tactical-share-modal')).toBeVisible();
    await expect(page.getByTestId('tactical-share-score')).toBeVisible();
    await expect(page.getByTestId('tactical-share-native-btn')).toBeVisible();
  });
});
