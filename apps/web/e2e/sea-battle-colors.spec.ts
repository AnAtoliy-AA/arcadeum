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
import { routes } from '../src/shared/config/routes';

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

      await navigateTo(page, routes.gameRoom(roomId));
      await waitForRoomReady(page);

      // Verify we are in placement phase
      await expect(page.locator('body').first()).toContainText(
        /place your ships/i,
        {},
      );

      // Find a board cell and read its initial (non-highlighted) background
      const cell = page.locator('[data-row="1"][data-col="1"]').first();
      await expect(cell).toBeVisible({});

      const initialBg = await cell.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      // Select a ship to enable placement highlights (from the palette)
      const shipItem = page.getByTestId('ship-palette-item').first();
      await expect(shipItem).toBeVisible({});
      await shipItem.scrollIntoViewIfNeeded();
      await shipItem.dispatchEvent('click');

      // Hover the cell — cell.hover() reliably dispatches pointer/mouse events
      await cell.scrollIntoViewIfNeeded();
      await cell.dispatchEvent('pointermove', {
        bubbles: true,
        cancelable: true,
      });

      // Wait for the data-highlighted attribute to reflect React state update
      await expect(cell).toHaveAttribute('data-highlighted', 'true');

      // Read the highlighted background for the final assertion
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
