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

test.describe('Idle Connection Overlay', () => {
  const roomId = MOCK_OBJECT_ID;

  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, '507f191e810c19729de860ea');
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'lobby',
        visibility: 'public',
        members: [
          {
            id: '507f191e810c19729de860ea',
            displayName: 'Test User',
            isHost: true,
          },
        ],
      },
    });
  });

  test('should show connection overlay when socket disconnects', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for store to be connected first
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __ZUSTAND_GAME_STORE__?: { getState: () => { isConnected: boolean } };
      };
      return win.__ZUSTAND_GAME_STORE__?.getState()?.isConnected === true;
    });

    const overlay = page.getByTestId('connection-overlay-disconnected');
    await expect(overlay).not.toBeVisible();

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
          socket.trigger('disconnect', 'transport close');
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('disconnect');
          for (const handler of handlers) {
            handler('transport close');
          }
        }
      }
    });

    // Wait for store to reflect disconnection
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __ZUSTAND_GAME_STORE__?: { getState: () => { isConnected: boolean } };
      };
      return win.__ZUSTAND_GAME_STORE__?.getState()?.isConnected === false;
    });

    await expect(overlay).toBeVisible({});
    await expect(overlay).toContainText(
      /Connection Lost|Connexion perdue|Conexión perdida|Злучэнне страчана|Соединение потеряно/,
    );
  });

  test('should reconnect when user clicks the overlay', async ({ page }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for store to be connected first
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __ZUSTAND_GAME_STORE__?: { getState: () => { isConnected: boolean } };
      };
      return win.__ZUSTAND_GAME_STORE__?.getState()?.isConnected === true;
    });

    await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const socket = win.gameSocket as
        | {
            trigger?: (event: string, ...args: unknown[]) => void;
            listeners?: (event: string) => ((...args: unknown[]) => void)[];
            _mockConnected?: boolean;
          }
        | undefined;
      if (socket) {
        if (typeof socket._mockConnected !== 'undefined') {
          socket._mockConnected = false;
        }
        if (typeof socket.trigger === 'function') {
          socket.trigger('disconnect', 'transport close');
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('disconnect');
          for (const handler of handlers) {
            handler('transport close');
          }
        }
      }
    });

    // Wait for store to reflect disconnection
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __ZUSTAND_GAME_STORE__?: { getState: () => { isConnected: boolean } };
      };
      return win.__ZUSTAND_GAME_STORE__?.getState()?.isConnected === false;
    });

    const overlay = page.locator('[data-testid^="connection-overlay-"]');
    await expect(overlay).toBeVisible({});

    await overlay.click({});

    // Use a fresh locator to avoid detached element issues and include all translation variants
    await expect(
      page.locator('[data-testid^="connection-overlay-"]'),
    ).toContainText(
      /Reconnecting|Reconectando|Reconnexion|Пераключэнне|Переключэнне|Переподключение/,
      { timeout: 3000 },
    );
  });

  test('should keep game content visible beneath the overlay', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for store to be connected first
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __ZUSTAND_GAME_STORE__?: { getState: () => { isConnected: boolean } };
      };
      return win.__ZUSTAND_GAME_STORE__?.getState()?.isConnected === true;
    });

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
          socket.trigger('disconnect', 'transport close');
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('disconnect');
          for (const handler of handlers) {
            handler('transport close');
          }
        }
      }
    });

    // Wait for store to reflect disconnection
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __ZUSTAND_GAME_STORE__?: { getState: () => { isConnected: boolean } };
      };
      return win.__ZUSTAND_GAME_STORE__?.getState()?.isConnected === false;
    });

    const overlay = page.getByTestId('connection-overlay-disconnected');
    await expect(overlay).toBeVisible({});

    const container = page.locator('main').first();
    await expect(container).toBeVisible();
  });
});
