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
      const userId = 'user-1';

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
      await expect(shipItem).toBeVisible();
      await shipItem.click();

      // Find a board cell
      const cell = page.locator('[data-row="1"][data-col="1"]').first();
      await expect(cell).toBeVisible();

      // Check initial background color
      const initialBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // Hover over the cell
      await cell.hover();

      // Wait for transition
      await page.waitForTimeout(400);

      // Check hover background color
      const hoverBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // They should be different
      expect(
        initialBg,
        `Initial color should be different from hover color in ${variant} theme`,
      ).not.toBe(hoverBg);

      // Should not be transparent
      expect(hoverBg).not.toContain('rgba(0, 0, 0, 0)');
    });
  }
});
