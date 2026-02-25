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

test.describe('Sea Battle Bot Count Selection', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting 4 bots in Sea Battle and starting game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = 'user-1';

    // Set up room info mock BEFORE navigating to the page
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Bot Test',
        gameId: 'sea_battle_v1',
        maxPlayers: 5,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        gameId: 'sea_battle_v1',
        maxPlayers: 5,
        room: {
          id: roomId,
          name: 'Sea Battle Bot Test',
          gameId: 'sea_battle_v1',
          maxPlayers: 5,
          hostId: userId,
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
            console.log(`[TestInterceptor] Emitting ${event}`, payload);
            (
              window as unknown as { _emittedEvents: EmittedEvent[] }
            )._emittedEvents.push({ event, payload });
            return originalEmit(event, payload);
          };
          console.log('[TestInterceptor] Socket intercepted');
        }
      }, 50);
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeRulesModal(page);

    // Wait for the bot selection UI to be present
    await expect(page.locator('body')).toContainText(/bots|number of bots/i, {
      timeout: 20000,
    });

    const botButton4 = page.getByRole('button', { name: '4', exact: true });
    await expect(botButton4).toBeVisible({ timeout: 15000 });
    await botButton4.click();

    const startBtn = page.getByRole('button', { name: /Start with 4 🤖/i });
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();

    await expect
      .poll(
        async () => {
          const events = await page.evaluate(
            () =>
              (window as unknown as { _emittedEvents: EmittedEvent[] })
                ._emittedEvents,
          );
          return events.find(
            (e: EmittedEvent) => e.event === 'seaBattle.session.start',
          )?.payload;
        },
        {
          timeout: 15000,
        },
      )
      .toMatchObject({
        withBots: true,
        botCount: 4,
      });
  });
});
