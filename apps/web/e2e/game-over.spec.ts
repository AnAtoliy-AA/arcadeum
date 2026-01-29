import { test, expect } from '@playwright/test';
import { mockSession, navigateTo } from './fixtures/test-utils';

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

    // Override the room/session mock to simulate victory
    await page.route(
      (url) => {
        return (
          url.toString().includes(roomId) && !url.toString().includes('_next')
        );
      },
      async (route) => {
        const request = route.request();

        // Allow page navigation document requests to pass through to Next.js server
        if (request.resourceType() === 'document') {
          return route.continue();
        }

        // Return JSON for what is likely the API call
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            room: {
              id: roomId,
              gameId: 'critical_v1',
              hostId: 'user-1',
              status: 'completed',
              visibility: 'public',
              participants: [{ userId: 'user-1' }, { userId: 'user-2' }],
              members: [
                { id: 'user-1', displayName: 'Winner', isHost: true },
                { id: 'user-2', displayName: 'Loser', isHost: false },
              ],
              players: [],
              gameOptions: { cardVariant: 'default' },
            },
            session: {
              sessionId: 'sess-1',
              roomId: roomId,
              userId: 'user-1',
              status: 'completed',
              state: {
                players: [
                  {
                    playerId: 'user-1',
                    alive: true,
                    hand: [],
                    stash: [],
                  },
                  {
                    playerId: 'user-2',
                    alive: false,
                    hand: [],
                    stash: [],
                  },
                ],
                playerOrder: ['user-1', 'user-2'],
                currentTurnIndex: 0,
                deck: [],
                discardPile: [],
                logs: [],
                winnerId: 'user-1',
              },
            },
          }),
        });
      },
    );

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

    // Override to simulate defeat
    await page.route(
      (url) => {
        return (
          url.toString().includes(roomId) && !url.toString().includes('_next')
        );
      },
      async (route) => {
        const request = route.request();
        if (request.resourceType() === 'document') {
          return route.continue();
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            room: {
              id: roomId,
              gameId: 'critical_v1',
              hostId: 'user-2',
              status: 'completed',
              visibility: 'public',
              participants: [{ userId: 'user-1' }, { userId: 'user-2' }],
              members: [
                { id: 'user-1', displayName: 'Loser', isHost: false },
                { id: 'user-2', displayName: 'Winner', isHost: true },
              ],
              players: [],
              gameOptions: { cardVariant: 'default' },
            },
            session: {
              sessionId: 'sess-1',
              roomId: roomId,
              userId: 'user-1',
              status: 'completed',
              state: {
                players: [
                  {
                    playerId: 'user-1',
                    alive: false,
                    hand: [],
                    stash: [],
                  },
                  {
                    playerId: 'user-2',
                    alive: true,
                    hand: [],
                    stash: [],
                  },
                ],
                playerOrder: ['user-1', 'user-2'],
                currentTurnIndex: 0,
                deck: [],
                discardPile: [],
                logs: [],
                winnerId: 'user-2',
              },
            },
          }),
        });
      },
    );

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
