import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Game Replays', () => {
  test('replays list page renders with filters', async ({ page }) => {
    await navigateTo(page, '/replays');

    await expect(
      page.getByText(/game replays|повторы|repeticiones|replays/i).first(),
    ).toBeVisible();

    const allFilter = page.getByRole('button', {
      name: /all games|все игры|tous/i,
    });
    await expect(allFilter).toBeVisible();

    const chessFilter = page.getByRole('button', {
      name: /chess|шахматы|ajedrez|échecs/i,
    });
    await expect(chessFilter).toBeVisible();
  });

  test('replays list page shows empty state', async ({ page }) => {
    await navigateTo(page, '/replays');

    const emptyState = page.getByText(/no replays|повторов пока|no hay|aucun/i);
    const replayCards = page.locator('[href^="/replay/"]');

    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasCards = (await replayCards.count()) > 0;

    expect(hasEmpty || hasCards).toBe(true);
  });

  test('replays list page filter tabs change state', async ({ page }) => {
    await navigateTo(page, '/replays');

    const chessFilter = page.getByRole('button', {
      name: /chess|шахматы|ajedrez|échecs/i,
    });
    await expect(chessFilter).toBeVisible();
    await chessFilter.click();

    await expect(chessFilter).toHaveClass(/var\(--primary\)/);
  });

  test('replay viewer page shows error for nonexistent replay', async ({
    page,
  }) => {
    await page.route('**/games/replays/nonexistent-id', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Replay not found' }),
      });
    });

    await navigateTo(page, '/replay/nonexistent-id');

    await expect(page.getByTestId('replay-error')).toBeVisible();
    await expect(
      page
        .getByText(
          /not found|не найден|не знойдзены|no encontrada|introuvable/i,
        )
        .first(),
    ).toBeVisible();
  });

  test('replay viewer page renders board for valid replay', async ({
    page,
  }) => {
    await page.route('**/games/replays/test-replay', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          replay: {
            replayId: 'test-replay',
            roomId: 'room-1',
            sessionId: 'session-1',
            gameId: 'chess_v1',
            playerIds: ['user-1', 'user-2'],
            players: [
              { id: 'user-1', displayName: 'Alice' },
              { id: 'user-2', displayName: 'Bob' },
            ],
            initialState: {
              board: Array.from({ length: 8 }, () => Array(8).fill(null)),
            },
            actions: [
              {
                action: 'move',
                userId: 'user-1',
                payload: {},
                timestamp: '2026-01-01T00:01:00Z',
              },
            ],
            result: { winnerIds: ['user-1'], isDraw: false },
            totalMoves: 1,
            durationMs: 60000,
            createdAt: '2026-01-01T00:00:00Z',
          },
        }),
      });
    });

    await navigateTo(page, '/replay/test-replay');

    const playButton = page.getByRole('button', {
      name: /play|воспроизвести|reproducir|lire|прайграць/i,
    });
    await expect(playButton).toBeVisible();

    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();
  });
});
