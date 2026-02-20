import { test, expect } from '@playwright/test';
import { mockSession, navigateTo, mockRoomInfo } from './fixtures/test-utils';

test.describe('Game Over Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user session
    await mockSession(page);
  });

  test('should display victory modal when player wins', async ({ page }) => {
    const roomId = '500000000000000000000001';

    // Abort all websocket connections to force reliance on HTTP mock
    await page.route(
      (url) =>
        url.protocol === 'wss:' ||
        url.protocol === 'ws:' ||
        url.pathname.includes('/socket.io/'),
      (route) => route.abort(),
    );

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'completed',
        members: [
          { id: 'user-1', displayName: 'Winner', isHost: true },
          { id: 'user-2', displayName: 'Loser', isHost: false },
        ],
        gameOptions: { cardVariant: 'default' },
      },
      session: {
        sessionId: 'sess-1',
        roomId: roomId,
        userId: 'user-1',
        status: 'completed',
        state: {
          players: [
            { playerId: 'user-1', alive: true, hand: [], stash: [] },
            { playerId: 'user-2', alive: false, hand: [], stash: [] },
          ],
          playerOrder: ['user-1', 'user-2'],
          currentTurnIndex: 0,
          deck: [],
          discardPile: [],
          logs: [],
          winnerId: 'user-1',
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Find modal by Emoji
    const modal = page.locator('div').filter({ hasText: '🏆' }).last();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Expect Victory Title
    const victoryTitle = modal.locator('h1');
    await expect(victoryTitle).toBeVisible();

    // Check Rematch button (scoped to modal)
    const rematchBtn = modal.getByRole('button', {
      name: /Play Again|games\.table\.rematch\.button/i,
    });
    await expect(rematchBtn).toBeVisible();

    // Check Back to Home button (scoped to modal)
    const homeBtn = modal.locator('a[href="/"]');
    await expect(homeBtn).toBeVisible();
  });

  test('should display defeat modal when player loses', async ({ page }) => {
    const roomId = '500000000000000000000002';

    // Abort all websocket connections
    await page.route(
      (url) =>
        url.protocol === 'wss:' ||
        url.protocol === 'ws:' ||
        url.pathname.includes('/socket.io/'),
      (route) => route.abort(),
    );

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        hostId: 'user-2',
        status: 'completed',
        members: [
          { id: 'user-1', displayName: 'Loser', isHost: false },
          { id: 'user-2', displayName: 'Winner', isHost: true },
        ],
        gameOptions: { cardVariant: 'default' },
      },
      session: {
        sessionId: 'sess-1',
        roomId: roomId,
        userId: 'user-1',
        status: 'completed',
        state: {
          players: [
            { playerId: 'user-1', alive: false, hand: [], stash: [] },
            { playerId: 'user-2', alive: true, hand: [], stash: [] },
          ],
          playerOrder: ['user-1', 'user-2'],
          currentTurnIndex: 1,
          deck: [],
          discardPile: [],
          logs: [],
          winnerId: 'user-2',
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Find modal by Emoji
    const modal = page.locator('div').filter({ hasText: '💀' }).last();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Expect Defeat Title
    const defeatTitle = modal.locator('h1');
    await expect(defeatTitle).toBeVisible();

    // Check Back to Home button (scoped to modal)
    const homeBtn = modal.locator('a[href="/"]');
    await expect(homeBtn).toBeVisible();

    // Rematch button logic: if not host, button not shown
    // Check broadly in the page or modal
    await expect(
      page.getByRole('button', { name: /Play Again/i }),
    ).not.toBeVisible();
  });
});
