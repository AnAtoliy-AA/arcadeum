import { test, expect } from '@playwright/test';
import { mockSession, navigateTo } from './fixtures/test-utils';

test.describe('Hand Layout', () => {
  const roomId = '507f1f77bcf86cd799439011';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    page.on('console', (msg) => {
      console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
    });

    // Intercept API calls for the room
    await page.route(
      (url) => url.toString().includes(`/games/rooms/${roomId}`),
      async (route) => {
        const request = route.request();
        if (request.resourceType() === 'document') {
          return route.continue();
        }

        console.log(`Fulfilling mock data for ${request.url()}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            room: {
              id: roomId,
              gameId: 'critical_v1',
              status: 'in_progress',
              visibility: 'public',
              participants: [{ userId: 'user-1' }],
              members: [{ id: 'user-1', displayName: 'Me', isHost: false }],
              players: [],
              gameOptions: {
                cardVariant: 'default',
              },
            },
            session: {
              sessionId: 'sess-1',
              roomId: roomId,
              userId: 'user-1',
              state: {
                players: [
                  {
                    playerId: 'user-1',
                    alive: true,
                    hand: [
                      'strike',
                      'cancel',
                      'evade',
                      'reorder',
                      'trade',
                      'neutralizer',
                      'collection_alpha',
                      'collection_beta',
                      'collection_gamma',
                      'collection_delta',
                    ],
                    stash: [],
                  },
                ],
                playerOrder: ['user-1'],
                currentTurnIndex: 0,
                deck: [],
                discardPile: [],
                logs: [],
              },
            },
          }),
        });
      },
    );
  });

  test('should allow switching grid layouts', async ({ page }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);

    // Wait for game to load
    try {
      console.log('Waiting for "Your turn"...');

      // Wait for some text that definitely comes from the game/header
      await page.waitForSelector('text=Arcadeum', { timeout: 15000 });

      // Close RulesModal
      console.log('Closing RulesModal...');
      const modal = page.locator('text=OBJECTIVE');
      await expect(modal).toBeVisible({ timeout: 10000 });

      await page.keyboard.press('Escape');
      const closeBtn = page.getByRole('button', { name: '×' });
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }

      // Wait for modal to be gone
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      console.log('Modal is closed.');

      // Wait for "Your turn"
      const turnText = page.getByText('Your turn', { exact: true }).first();
      await expect(turnText).toBeVisible({ timeout: 15000 });
      console.log('"Your turn" is visible.');
    } catch (e) {
      console.log('Test failed. Current page state:');
      const content = await page.content();
      console.log(`Content length: ${content.length}`);
      console.log('--- BODY INNER TEXT ---');
      console.log(await page.evaluate(() => document.body.innerText));
      throw e;
    }

    // Locate the layout trigger
    const layoutTrigger = page.getByTestId('layout-trigger');
    await expect(layoutTrigger).toBeVisible();

    // 1. Initial State: Grid
    const grid = page.getByTestId('hand-grid');
    await expect(grid).toBeVisible();

    // 2. Switch to Grid 4x
    await layoutTrigger.click();
    await page.getByRole('button', { name: 'Grid 4x' }).click();

    // Verify trigger text contains Grid 4x
    await expect(layoutTrigger).toHaveText(/Grid 4x/i);

    // Verify grid columns (computed pixels for 4 columns)
    await expect(grid).toHaveCSS(
      'grid-template-columns',
      /^([\d\.]+px\s?){4}$/,
    );

    // 3. Switch to Linear (Scroll)
    await layoutTrigger.click();
    await page.getByRole('button', { name: /Scroll/i }).click();

    // Verify trigger text contains Scroll
    await expect(layoutTrigger).toHaveText(/Scroll/i);

    // Verify layout is flex
    await expect(grid).toHaveCSS('display', 'flex');
  });
});
