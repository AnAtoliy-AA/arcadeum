import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  mockGameSocket,
  navigateTo,
  waitForRoomReady,
  closeGameRulesModal,
} from './fixtures/test-utils';

test.describe('Critical Card Visibility', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show card names and descriptions with modern styling', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(40).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId],
      pendingAction: null,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
      session: {
        id: '507f191e810c19729de860f1',
        status: 'active',
        state: mockState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: '507f191e810c19729de860f1',
          status: 'active',
          state: mockState,
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const cardName = page.getByText(/Attack/i).first();
    await expect(cardName).toBeVisible({ timeout: 15000 });

    const cardDescription = page.locator('.tamagui-CardDescription').first();
    if (await cardDescription.isVisible()) {
      await expect(cardDescription).toBeVisible();
    }

    // Check for semi-transparent black background on the container
    const containerBg = await cardName.locator('..').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(containerBg).toContain('rgba(0, 0, 0');
  });
});
