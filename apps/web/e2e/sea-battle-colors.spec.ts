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
import { SHARED_THEMES } from '../src/features/games/lib/shared-themes';
import { getTheme } from '../src/widgets/StrategyGames/SeaBattleGame/lib/theme';

const VARIANTS = SHARED_THEMES.filter((t) => t.id !== 'random').map(
  (t) => t.id,
);

test.describe('Sea Battle Color Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  for (const variant of VARIANTS) {
    test(`should have clearly visible hover colors in ${variant} theme`, async ({
      page,
    }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 1024) {
        return;
      }

      const expectedTheme = getTheme(variant);
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

      await expect(page.locator('body').first()).toContainText(
        /place your ships/i,
        {},
      );

      const cell = page.locator('[data-row="1"][data-col="1"]').first();
      await expect(cell).toBeVisible({});
      await expect(cell).toHaveCSS('background-color', expectedTheme.cellEmpty);

      const shipItem = page.getByTestId('ship-palette-item').first();
      await expect(shipItem).toBeVisible({});
      await shipItem.scrollIntoViewIfNeeded();
      await shipItem.dispatchEvent('click');

      await cell.scrollIntoViewIfNeeded();
      await cell.dispatchEvent('pointermove', {
        bubbles: true,
        cancelable: true,
      });

      await expect(cell).toHaveAttribute('data-highlighted', 'true');
      await expect(cell).toHaveCSS('background-color', expectedTheme.cellHover);
    });
  }
});
