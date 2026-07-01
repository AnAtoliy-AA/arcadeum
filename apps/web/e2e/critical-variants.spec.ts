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
    const userId = '507f191e810c19729de860ea';

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
              id: '507f191e810c19729de860f1',
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
    await page.waitForLoadState('networkidle');

    // Select Critical game tile
    const criticalTile = page.getByTestId('game-tile-critical_v1');
    await expect(criticalTile).toBeVisible({});
    await criticalTile.click({ force: true });

    // Create room (variant is now selected in lobby, not create page)
    const createBtn = page.getByTestId('create-room-button');
    await expect(createBtn).toBeEnabled({});
    await createBtn.click({ force: true });

    // The create button should trigger navigation to the room
    await expect(page).toHaveURL(/\/games\/rooms\//, {});
    await page.waitForLoadState('domcontentloaded');
    await waitForRoomReady(page);

    // Wait specifically for the game title to appear in the header
    const gameHeading = page
      .locator('h1,h2,h3')
      .filter({ hasText: /Critical/i })
      .first();
    await expect(gameHeading).toBeVisible({});

    // Select High-Altitude Hike variant in the lobby
    const hikeVariant = page
      .locator('button')
      .filter({ hasText: /High-Altitude Hike/i });
    await expect(hikeVariant).toBeVisible({});
    await hikeVariant.click();

    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    await closeRulesModal(page);

    // Check if we are in the game. The legacy `PlayerHand` heading is
    // gone; MatchWidget is the canonical "in-game" marker.
    await expect(page.locator('[data-testid="match-widget"]')).toBeVisible({});

    // Redesign markers (ARC-480): scene backdrop still mounts under the
    // widget; turn banner lives inside `ArenaCenter`.
    await expect(page.locator('[data-testid="scene-backdrop"]')).toBeVisible();
    await expect(page.locator('[data-testid="turn-banner"]')).toBeVisible();
  });
});
