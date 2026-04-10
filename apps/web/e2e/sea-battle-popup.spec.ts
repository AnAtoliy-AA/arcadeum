import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
} from './fixtures/test-utils';

test.describe('Sea Battle Popup Challenge', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show Sea Battle challenge popup when a message is received', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = MOCK_OBJECT_ID;
    const otherUserId = 'other-user-id';

    const createInitialState = (logs: Record<string, unknown>[] = []) => ({
      deck: [],
      discardPile: [],
      playerOrder: [userId, otherUserId],
      currentTurnIndex: 0,
      pendingDraws: 0,
      pendingDefuse: null,
      pendingFavor: null,
      pendingAlter: null,
      pendingAction: null,
      players: [
        {
          playerId: userId,
          displayName: 'Me',
          alive: true,
          hand: [],
        },
        {
          playerId: otherUserId,
          displayName: 'Opponent',
          alive: true,
          hand: [],
        },
      ],
      logs,
      allowActionCardCombos: false,
    });

    const challengeLogs = [
      {
        id: 'msg-active',
        type: 'message',
        senderId: otherUserId,
        senderName: 'Opponent',
        message: 'Challenge me!',
        createdAt: new Date().toISOString(),
      },
    ];

    const initialMockState = createInitialState(challengeLogs);

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Challenge Test Room',
        gameId: 'critical_v1',
        status: 'active',
        members: [
          { id: userId, userId: userId, displayName: 'Me', isHost: true },
          {
            id: otherUserId,
            userId: otherUserId,
            displayName: 'Opponent',
            isHost: false,
          },
        ],
      },
      session: {
        id: 'session-1',
        status: 'active',
        state: initialMockState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'critical_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          status: 'active',
          state: initialMockState,
        },
      },
    });

    await page.goto(`/games/rooms/${roomId}`);

    // Wait for the game to be ready - this ensures socket and state are sync'd
    const main = page.locator('main').first();
    await main.waitFor({ state: 'visible', timeout: 30000 });

    // Verify Chat Bubble exists in DOM
    const bubble = page.getByTestId('chat-bubble');
    await bubble.waitFor({ state: 'attached', timeout: 15000 });
    await expect(bubble).toBeVisible({ timeout: 5000 });
    await expect(bubble).toHaveText(/Challenge me!/i);

    // Verify Sea Battle challenge popup is visible
    const popupContainer = page.getByTestId('sea-battle-popup-container');

    await expect(popupContainer).toBeVisible({ timeout: 15000 });

    const challengeButton = page.getByTestId('challenge-button');
    await expect(challengeButton).toBeVisible({ timeout: 10000 });
    await expect(challengeButton).toBeInViewport();

    // Wait a bit for the UI to be fully interactive
    await page.waitForTimeout(1000);

    // Click challenge with fallback mechanism
    await challengeButton.click({ force: true });
    await challengeButton.dispatchEvent('click').catch(() => {});

    // Verify redirection to game creation page
    await page.waitForURL(/.*\/games\/create\?gameId=sea_battle_v1.*/, {
      timeout: 20000,
    });
    await expect(page).toHaveURL(/.*opponentId=other-user-id.*/);
  });
});
