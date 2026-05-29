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

/**
 * ARC-757 — Sea Battle uses the widget-level fullscreen (the button inside the
 * game widget header, distinct from the page-level control-panel toggle). It
 * must also auto-exit shortly after the game finishes.
 */
test.describe('Sea Battle widget fullscreen auto-exit on finish', () => {
  const roomId = '507f1f77bcf86cd799439011';
  const userId = MOCK_OBJECT_ID;
  const otherUserId = 'opponent-user-id';

  test('leaves widget fullscreen shortly after the session completes', async ({
    page,
  }) => {
    const initialState = createSeaBattleState(userId, otherUserId);

    await mockSession(page);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Fullscreen',
        gameId: 'sea_battle_v1',
        status: 'active',
        members: [
          { id: userId, userId, displayName: 'Me', isHost: true },
          {
            id: otherUserId,
            userId: otherUserId,
            displayName: 'Captain',
            isHost: false,
          },
        ],
      },
      session: { id: 'session-1', status: 'active', state: initialState },
    });
    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: { id: 'session-1', status: 'active', state: initialState },
      },
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await page.waitForFunction(
      () => {
        const socket = (window as unknown as TestWindow).gameSocket;
        return (
          socket?.connected &&
          !!socket._mockListeners?.['games.session.snapshot']
        );
      },
      { timeout: 60000 },
    );

    const widget = page.locator('.game-widget-container');

    // Enter the widget-level fullscreen.
    await page.getByTestId('widget-fullscreen-button').click();
    await expect(widget).toHaveClass(/is-fullscreen/);

    // Game finishes — real completion signal.
    await page.evaluate(
      ({ roomId, userId, state }) => {
        (window as unknown as TestWindow).gameSocket?.trigger(
          'games.session.snapshot',
          {
            roomId,
            session: {
              id: 'session-1',
              status: 'completed',
              state: { ...state, phase: 'game_over', winnerId: userId },
            },
          },
        );
      },
      { roomId, userId, state: initialState },
    );

    // Auto-exit fires after the delay (~1.5s).
    await expect(widget).not.toHaveClass(/is-fullscreen/, { timeout: 5000 });
  });
});
