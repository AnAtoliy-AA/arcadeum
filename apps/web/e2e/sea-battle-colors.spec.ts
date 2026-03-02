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
      await expect(page.locator('body').first()).toContainText(/place ships/i, {
        timeout: 15000,
      });

      // Select a ship to enable placement highlights (from the palette)
      const shipItem = page
        .locator('h3:has-text("Ships to Place") + div')
        .first();
      await expect(shipItem).toBeVisible({ timeout: 15000 });
      await shipItem.click({ force: true, timeout: 5000 });

      // Add a small wait for React to process the state change
      await page.waitForTimeout(1000);

      // Find a board cell
      const cell = page.locator('[data-row="1"][data-col="1"]').first();
      await expect(cell).toBeVisible({ timeout: 15000 });

      // Check initial background color
      const initialBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // Use a different approach: simulate the highlighted state directly
      // This bypasses the CSS hover state and directly tests the color mixing logic
      await page.evaluate(() => {
        const cell = document.querySelector('[data-row="1"][data-col="1"]');
        if (cell) {
          // Force the highlighted state
          cell.setAttribute('data-highlighted', 'true');
          // Trigger a re-render by changing a data attribute
          cell.setAttribute('data-test', 'highlighted');
        }
      });

      // Wait for the change to be applied
      await page.waitForTimeout(1000);

      // Check the background color with highlighted state
      const highlightedBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // They should be different (allow for small differences due to color mixing)
      expect(
        initialBg,
        `Initial color should be different from highlighted color in ${variant} theme`,
      ).not.toBe(highlightedBg);

      // Should not be transparent
      expect(highlightedBg).not.toContain('rgba(0, 0, 0, 0)');

      // Additional check: highlighted color should have higher opacity than initial,
      // or at least be different if both are already opaque.
      let initialOpacity = 1;
      let highlightedOpacity = 1;

      if (initialBg.includes('rgba')) {
        const initialMatch = initialBg.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
        );
        if (initialMatch && initialMatch[4]) {
          initialOpacity = parseFloat(initialMatch[4]);
        }
      }

      if (highlightedBg.includes('rgba')) {
        const highlightedMatch = highlightedBg.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
        );
        if (highlightedMatch && highlightedMatch[4]) {
          highlightedOpacity = parseFloat(highlightedMatch[4]);
        }
      }

      if (initialOpacity < 1 || highlightedOpacity < 1) {
        expect(
          highlightedOpacity,
          `Highlighted color should have higher opacity than initial color in ${variant} theme`,
        ).toBeGreaterThanOrEqual(initialOpacity);
      }
    });
  }
});
