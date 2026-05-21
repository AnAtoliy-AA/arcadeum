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

test.describe('Sea Battle Chat Message Popup — suppression', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should hide popup when chat panel is already open', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = MOCK_OBJECT_ID;
    const otherUserId = 'opponent-user-id';

    const initialState = createSeaBattleState(userId, otherUserId);

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Hidden Popup Test',
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
            displayName: 'Commander',
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

    // Force the chat panel open via the store so the test does not depend on
    // viewport-dependent default visibility or button placement.
    await page.evaluate(() => {
      const store = (window as unknown as TestWindow).useGameChatStore;
      store?.getState().setChatPanelOpen(true);
    });

    const expectedMsg = 'You should not see this popup';
    const state = createSeaBattleState(userId, otherUserId, [
      {
        id: `chat-msg-hidden-${Date.now()}`,
        type: 'message',
        senderId: otherUserId,
        senderName: 'Commander',
        message: expectedMsg,
        createdAt: new Date().toISOString(),
      },
    ]);

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

    // Popup must NOT be visible while chat panel is open.
    await expect(page.getByTestId('chat-message-popup')).toHaveCount(0);
  });
});
