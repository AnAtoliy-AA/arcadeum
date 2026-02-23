import { expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Valid MongoDB ObjectId for testing to avoid "Cast to ObjectId failed" errors
 */
export const MOCK_OBJECT_ID = '507f191e810c19729de860ea';

/**
 * Shared test utilities for e2e tests
 */

/**
 * Wait for page to be fully loaded (no network activity)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('load');
}

/**
 * Check if an element is visible on the page
 */
export async function isElementVisible(
  page: Page,
  selector: string,
): Promise<boolean> {
  const element = page.locator(selector);
  return element.isVisible();
}

/**
 * Navigate and wait for load
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Assert page title contains text
 */
export async function assertTitleContains(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
}

/**
 * Assert element with text is visible
 */
export async function assertTextVisible(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page.getByText(text, { exact: false })).toBeVisible();
}

/**
 * Get all links from the page
 */
export async function getPageLinks(
  page: Page,
): Promise<{ href: string; text: string }[]> {
  const links = await page.locator('a[href]').all();
  const results: { href: string; text: string }[] = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    if (href) {
      results.push({ href, text: text?.trim() || '' });
    }
  }

  return results;
}
/**
 * Mock a logged-in session in localStorage
 */
export async function mockSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const mockSnapshot = {
      state: {
        snapshot: {
          provider: 'local',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          tokenType: 'Bearer',
          accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          role: 'user',
        },
      },
      version: 0,
    };
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify(mockSnapshot),
    );
  });
}

/**
 * Close Sea Battle rules modal if it's visible.
 * This is useful to clear the screen for interaction in E2E tests.
 */
export async function closeRulesModal(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: '×' });
  try {
    await closeButton.waitFor({ state: 'visible', timeout: 3000 });
    await closeButton.click({ force: true });
    await closeButton.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // Modal might not have appeared or already closed
  }
}

/**
 * Mock room info response for POST /games/room-info
 */
export async function mockRoomInfo(
  page: Page,
  overrides: {
    room?: Record<string, unknown>;
    session?: Record<string, unknown> | null;
  } = {},
): Promise<void> {
  const { room: roomOverrides = {}, session = null } = overrides;

  const defaultRoom = {
    id: MOCK_OBJECT_ID,
    name: 'Test Room',
    gameId: 'critical_v1',
    status: 'lobby',
    playerCount: 1,
    maxPlayers: 4,
    hostId: 'user-1',
    members: [
      {
        id: 'user-1',
        userId: 'user-1',
        displayName: 'Test User',
        isHost: true,
      },
    ],
  };

  const room = { ...defaultRoom, ...roomOverrides };

  await page.route('**/games/room-info', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room, session }),
    });
  });
}

/**
 * Mock game socket events to avoid hitting the real backend
 */
export async function mockGameSocket(
  page: Page,
  roomId: string,
  userId: string,
  overrides: {
    roomJoinedPayload?: Record<string, unknown>;
    handlers?: Record<string, { responseEvent: string; responseData: unknown }>;
  } = {},
): Promise<void> {
  const { roomJoinedPayload = {}, handlers = {} } = overrides;

  await page.addInitScript(
    ({ roomId, userId, roomJoinedPayload, handlers }) => {
      // Logic to intercept gameSocket as soon as it's attached to window
      const mockPayload = {
        success: true,
        room: {
          id: roomId,
          status: 'lobby',
          gameId: 'critical_v1',
          hostId: userId,
          playerCount: 1,
          members: [
            {
              id: userId,
              userId,
              displayName: 'Test User',
              isHost: true,
            },
          ],
          ...roomJoinedPayload,
        },
        session: roomJoinedPayload.session || null,
      };

      let gameSocket: unknown = null;

      Object.defineProperty(window, 'gameSocket', {
        get() {
          return gameSocket;
        },
        set(socket) {
          gameSocket = socket;
          if (socket && !socket._isMocked) {
            socket._isMocked = true;
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                setTimeout(() => {
                  const listeners = socket.listeners('games.room.joined');
                  for (const listener of listeners) {
                    listener(mockPayload);
                  }
                }, 50);
                return;
              }

              if (handlers && handlers[event]) {
                const handler = handlers[event];
                const emit = (resEvent: string, resData: unknown) => {
                  const attemptEmit = (attempts = 0) => {
                    const listeners = socket.listeners(resEvent);
                    if (listeners && listeners.length > 0) {
                      for (const listener of listeners) {
                        listener(resData);
                      }
                    } else if (attempts < 100) {
                      setTimeout(() => attemptEmit(attempts + 1), 50);
                    }
                  };
                  setTimeout(() => attemptEmit(0), 50);
                };
                emit(handler.responseEvent, handler.responseData);
                return;
              }

              // Silence seaBattle events by default to avoid backend warnings
              if (event.startsWith('seaBattle.session.')) {
                return;
              }

              return originalEmit(event, payload);
            };
          }
        },
        configurable: true,
      });
    },
    { roomId, userId, roomJoinedPayload, handlers },
  );
}

/**
 * Mock chat socket events
 */
export async function mockChatSocket(page: Page): Promise<void> {
  await page.addInitScript(() => {
    let chatSocket: unknown = null;

    Object.defineProperty(window, 'chatSocket', {
      get() {
        return chatSocket;
      },
      set(socket) {
        chatSocket = socket;
        if (socket && !socket._isMocked) {
          socket._isMocked = true;
          // Force connected state for UI
          Object.defineProperty(socket, 'connected', {
            get() {
              return true;
            },
            configurable: true,
          });

          const originalEmit = socket.emit.bind(socket);
          socket.emit = (event: string, payload: unknown) => {
            if (
              event === 'chat.messages.get' ||
              event === 'chat.message.send'
            ) {
              // Silence these if we are mocking HTTP
              return;
            }
            return originalEmit(event, payload);
          };
        }
      },
      configurable: true,
    });
  });
}

/**
 * Check for backend errors in the shared log file
 */
export function checkNoBackendErrors() {
  // Path to the log file in the monorepo root
  const logPath = path.join(process.cwd(), '../../backend-e2e-errors.log');

  if (fs.existsSync(logPath)) {
    const errors = fs.readFileSync(logPath, 'utf8');
    if (errors.trim()) {
      // Clear the file for the next test run
      fs.writeFileSync(logPath, '');
      throw new Error(`Backend [GamesGateway] errors detected:\n${errors}`);
    }
  }
}

/**
 * Reset backend error log
 */
export function resetBackendErrorLog() {
  const logPath = path.join(process.cwd(), '../../backend-e2e-errors.log');
  if (fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '');
  }
}
