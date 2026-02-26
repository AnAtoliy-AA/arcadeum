import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  mockGameSocket,
  navigateTo,
  waitForRoomReady,
  closeRulesModal,
} from './fixtures/test-utils';

test.describe('Critical Variant Selection', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting and starting a game with High-Altitude Hike variant', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = 'user-1';

    // Mock room info for lobby
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'lobby',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    // Mock socket for starting game
    await mockGameSocket(page, roomId, userId, {
      handlers: {
        'games.session.start': {
          responseEvent: 'games.session.started',
          responseData: {
            success: true,
            room: {
              id: roomId,
              status: 'active',
              gameId: 'critical_v1',
              hostId: userId,
              members: [
                {
                  id: userId,
                  userId: userId,
                  displayName: 'Test User',
                  isHost: true,
                },
              ],
            },
            session: {
              id: 'session-1',
              status: 'active',
              state: {
                players: [
                  {
                    playerId: userId,
                    alive: true,
                    hand: [],
                    defuseCount: 1,
                    stash: [],
                  },
                ],
                deck: [],
                discardPile: [],
                currentTurnIndex: 0,
                playerOrder: [userId],
                pendingAction: null,
                cardVariant: 'high-altitude-hike',
              },
            },
          },
        },
      },
    });

    // Navigate to game creation page
    await navigateTo(page, '/games/create');

    // Select Critical game tile
    const criticalTile = page
      .locator('div,a,button')
      .filter({ hasText: /^Critical$/ })
      .first();
    await expect(criticalTile).toBeVisible();
    await criticalTile.click();

    // Select High-Altitude Hike variant tile
    const hikeVariant = page
      .locator('button')
      .filter({ hasText: /High-Altitude Hike/i });
    await expect(hikeVariant).toBeVisible({ timeout: 10000 });
    await hikeVariant.click();

    // Create room
    const createBtn = page.getByRole('button', { name: /Create Room/i });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // The create button should trigger navigation to the room
    await expect(page).toHaveURL(/\/games\/rooms\//, { timeout: 15000 });
    await waitForRoomReady(page);

    // Wait specifically for the game title to appear in the header
    const gameHeading = page
      .locator('h1,h2,h3')
      .filter({ hasText: /Critical/i })
      .first();
    await expect(gameHeading).toBeVisible({ timeout: 20000 });

    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    await closeRulesModal(page);

    // Check if we are in the game
    await expect(page.getByRole('heading', { name: /your hand/i })).toBeVisible(
      {
        timeout: 15000,
      },
    );
  });
});
