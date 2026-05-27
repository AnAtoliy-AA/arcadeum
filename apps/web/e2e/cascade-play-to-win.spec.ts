import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';

interface EmittedEvent {
  event: string;
  payload: unknown;
}

interface MockSocket {
  emit: (event: string, ...args: unknown[]) => MockSocket;
  bind: (context: unknown) => (...args: unknown[]) => MockSocket;
}

test.describe('Cascade play to win', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('mid-game render → play the last playable card → game-over modal appears', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const sessionId = '507f191e810c19729de860f1';

    // Pre-built mid-game state: it's `userId`'s turn, R5 on top, hand is a
    // single R5 — so playing it empties the hand and wins.
    const winningState = {
      phase: 'playing',
      options: { variant: 'cosmic', stackingEnabled: true },
      players: [
        {
          playerId: userId,
          alive: true,
          hand: [{ id: 'r5', color: 'R', kind: 'NUMBER', value: 5 }],
        },
        {
          playerId: 'bot-1',
          alive: true,
          hand: new Array(7).fill({}),
        },
      ],
      playerOrder: [userId, 'bot-1'],
      currentTurnIndex: 0,
      direction: 1,
      drawPile: [],
      discardPile: [{ id: 'top', color: 'R', kind: 'NUMBER', value: 9 }],
      topCard: { id: 'top', color: 'R', kind: 'NUMBER', value: 9 },
      activeColor: 'R',
      pendingDraw: 0,
      pendingStackKind: null,
      pendingAction: 'none',
      winnerId: null,
      logs: [],
    };

    const gameOverState = {
      ...winningState,
      phase: 'game_over',
      winnerId: userId,
      players: [
        { ...winningState.players[0], hand: [] },
        winningState.players[1],
      ],
      topCard: { id: 'r5', color: 'R', kind: 'NUMBER', value: 5 },
      discardPile: [
        ...winningState.discardPile,
        { id: 'r5', color: 'R', kind: 'NUMBER', value: 5 },
      ],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Cascade Win Test',
        gameId: 'cascade_v1',
        maxPlayers: 10,
        hostId: userId,
        status: 'in_progress',
        gameOptions: { variant: 'cosmic', stackingEnabled: true },
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
      session: {
        id: sessionId,
        status: 'active',
        state: winningState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      // socket-mocks.ts spreads roomJoinedPayload directly INTO the room
      // object on `games.room.joined`, so status / hostId / members /
      // gameOptions must be at the top level — a nested `room` key would
      // be ignored.
      roomJoinedPayload: {
        name: 'Cascade Win Test',
        gameId: 'cascade_v1',
        maxPlayers: 10,
        status: 'in_progress',
        hostId: userId,
        gameOptions: { variant: 'cosmic', stackingEnabled: true },
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
        session: {
          id: sessionId,
          status: 'active',
          state: winningState,
        },
      },
      handlers: {
        'cascade.session.play_card': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: sessionId,
              status: 'completed',
              state: gameOverState,
            },
          },
        },
      },
    });

    await page.addInitScript(() => {
      (window as unknown as { _emittedEvents: EmittedEvent[] })._emittedEvents =
        [];
      const poll = setInterval(() => {
        const s = (window as unknown as { gameSocket: MockSocket }).gameSocket;
        if (s) {
          clearInterval(poll);
          const originalEmit = s.emit.bind(s);
          s.emit = (event: string, payload: unknown) => {
            (
              window as unknown as { _emittedEvents: EmittedEvent[] }
            )._emittedEvents.push({ event, payload });
            return originalEmit(event, payload);
          };
        }
      }, 50);
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeRulesModal(page);

    // Wait for the in-game UI to mount — the discard top card (Red 9) is
    // guaranteed to render once the snapshot lands. This also rules out
    // mis-mocked room status that would leave us stuck on the lobby.
    await expect(
      page.getByRole('button', { name: /red 9/i }).first(),
    ).toBeVisible({ timeout: 10000 });

    // In-game UI: the user's lone playable card should be rendered.
    const playableCard = page.getByRole('button', { name: /red 5/i }).first();
    await expect(playableCard).toBeVisible({});
    await playableCard.click();

    // Emit should fire.
    await expect
      .poll(async () => {
        const events = await page.evaluate(
          () =>
            (window as unknown as { _emittedEvents: EmittedEvent[] })
              ._emittedEvents,
        );
        return events.find(
          (e: EmittedEvent) => e.event === 'cascade.session.play_card',
        )?.payload;
      }, {})
      .toMatchObject({
        roomId,
        userId,
        cardId: 'r5',
      });

    // Game-over modal should appear after the mocked server snapshot arrives.
    await expect(
      page.getByRole('heading', { name: /you won/i }),
    ).toBeVisible({});
  });
});
