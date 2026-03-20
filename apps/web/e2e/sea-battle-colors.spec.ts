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
      // Hover is a desktop/mouse concept — skip on mobile viewports
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
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
      await expect(page.locator('body').first()).toContainText(/place ships/i, {
        timeout: 15000,
      });

      // Find a board cell and read its initial (non-highlighted) background
      const cell = page.locator('[data-row="1"][data-col="1"]').first();
      await expect(cell).toBeVisible({ timeout: 15000 });

      const initialBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // Select a ship to enable placement highlights (from the palette)
      const shipItem = page.getByTestId('ship-palette-item').first();
      await expect(shipItem).toBeVisible({ timeout: 15000 });
      await shipItem.click({ force: true, timeout: 5000 });

      // Dispatch native mouseover event to trigger React's onMouseEnter
      // (works on all browsers including mobile emulations that lack real hover)
      await page.evaluate(() => {
        const el = document.querySelector('[data-row="1"][data-col="1"]');
        if (el) {
          el.dispatchEvent(
            new MouseEvent('mouseover', { bubbles: true, cancelable: true }),
          );
        }
      });

      // Wait for the React state update to be reflected via data-highlighted attribute
      await expect(cell).toHaveAttribute('data-highlighted', 'true', {
        timeout: 3000,
      });

      // Now read the highlighted background (React has already re-rendered)
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
