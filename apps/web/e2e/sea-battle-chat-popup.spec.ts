import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';

const BOARD_SIZE = 10;

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0),
  );
}

function createSeaBattleState(
  userId: string,
  otherUserId: string,
  logs: Record<string, unknown>[] = [],
) {
  return {
    phase: 'battle',
    playerOrder: [userId, otherUserId],
    currentTurnIndex: 0,
    players: [
      {
        playerId: userId,
        alive: true,
        board: createEmptyBoard(),
        ships: [],
        shipsRemaining: 5,
        placementComplete: true,
      },
      {
        playerId: otherUserId,
        alive: true,
        board: createEmptyBoard(),
        ships: [],
        shipsRemaining: 5,
        placementComplete: true,
      },
    ],
    logs,
  };
}

test.describe('Sea Battle Chat Message Popup', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
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
              id: 'chat-msg-1',
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

    const popup = page.getByTestId('chat-message-popup');
    await expect(popup).toBeVisible({ timeout: 10000 });

    await expect(popup.getByText('Admiral')).toBeVisible({ timeout: 5000 });
    await expect(popup.getByText('Prepare for battle!')).toBeVisible({
      timeout: 5000,
    });
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
              id: 'chat-msg-dismiss',
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

    const popup = page.getByTestId('chat-message-popup');
    await expect(popup).toBeVisible({ timeout: 10000 });

    await expect(popup).not.toBeVisible({ timeout: 8000 });
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
              id: 'chat-msg-own',
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

    const popup = page.getByTestId('chat-message-popup');
    await expect(popup).toBeVisible({ timeout: 10000 });
    await expect(popup.getByText('My own message')).toBeVisible({
      timeout: 5000,
    });
  });
});
