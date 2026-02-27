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
    await mockGameSocket(page, roomId, 'user-1');
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'in_progress',
        visibility: 'public',
        members: [{ id: 'user-1', displayName: 'Test User', isHost: true }],
      },
    });
  });

  test('should show connection overlay when socket disconnects', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

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

    await expect(overlay).toBeVisible({ timeout: 5000 });
    await expect(overlay).toContainText(
      /Connection Lost|Connexion perdue|Conexión perdida|Злучэнне страчана|Соединение потеряно/,
    );
  });

  test('should reconnect when user clicks the overlay', async ({ page }) => {
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
          socket.trigger('disconnect', 'transport close');
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('disconnect');
          for (const handler of handlers) {
            handler('transport close');
          }
        }
      }
    });

    const overlay = page.getByTestId('connection-overlay-disconnected');
    await expect(overlay).toBeVisible({ timeout: 5000 });

    await overlay.click();

    await expect(overlay).toContainText(
      /Reconnecting|Reconectando|Reconnexion|Пераключэнне|Переподключение/,
    );
  });

  test('should keep game content visible beneath the overlay', async ({
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
          socket.trigger('disconnect', 'transport close');
        } else if (typeof socket.listeners === 'function') {
          const handlers = socket.listeners('disconnect');
          for (const handler of handlers) {
            handler('transport close');
          }
        }
      }
    });

    const overlay = page.getByTestId('connection-overlay-disconnected');
    await expect(overlay).toBeVisible({ timeout: 5000 });

    const container = page.locator('main').first();
    await expect(container).toBeVisible();
  });
});
