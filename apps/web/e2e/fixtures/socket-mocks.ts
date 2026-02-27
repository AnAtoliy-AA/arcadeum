import { type Page } from '@playwright/test';

export interface MockHandler {
  responseEvent: string;
  responseData: unknown;
}

export interface PlaywrightMocks {
  roomId?: string;
  userId?: string;
  gameId?: string;
  roomJoinedPayload?: Record<string, unknown>;
  handlers: Record<string, MockHandler>;
  [key: string]: unknown;
  lastSession?: unknown;
}

export interface MockSocket {
  _isGlobalMocked?: boolean;
  _mockListeners?: Record<string, ((...args: unknown[]) => void)[]>;
  on: (event: string, fn: (...args: unknown[]) => void) => MockSocket;
  off: (event: string, fn: (...args: unknown[]) => void) => MockSocket;
  trigger: (event: string, ...args: unknown[]) => void;
  connected: boolean;
  connect: () => MockSocket;
  disconnect: () => MockSocket;
  emit: (event: string, ...args: unknown[]) => MockSocket;
}

declare global {
  interface Window {
    isPlaywright?: boolean;
    _playwrightMocks?: PlaywrightMocks;
    _socketMocksInitialized?: boolean;
    gameSocket?: MockSocket;
    chatSocket?: MockSocket;
    process?: {
      env: {
        NODE_ENV?: string;
        NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED?: string;
        [key: string]: string | undefined;
      };
    };
  }
}

export interface MockGameSocketOverrides {
  roomJoinedPayload?: Record<string, unknown>;
  handlers?: Record<string, MockHandler>;
  gameId?: string;
}

export async function mockGameSocket(
  page: Page,
  roomId: string,
  userId: string,
  overrides: MockGameSocketOverrides = {},
): Promise<void> {
  const {
    roomJoinedPayload = {},
    handlers = {},
    gameId = 'critical_v1',
  } = overrides;
  await page.addInitScript(
    ({ roomId, userId, roomJoinedPayload, handlers, gameId }) => {
      window._playwrightMocks = window._playwrightMocks || { handlers: {} };
      window._playwrightMocks.roomId = roomId;
      window._playwrightMocks.userId = userId;
      window._playwrightMocks.gameId = gameId;
      window._playwrightMocks.roomJoinedPayload = roomJoinedPayload;
      window._playwrightMocks.handlers = {
        ...window._playwrightMocks.handlers,
        ...handlers,
      };

      const setupSocketMock = (prop: 'gameSocket' | 'chatSocket') => {
        let isConnected = true;
        let actual: MockSocket | null = null;
        const wrap = (s: MockSocket) => {
          if (!s || s._isGlobalMocked) return;
          s._isGlobalMocked = true;
          s._mockListeners = {};
          const originalOn = s.on.bind(s);
          s.on = (event: string, fn: (...args: unknown[]) => void) => {
            s._mockListeners![event] = s._mockListeners![event] || [];
            s._mockListeners![event].push(fn);
            return originalOn(event, fn);
          };
          const originalOff = s.off.bind(s);
          s.off = (event: string, fn: (...args: unknown[]) => void) => {
            if (s._mockListeners![event]) {
              s._mockListeners![event] = s._mockListeners![event].filter(
                (l) => l !== fn,
              );
            }
            return originalOff(event, fn);
          };
          s.trigger = (event: string, ...args: unknown[]) => {
            const listeners =
              (s._mockListeners && s._mockListeners[event]) || [];
            listeners.forEach((l) => l(...args));
          };
          const originalConnectedProperty = s.connected;
          Object.defineProperty(s, 'connected', {
            get() {
              if (window._playwrightMocks?.roomId) return isConnected;
              return originalConnectedProperty;
            },
            configurable: true,
          });
          s.on('connect', () => {
            isConnected = true;
          });
          s.on('disconnect', () => {
            isConnected = false;
          });
          s.connect = () => {
            isConnected = true;
            setTimeout(() => s.trigger('connect'), 500);
            return s;
          };
          s.disconnect = () => {
            isConnected = false;
            setTimeout(() => s.trigger('disconnect'), 10);
            return s;
          };
          const originalEmit = s.emit.bind(s);
          s.emit = (event: string, ...args: unknown[]) => {
            const mocks = window._playwrightMocks;

            if (
              mocks &&
              (event === 'games.room.join' || event === 'games.room.watch') &&
              mocks.roomId
            ) {
              const joinedPayload =
                (mocks.roomJoinedPayload as Record<string, unknown>) || {};
              const p = {
                success: true,
                room: {
                  id: mocks.roomId,
                  status: 'lobby',
                  gameId: mocks.gameId || 'critical_v1',
                  hostId: mocks.userId,
                  playerCount: 1,
                  members: [
                    {
                      id: mocks.userId,
                      userId: mocks.userId,
                      displayName: 'Test User',
                      isHost: true,
                    },
                  ],
                  ...joinedPayload,
                },
                session:
                  joinedPayload.session !== undefined
                    ? joinedPayload.session
                    : (mocks as PlaywrightMocks).lastSession,
              };

              setTimeout(() => s.trigger('games.room.joined', p), 500);
              return s;
            }
            if (mocks?.handlers && mocks.handlers[event]) {
              const h = mocks.handlers[event];

              setTimeout(() => s.trigger(h.responseEvent, h.responseData), 100);
              return s;
            }
            if (mocks?.roomId && prop === 'gameSocket') {
              return s;
            }
            return originalEmit(event, ...args);
          };
        };
        Object.defineProperty(window, prop, {
          get() {
            return actual;
          },
          set(s) {
            actual = s;
            if (s) wrap(s);
          },
          configurable: true,
        });
      };
      (['gameSocket', 'chatSocket'] as const).forEach(
        (prop: 'gameSocket' | 'chatSocket') => setupSocketMock(prop),
      );
    },
    { roomId, userId, roomJoinedPayload, handlers, gameId },
  );
}

