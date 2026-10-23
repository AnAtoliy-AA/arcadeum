import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('In-game chat text messaging', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('types and sends chat message in room', async ({ page }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = MOCK_OBJECT_ID;
    const opponentId = 'opponent-456';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Chat Room',
        gameId: 'tic_tac_toe_v1',
        status: 'lobby',
        members: [
          {
            id: userId,
            userId,
            displayName: 'Me',
            isHost: true,
          },
          {
            id: opponentId,
            userId: opponentId,
            displayName: 'Opponent',
            isHost: false,
          },
        ],
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'tic_tac_toe_v1',
      roomJoinedPayload: {
        status: 'lobby',
      },
    });

    await page.goto(routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const chatInput = page.getByTestId('chat-input');
    const isVisible = await chatInput.isVisible();
    if (!isVisible) {
      const toggleChatBtn = page.getByTestId('toggle-chat-button');
      if (await toggleChatBtn.isVisible()) {
        await toggleChatBtn.click();
      }
    }
    await expect(chatInput).toBeVisible();

    await chatInput.fill('Hello in-game chat!');
    await expect(chatInput).toHaveValue('Hello in-game chat!');

    const sendBtn = page.getByTestId('chat-send-btn');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    await expect(chatInput).toHaveValue('');

    await page.evaluate(() => {
      const socket = (
        window as unknown as {
          gameSocket?: {
            trigger: (event: string, payload: unknown) => void;
          };
        }
      ).gameSocket;
      socket?.trigger('games.room.chat', {
        id: 'msg-1',
        type: 'message',
        message: 'Hello in-game chat!',
        senderId: 'user_mock_object_id_000001',
        senderName: 'Me',
        scope: 'all',
        createdAt: new Date().toISOString(),
      });
    });

    const chatMsg = page
      .getByTestId('chat-message')
      .filter({ hasText: 'Hello in-game chat!' });
    await expect(chatMsg).toBeVisible();
  });
});
