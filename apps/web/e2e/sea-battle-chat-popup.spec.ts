import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';
import {
  createSeaBattleState,
  TestWindow,
} from './fixtures/sea-battle-chat-utils';

test.describe('Sea Battle Chat Message Popup', () => {
  test.use({
    contextOptions: {
      reducedMotion: 'no-preference',
    },
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    // Disable animations for stability but keep popup visible long enough to be caught
    await page.addInitScript(() => {
      try {
        const style = document.createElement('style');
        style.textContent = `
          * { 
            animation-duration: 0.1s !important; 
            animation-delay: 0s !important;
            transition-duration: 0.1s !important;
            transition-delay: 0s !important;
          }
          [data-testid="chat-message-popup"], 
          [data-testid="chat-message-popup"] * {
            animation-duration: 3s !important;
          }
        `;
        const container = document.head || document.documentElement;
        if (container) {
          container.appendChild(style);
        } else {
          // Fallback if neither head nor documentElement are ready
          const observer = new MutationObserver(() => {
            const target = document.head || document.documentElement;
            if (target) {
              target.appendChild(style);
              observer.disconnect();
            }
          });
          observer.observe(document, { childList: true, subtree: true });
        }
      } catch (e) {
        console.error('Animation kill script failed', e);
      }
    });
  });

  test('should show popup when opponent sends a chat message', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = MOCK_OBJECT_ID;
    const otherUserId = 'opponent-user-id';

    const initialState = createSeaBattleState(userId, otherUserId);

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Chat Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        members: [
          {
            id: userId,
            userId,
            displayName: 'Me',
            isHost: true,
          },
          {
            id: otherUserId,
            userId: otherUserId,
            displayName: 'Admiral',
            isHost: false,
          },
        ],
      },
      session: {
        id: 'session-1',
        status: 'active',
        state: initialState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          status: 'active',
          state: initialState,
        },
      },
    });

    await page.goto(`/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for socket to be connected and listener to be registered
    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        return (
          socket?.connected && socket._mockListeners?.['games.session.snapshot']
        );
      },
      { timeout: 60000 },
    );

    await page.evaluate(
      ({ otherUserId, roomId, userId }) => {
        const state = {
          phase: 'battle',
          playerOrder: [userId, otherUserId],
          currentTurnIndex: 0,
          players: [
            {
              playerId: userId,
              alive: true,
              board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0),
              ),
              ships: [],
              shipsRemaining: 5,
              placementComplete: true,
            },
            {
              playerId: otherUserId,
              alive: true,
              board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0),
              ),
              ships: [],
              shipsRemaining: 5,
              placementComplete: true,
            },
          ],
          logs: [
            {
              id: `chat-msg-opponent-${Date.now()}`,
              type: 'message',
              senderId: otherUserId,
              senderName: 'Admiral',
              message: 'Prepare for battle!',
              createdAt: new Date().toISOString(),
            },
          ],
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

    // Wait for store to have the logs
    await page.waitForFunction(
      (expectedMsg) => {
        const store = (window as unknown as TestWindow).useGameChatStore;
        return store?.getState().logs.some((l) => l.message === expectedMsg);
      },
      'Prepare for battle!',
      { timeout: 60000 },
    );

    const popup = page.getByTestId('chat-message-popup');
    await expect(popup.getByText('Admiral', { exact: false })).toBeVisible();
    await expect(
      popup.getByText('Prepare for battle!', { exact: false }),
    ).toBeVisible();
  });

  test('should auto-dismiss popup after timeout', async ({ page }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = MOCK_OBJECT_ID;
    const otherUserId = 'opponent-user-id';

    const initialState = createSeaBattleState(userId, otherUserId);

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Dismiss Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        members: [
          {
            id: userId,
            userId,
            displayName: 'Me',
            isHost: true,
          },
          {
            id: otherUserId,
            userId: otherUserId,
            displayName: 'Captain',
            isHost: false,
          },
        ],
      },
      session: {
        id: 'session-1',
        status: 'active',
        state: initialState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          status: 'active',
          state: initialState,
        },
      },
    });

    await page.goto(`/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for socket to be connected and listener to be registered
    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        return (
          socket?.connected && socket._mockListeners?.['games.session.snapshot']
        );
      },
      { timeout: 60000 },
    );

    await page.evaluate(
      ({ otherUserId, roomId, userId }) => {
        const state = {
          phase: 'battle',
          playerOrder: [userId, otherUserId],
          currentTurnIndex: 0,
          players: [
            {
              playerId: userId,
              alive: true,
              board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0),
              ),
              ships: [],
              shipsRemaining: 5,
              placementComplete: true,
            },
            {
              playerId: otherUserId,
              alive: true,
              board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0),
              ),
              ships: [],
              shipsRemaining: 5,
              placementComplete: true,
            },
          ],
          logs: [
            {
              id: `chat-msg-opponent-${Date.now()}`,
              type: 'message',
              senderId: otherUserId,
              senderName: 'Captain',
              message: 'I will sink you!',
              createdAt: new Date().toISOString(),
            },
          ],
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

    // Wait for store to have the logs
    await page.waitForFunction(
      (expectedMsg) => {
        const store = (window as unknown as TestWindow).useGameChatStore;
        return store?.getState().logs.some((l) => l.message === expectedMsg);
      },
      'I will sink you!',
      { timeout: 60000 },
    );

    const popup = page.getByTestId('chat-message-popup');
    await expect(popup.getByText('Captain', { exact: false })).toBeVisible();
    await expect(popup).toBeVisible();

    // Wait for the 3s auto-dismiss animation to complete (we set it to 3s in init script)
    await expect(page.getByTestId('chat-message-popup')).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('should also show popup for own messages', async ({ page }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = MOCK_OBJECT_ID;
    const otherUserId = 'opponent-user-id';

    const initialState = createSeaBattleState(userId, otherUserId);

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Own Message Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        members: [
          {
            id: userId,
            userId,
            displayName: 'Me',
            isHost: true,
          },
          {
            id: otherUserId,
            userId: otherUserId,
            displayName: 'Enemy',
            isHost: false,
          },
        ],
      },
      session: {
        id: 'session-1',
        status: 'active',
        state: initialState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          status: 'active',
          state: initialState,
        },
      },
    });

    await page.goto(`/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for socket to be connected and listener to be registered
    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        return (
          socket?.connected && socket._mockListeners?.['games.session.snapshot']
        );
      },
      { timeout: 60000 },
    );

    await page.evaluate(
      ({ userId, roomId, otherUserId }) => {
        const state = {
          phase: 'battle',
          playerOrder: [userId, otherUserId],
          currentTurnIndex: 0,
          players: [
            {
              playerId: userId,
              alive: true,
              board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0),
              ),
              ships: [],
              shipsRemaining: 5,
              placementComplete: true,
            },
            {
              playerId: otherUserId,
              alive: true,
              board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0),
              ),
              ships: [],
              shipsRemaining: 5,
              placementComplete: true,
            },
          ],
          logs: [
            {
              id: `chat-msg-own-${Date.now()}`,
              type: 'message',
              senderId: userId,
              senderName: 'Me',
              message: 'My own message',
              createdAt: new Date().toISOString(),
            },
          ],
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
      { userId, roomId, otherUserId },
    );

    // Wait for store to have the logs
    await page.waitForFunction(
      (expectedMsg) => {
        const store = (window as unknown as TestWindow).useGameChatStore;
        return store?.getState().logs.some((l) => l.message === expectedMsg);
      },
      'My own message',
      { timeout: 60000 },
    );

    const popup = page.getByTestId('chat-message-popup');
    await expect(
      popup.getByText('My own message', { exact: false }),
    ).toBeVisible();
  });
});
