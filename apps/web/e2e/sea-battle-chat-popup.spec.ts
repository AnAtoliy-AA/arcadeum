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
            animation-duration: 10s !important;
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

    // Wait for socket and store to be ready
    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        const store = (window as unknown as TestWindow).useGameChatStore;
        return (
          socket?.connected &&
          socket._mockListeners?.['games.session.snapshot'] &&
          !!store
        );
      },
      { timeout: 60000 },
    );

    const expectedMsg = 'Prepare for battle!';
    const state = createSeaBattleState(userId, otherUserId, [
      {
        id: `chat-msg-opponent-${Date.now()}`,
        type: 'message',
        senderId: otherUserId,
        senderName: 'Admiral',
        message: expectedMsg,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Robustly trigger snapshot until store is updated (handles Mobile Safari race conditions)
    await expect
      .poll(
        async () => {
          await page.evaluate(
            ({ roomId, state }) => {
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
            { roomId, state },
          );

          return await page.evaluate((msg) => {
            const store = (window as unknown as TestWindow).useGameChatStore;
            return store?.getState().logs.some((l) => l.message === msg);
          }, expectedMsg);
        },
        { timeout: 30000, intervals: [1000] },
      )
      .toBe(true);

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

    // Wait for socket and store to be ready
    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        const store = (window as unknown as TestWindow).useGameChatStore;
        return (
          socket?.connected &&
          socket._mockListeners?.['games.session.snapshot'] &&
          !!store
        );
      },
      { timeout: 60000 },
    );

    const expectedMsg = 'I will sink you!';
    const state = createSeaBattleState(userId, otherUserId, [
      {
        id: `chat-msg-opponent-${Date.now()}`,
        type: 'message',
        senderId: otherUserId,
        senderName: 'Captain',
        message: expectedMsg,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Robustly trigger snapshot until store is updated
    await expect
      .poll(
        async () => {
          await page.evaluate(
            ({ roomId, state }) => {
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
            { roomId, state },
          );

          return await page.evaluate((msg) => {
            const store = (window as unknown as TestWindow).useGameChatStore;
            return store?.getState().logs.some((l) => l.message === msg);
          }, expectedMsg);
        },
        { timeout: 30000, intervals: [1000] },
      )
      .toBe(true);

    const popup = page.getByTestId('chat-message-popup');
    await expect(popup.getByText('Captain', { exact: false })).toBeVisible();
    await expect(popup).toBeVisible();

    // Wait for the 3s auto-dismiss animation to complete (we set it to 3s in init script)
    await expect(page.getByTestId('chat-message-popup')).not.toBeVisible({
      timeout: 15000,
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

    // Wait for socket and store to be ready
    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        const store = (window as unknown as TestWindow).useGameChatStore;
        return (
          socket?.connected &&
          socket._mockListeners?.['games.session.snapshot'] &&
          !!store
        );
      },
      { timeout: 60000 },
    );

    const expectedMsg = 'My own message';
    const state = createSeaBattleState(userId, otherUserId, [
      {
        id: `chat-msg-own-${Date.now()}`,
        type: 'message',
        senderId: userId,
        senderName: 'Me',
        message: expectedMsg,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Robustly trigger snapshot until store is updated
    await expect
      .poll(
        async () => {
          await page.evaluate(
            ({ roomId, state }) => {
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
            { roomId, state },
          );

          return await page.evaluate((msg) => {
            const store = (window as unknown as TestWindow).useGameChatStore;
            return store?.getState().logs.some((l) => l.message === msg);
          }, expectedMsg);
        },
        { timeout: 30000, intervals: [1000] },
      )
      .toBe(true);

    const popup = page.getByTestId('chat-message-popup');
    await expect(
      popup.getByText('My own message', { exact: false }),
    ).toBeVisible();
  });
});
