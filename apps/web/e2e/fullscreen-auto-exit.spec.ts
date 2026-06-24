import { expect, test, mockGameSocket } from './fixtures/test-utils';
import { mockSession } from './fixtures/utils/auth';
import { mockRoomInfo, waitForRoomReady } from './fixtures/utils/room';

/**
 * ARC-757 — after a game finishes, the page should automatically leave
 * fullscreen a short moment later so the player returns to the normal chrome.
 */
test.describe('Fullscreen auto-exit on game finish', () => {
  const roomId = '507f191e810c19729de860ea';
  const userId = '507f191e810c19729de860ea';

  const opponentId = '507f191e810c19729de860e2';

  const members = [
    { id: userId, userId, displayName: 'Me', isHost: true },
    { id: opponentId, userId: opponentId, displayName: 'Rival', isHost: false },
  ];

  // A live (un-finished) Critical game state so the widget renders instead of
  // crashing on missing fields.
  const activeState = {
    players: [
      { playerId: userId, alive: true, hand: [], stash: [] },
      { playerId: opponentId, alive: true, hand: [], stash: [] },
    ],
    playerOrder: [userId, opponentId],
    currentTurnIndex: 0,
    deck: [],
    discardPile: [],
    logs: [],
  };

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Auto-exit Room',
        gameId: 'critical_v1',
        status: 'active',
        members,
      },
      session: { id: 'session-1', status: 'active', state: activeState },
    });
    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        members,
        session: { id: 'session-1', status: 'active', state: activeState },
      },
    });
  });

  test('leaves fullscreen shortly after the session status becomes completed', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // The real "game finished" signal is a session snapshot — wait for its
    // listener to be registered.
    await page.waitForFunction(
      () =>
        !!window.gameSocket?.connected &&
        !!window.gameSocket?._mockListeners?.['games.session.snapshot'],
      { timeout: 60000 },
    );

    const container = page.locator('.games-room-container');

    // Enter fullscreen.
    await page.getByTestId('fullscreen-button').click();
    await expect(container).toHaveClass(/is-fullscreen/);

    // Backend marks the game finished — this is the only event clients receive
    // on completion (room.status is NOT pushed to the client).
    await page.evaluate(
      ({ roomId, userId, opponentId }) => {
        window.gameSocket?.trigger('games.session.snapshot', {
          roomId,
          session: {
            id: 'session-1',
            status: 'completed',
            state: {
              players: [
                { playerId: userId, alive: true, hand: [], stash: [] },
                { playerId: opponentId, alive: false, hand: [], stash: [] },
              ],
              playerOrder: [userId, opponentId],
              currentTurnIndex: 0,
              deck: [],
              discardPile: [],
              logs: [],
              winnerId: userId,
            },
          },
        });
      },
      { roomId, userId, opponentId },
    );

    // Auto-exit fires after the delay (~1.5s) — allow generous slack.
    await expect(container).not.toHaveClass(/is-fullscreen/, { timeout: 5000 });
  });
});
