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
      async ({ otherUserId, roomId, userId }) => {
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
        // Wait a small bit for socket to be fully ready
        await new Promise((r) => setTimeout(r, 500));
        window.gameSocket?.trigger('games.session.snapshot', snapshot);

        const win = window as unknown as {
          _playwrightMocks?: { lastSession: unknown };
        };
        if (win._playwrightMocks) {
          win._playwrightMocks.lastSession = snapshot.session;
        }
      },
      { otherUserId, roomId, userId },
    );

    // Verify state update (checking for log entry in window.gameSocket)
    await page.waitForFunction(
      (msgId) => {
        const win = window as unknown as {
          gameSocket?: { connected: boolean };
          _playwrightMocks?: {
            lastSession?: { state?: { logs?: Array<{ id: string }> } };
          };
        };
        return (
          win.gameSocket?.connected &&
          win._playwrightMocks?.lastSession?.state?.logs?.some(
            (l) => l.id === msgId,
          )
        );
      },
      'msg-active',
      { timeout: 10000 },
    );

    // Verify Chat Bubble
    // Verify Chat Bubble exists in DOM
    const bubble = page.getByTestId('chat-bubble');
    await bubble.waitFor({ state: 'attached', timeout: 15000 });
    await expect(bubble).toBeVisible({ timeout: 5000 });
    await expect(bubble).toHaveText(/Challenge me!/i);

    // Verify Sea Battle challenge popup is visible
    const challengeButton = page.getByTestId('challenge-button');
    await expect(challengeButton).toBeVisible({ timeout: 15000 });

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
