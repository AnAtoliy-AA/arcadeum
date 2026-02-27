import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
  waitForRoomReady,
} from './fixtures/test-utils';

test.describe('Idle Detection', () => {
  const roomId = MOCK_OBJECT_ID;

  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, 'user-1');
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'in_progress',
        visibility: 'public',
        members: [
          { id: 'user-1', displayName: 'Test User', isHost: true },
          { id: 'user-2', displayName: 'Opponent', isHost: false },
        ],
      },
    });
  });

  test('should track idle players in store when idle_changed event is received', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const idleBefore = await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const store = win.__ZUSTAND_GAME_STORE__ as
        | { getState: () => { idlePlayers: string[] } }
        | undefined;
      return store?.getState?.()?.idlePlayers ?? [];
    });
    expect(idleBefore).toEqual([]);

    await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const socket = win.gameSocket as
        | {
            trigger?: (event: string, ...args: unknown[]) => void;
            listeners?: (event: string) => ((...args: unknown[]) => void)[];
          }
        | undefined;
      if (socket) {
        if (typeof socket.trigger === 'function') {
          socket.trigger('games.player.idle_changed', {
            userId: 'user-2',
            idle: true,
          });
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('games.player.idle_changed');
          for (const handler of handlers) {
            handler({ userId: 'user-2', idle: true });
          }
        }
      }
    });

    // Wait for store to update
    await page.waitForFunction(
      () => {
        const win = window as unknown as Record<string, unknown>;
        const store = win.__ZUSTAND_GAME_STORE__ as
          | { getState: () => { idlePlayers: string[] } }
          | undefined;
        return store?.getState?.()?.idlePlayers?.includes('user-2');
      },
      { timeout: 5000 },
    );

    const idleAfter = await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const store = win.__ZUSTAND_GAME_STORE__ as
        | { getState: () => { idlePlayers: string[] } }
        | undefined;
      return store?.getState?.()?.idlePlayers ?? [];
    });
    expect(idleAfter).toContain('user-2');
  });

  test('should remove player from idle list when active event is received', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const socket = win.gameSocket as
        | {
            trigger?: (event: string, ...args: unknown[]) => void;
            listeners?: (event: string) => ((...args: unknown[]) => void)[];
          }
        | undefined;
      if (socket) {
        if (typeof socket.trigger === 'function') {
          socket.trigger('games.player.idle_changed', {
            userId: 'user-2',
            idle: true,
          });
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('games.player.idle_changed');
          for (const handler of handlers) {
            handler({ userId: 'user-2', idle: true });
          }
        }
      }
    });

    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const socket = win.gameSocket as
        | {
            trigger?: (event: string, ...args: unknown[]) => void;
            listeners?: (event: string) => ((...args: unknown[]) => void)[];
          }
        | undefined;
      if (socket) {
        if (typeof socket.trigger === 'function') {
          socket.trigger('games.player.idle_changed', {
            userId: 'user-2',
            idle: false,
          });
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('games.player.idle_changed');
          for (const handler of handlers) {
            handler({ userId: 'user-2', idle: false });
          }
        }
      }
    });

    await page.waitForTimeout(300);

    const idleAfterActive = await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const store = win.__ZUSTAND_GAME_STORE__ as
        | { getState: () => { idlePlayers: string[] } }
        | undefined;
      return store?.getState?.()?.idlePlayers ?? [];
    });
    expect(idleAfterActive).not.toContain('user-2');
  });
});
