import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  waitForRoomReady,
  mockGameSocket,
} from './fixtures/test-utils';

const VARIANTS = [
  'classic',
  'modern',
  'pixel',
  'cartoon',
  'cyber',
  'vintage',
  'nebula',
  'forest',
  'sunset',
  'monochrome',
];

test.describe('Sea Battle Color Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  for (const variant of VARIANTS) {
    test(`should have clearly visible hover colors in ${variant} theme`, async ({
      page,
    }) => {
      // Hover is a desktop/mouse concept — skip on mobile/tablet viewports
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 1024) {
        return;
      }

      const roomId = MOCK_OBJECT_ID;
      const userId = '507f191e810c19729de860ea';

      await mockRoomInfo(page, {
        room: {
          id: roomId,
          name: `${variant} Color Test Room`,
          gameId: 'sea_battle_v1',
          gameOptions: { variant },
          status: 'placement',
        },
      });

      await mockGameSocket(page, roomId, userId, {
        gameId: 'sea_battle_v1',
        roomJoinedPayload: {
          status: 'active',
          gameOptions: { variant },
          session: {
            status: 'active',
            state: {
              phase: 'placement',
              players: [
                {
                  playerId: userId,
                  displayName: 'Test User',
                  alive: true,
                  board: Array(10)
                    .fill(null)
                    .map(() => Array(10).fill(0)),
                  ships: [],
                  placementComplete: false,
                },
                {
                  playerId: 'bot-1',
                  displayName: 'Computer',
                  alive: true,
                  board: Array(10)
                    .fill(null)
                    .map(() => Array(10).fill(0)),
                  ships: [],
                  placementComplete: false,
                },
              ],
              playerOrder: [userId, 'bot-1'],
              currentTurnIndex: 0,
            },
          },
        },
      });

      await navigateTo(page, `/games/rooms/${roomId}`);
      await waitForRoomReady(page);

      // Verify we are in placement phase
      await expect(page.locator('body').first()).toContainText(
        /place your ships/i,
        {
          timeout: 15000,
        },
      );

      // Find a board cell and read its initial (non-highlighted) background
      const cell = page.locator('[data-row="1"][data-col="1"]').first();
      await expect(cell).toBeVisible({ timeout: 15000 });

      const initialBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // Select a ship to enable placement highlights (from the palette)
      const shipItem = page.getByTestId('ship-palette-item').first();
      await expect(shipItem).toBeVisible({ timeout: 15000 });
      await shipItem.scrollIntoViewIfNeeded();
      await shipItem.click({ timeout: 5000 });

      // Small delay to ensure React state update (ship selection) is processed
      await page.waitForTimeout(500);

      // Hover the cell — use mouse.move with bounding box for reliable WebKit pointer events
      await cell.scrollIntoViewIfNeeded();
      const cellBox = await cell.boundingBox();
      if (cellBox) {
        await page.mouse.move(
          cellBox.x + cellBox.width / 2,
          cellBox.y + cellBox.height / 2,
          { steps: 3 },
        );
      }

      // Wait for the background color to change (React state update reflection)
      // This is a more robust way to check for hover highlights than data-attributes
      await page.waitForFunction(
        ({ selector, initialBg }) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          const currentBg = window.getComputedStyle(el).backgroundColor;
          return currentBg !== initialBg;
        },
        { selector: '[data-row="1"][data-col="1"]', initialBg },
        { timeout: 8000 },
      );

      // Small delay to ensure the highlight color is stable
      await page.waitForTimeout(500);

      // Now read the highlighted background for the final assertion
      const highlightedBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // They should be different (allow for small differences due to color mixing)
      expect(
        initialBg,
        `Initial color should be different from highlighted color in ${variant} theme`,
      ).not.toBe(highlightedBg);

      // Should not be fully transparent
      expect(highlightedBg).not.toContain('rgba(0, 0, 0, 0)');
    });
  }
});