export async function mockAllOnPage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.isPlaywright = true;

    const setupSocketMock = (prop: 'gameSocket' | 'chatSocket') => {
      let isConnected = true;
      let actual: MockSocket | null = null;

      const wrap = (s: MockSocket) => {
        if (!s || s._isGlobalMocked) return;
        s._isGlobalMocked = true;
        s._mockListeners = {};

        const originalOn = s.on.bind(s);
        s.on = (event: string, fn: (...args: unknown[]) => void) => {
          s._mockListeners![event] = s._mockListeners![event] || [];
          s._mockListeners![event].push(fn);
          return originalOn(event, fn);
        };

        const originalOff = s.off.bind(s);
        s.off = (event: string, fn: (...args: unknown[]) => void) => {
          if (s._mockListeners![event]) {
            s._mockListeners![event] = s._mockListeners![event].filter(
              (l) => l !== fn,
            );
          }
          return originalOff(event, fn);
        };

        s.trigger = (event: string, ...args: unknown[]) => {
          const listeners = (s._mockListeners && s._mockListeners[event]) || [];
          listeners.forEach((l) => l(...args));
        };

        const originalConnectedProperty = s.connected;
        Object.defineProperty(s, 'connected', {
          get() {
            if (window._playwrightMocks?.roomId) return isConnected;
            return originalConnectedProperty;
          },
          configurable: true,
        });
        s.on('connect', () => {
          isConnected = true;
        });
        s.on('disconnect', () => {
          isConnected = false;
        });
        s.connect = () => {
          isConnected = true;
          setTimeout(() => s.trigger('connect'), 50);
          return s;
        };
        s.disconnect = () => {
          isConnected = false;
          setTimeout(() => s.trigger('disconnect'), 10);
          return s;
        };
        const originalEmit = s.emit.bind(s);
        s.emit = (event: string, ...args: unknown[]) => {
          const mocks = window._playwrightMocks;
          if (
            mocks &&
            (event === 'games.room.join' || event === 'games.room.watch') &&
            mocks.roomId
          ) {
            const joinedPayload =
              (mocks.roomJoinedPayload as Record<string, unknown>) || {};
            const p = {
              success: true,
              room: {
                id: mocks.roomId,
                status: 'lobby',
                gameId: mocks.gameId || 'critical_v1',
                hostId: mocks.userId,
                playerCount: 1,
                members: [
                  {
                    id: mocks.userId,
                    userId: mocks.userId,
                    displayName: 'Test User',
                    isHost: true,
                  },
                ],
                ...joinedPayload,
              },
              session:
                joinedPayload.session !== undefined
                  ? joinedPayload.session
                  : (mocks as PlaywrightMocks).lastSession,
            };
            setTimeout(() => s.trigger('games.room.joined', p), 500);
            return s;
          }
          if (mocks?.handlers && mocks.handlers[event]) {
            const h = mocks.handlers[event];
            setTimeout(() => s.trigger(h.responseEvent, h.responseData), 100);
            return s;
          }
          if (mocks?.roomId && prop === 'gameSocket') return s;
          return originalEmit(event, ...args);
        };
      };
      Object.defineProperty(window, prop, {
        get() {
          return actual;
        },
        set(s) {
          actual = s;
          if (s) wrap(s);
        },
        configurable: true,
      });
    };
    (['gameSocket', 'chatSocket'] as const).forEach(
      (prop: 'gameSocket' | 'chatSocket') => setupSocketMock(prop),
    );
  });
}

export interface MockChatSocketOverrides {
  handlers?: Record<string, MockHandler>;
}

export async function mockChatSocket(
  page: Page,
  overrides: MockChatSocketOverrides = {},
): Promise<void> {
  const { handlers = {} } = overrides;
  await page.addInitScript(
    ({ handlers }) => {
      window._playwrightMocks = window._playwrightMocks || { handlers: {} };
      window._playwrightMocks.handlers = {
        ...window._playwrightMocks.handlers,
        ...handlers,
      };
    },
    { handlers },
  );
}
