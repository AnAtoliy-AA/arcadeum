import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
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

test.describe('Cascade lobby', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('Start with bots emits cascade.session.start with the bot count', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Cascade Bot Test',
        gameId: 'cascade_v1',
        maxPlayers: 10,
        hostId: userId,
        gameOptions: { variant: 'cosmic', stackingEnabled: true },
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        gameId: 'cascade_v1',
        maxPlayers: 10,
        room: {
          id: roomId,
          name: 'Cascade Bot Test',
          gameId: 'cascade_v1',
          maxPlayers: 10,
          hostId: userId,
          gameOptions: { variant: 'cosmic', stackingEnabled: true },
          members: [
            { id: userId, userId, displayName: 'Test User', isHost: true },
          ],
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

    // Surface the Cascade lobby — there should be a Start with bots affordance.
    const startBtn = page.getByTestId('start-with-bots-button');
    await expect(startBtn).toBeVisible({});
    await startBtn.click();

    await expect
      .poll(async () => {
        const events = await page.evaluate(
          () =>
            (window as unknown as { _emittedEvents: EmittedEvent[] })
              ._emittedEvents,
        );
        return events.find(
          (e: EmittedEvent) => e.event === 'cascade.session.start',
        )?.payload;
      }, {})
      .toMatchObject({
        roomId,
        userId,
        withBots: true,
      });
  });
});
