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

    const initialMockState = createInitialState();

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

    // Wait for the game to be ready
    const main = page.locator('main');
    await main.waitFor({ state: 'visible', timeout: 30000 });

    // Check if players are rendered
    const opponentCard = page.getByTestId(`player-card-${otherUserId}`);
    await expect(opponentCard).toBeVisible({ timeout: 15000 });

    // Emit a message from the opponent AFTER the page is ready
    await page.evaluate(
      ({ otherUserId, roomId, userId }) => {
        const logs = [
          {
            id: 'msg-active',
            type: 'message',
            senderId: otherUserId,
            senderName: 'Opponent',
            message: 'Challenge me!',
            createdAt: new Date().toISOString(),
          },
        ];

        // Inline the function because evaluate context is isolated
        const state = {
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
            { playerId: userId, alive: true, hand: [] },
            { playerId: otherUserId, alive: true, hand: [] },
          ],
          logs,
          allowActionCardCombos: false,
        };

        const snapshot = {
          roomId,
          session: {
            id: 'session-1',
            status: 'active',
            state,
          },
        };
        window.gameSocket?.trigger('games.session.snapshot', snapshot);
      },
      { otherUserId, roomId, userId },
    );

    // Verify Chat Bubble
    await expect(page.getByText('Challenge me!', { exact: true })).toBeVisible({
      timeout: 10000,
    });

    // Verify Sea Battle challenge popup is visible
    const challengeButton = page.getByRole('button', {
      name: /challenge|вызов/i,
    });
    await expect(challengeButton).toBeVisible({ timeout: 15000 });

    // Click challenge and verify navigation
    await challengeButton.click({ force: true });

    // Verify redirection to game creation page
    await expect(page).toHaveURL(/.*\/games\/create\?gameId=sea_battle_v1.*/);
    await expect(page).toHaveURL(/.*opponentId=other-user-id.*/);
  });
});
