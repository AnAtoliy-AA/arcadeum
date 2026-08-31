import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from './api-base';
import {
  maybeEncrypt,
  setEncryptionKey,
  resetEncryptionKey,
} from './socket-encryption';

function resolveSocketUrl(): string {
  const apiUrl = resolveApiUrl('');

  try {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return apiUrl.replace(/\/$/, '');
  }
}

const SOCKET_BASE_URL = resolveSocketUrl();

type AuthenticatedSocket = Socket & {
  auth: Record<string, unknown>;
};

const SOCKET_OPTIONS = {
  transports: ['polling', 'websocket'] as string[],
  autoConnect: false,
};

// Lazy socket instances — created on first access to avoid heavy init at module load
let _gamesSocket: AuthenticatedSocket | null = null;
let _chatsSocket: AuthenticatedSocket | null = null;
let _leaderboardsSocket: AuthenticatedSocket | null = null;
let _friendsSock: AuthenticatedSocket | null = null;
let _walletSock: AuthenticatedSocket | null = null;
let _clansSock: AuthenticatedSocket | null = null;

export function getGamesSocket(): AuthenticatedSocket {
  if (!_gamesSocket) {
    _gamesSocket = io(
      `${SOCKET_BASE_URL}/games`,
      SOCKET_OPTIONS,
    ) as AuthenticatedSocket;
    guardEmit(_gamesSocket);
    setupEncryptionKeyHandler(_gamesSocket);
  }
  return _gamesSocket;
}

export function getChatsSocket(): AuthenticatedSocket {
  if (!_chatsSocket) {
    _chatsSocket = io(SOCKET_BASE_URL, SOCKET_OPTIONS) as AuthenticatedSocket;
    guardEmit(_chatsSocket);
  }
  return _chatsSocket;
}

export function getLeaderboardsSocket(): AuthenticatedSocket {
  if (!_leaderboardsSocket) {
    _leaderboardsSocket = io(
      `${SOCKET_BASE_URL}/leaderboards`,
      SOCKET_OPTIONS,
    ) as AuthenticatedSocket;
    guardEmit(_leaderboardsSocket);
  }
  return _leaderboardsSocket;
}

export function getFriendsSock(): AuthenticatedSocket {
  if (!_friendsSock) {
    _friendsSock = io(
      `${SOCKET_BASE_URL}/friends`,
      SOCKET_OPTIONS,
    ) as AuthenticatedSocket;
    guardEmit(_friendsSock);
  }
  return _friendsSock;
}

function getWalletSock(): AuthenticatedSocket {
  if (!_walletSock) {
    // forceNew: give /wallet its own Manager + engine connection. Without it
    // the wallet namespace multiplexes over the shared engine, and a hard
    // server-side kick on a bad wallet token tears down games/chats too
    // (seen as "WebSocket is closed before the connection is established").
    _walletSock = io(`${SOCKET_BASE_URL}/wallet`, {
      transports: ['websocket'],
      autoConnect: false,
      forceNew: true,
    }) as AuthenticatedSocket;
    guardEmit(_walletSock);
  }
  return _walletSock;
}

export function getClansSock(): AuthenticatedSocket {
  if (!_clansSock) {
    _clansSock = io(
      `${SOCKET_BASE_URL}/clans`,
      SOCKET_OPTIONS,
    ) as AuthenticatedSocket;
    guardEmit(_clansSock);
  }
  return _clansSock;
}

// Guard against emit() calls on a socket whose transport was never
// initialised (autoConnect: false + never called connect()).  In that
// state socket.io's _packet() blows up with
// "Cannot read properties of undefined (reading 'write')".
// Swallowing the emit is safe — the data is silently dropped.
//
// We use try-catch rather than checking `socket.connected` because
// E2E mocks (Playwright) override `connected` via defineProperty to
// return `true` even when the underlying engine was never created.
function guardEmit(socket: Socket): void {
  const originalEmit = socket.emit.bind(socket) as (
    event: string,
    payload?: unknown,
    extra?: unknown,
  ) => unknown;
  socket.emit = ((event: string, payload?: unknown, extra?: unknown) => {
    try {
      if (extra === undefined) {
        return originalEmit(event, payload);
      }
      return originalEmit(event, payload, extra);
    } catch {
      return socket;
    }
  }) as Socket['emit'];
}

let currentAuthToken: string | null = null;
let currentAnonId: string | null = null;

/**
 * Message queue for messages waiting on encryption key
 */
type QueuedMessage = { event: string; payload: unknown };
const messageQueue: QueuedMessage[] = [];

/**
 * Process queued messages after encryption key is received
 */
async function flushMessageQueue(): Promise<void> {
  while (messageQueue.length > 0) {
    const msg = messageQueue.shift();
    if (msg) {
      const data = await maybeEncrypt(msg.payload);
      getGamesSocket().emit(msg.event, data);
    }
  }
}

/**
 * Set up encryption key handler for a socket
 */
function setupEncryptionKeyHandler(socket: AuthenticatedSocket): void {
  socket.on('socket.encryption_key', async (data: { key?: string }) => {
    if (!data?.key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[socket] Invalid encryption key data from server');
      }
      return;
    }

    const success = await setEncryptionKey(data.key);
    if (success) {
      await flushMessageQueue();
    }
  });

  socket.on('disconnect', () => {
    resetEncryptionKey();
    messageQueue.length = 0;
  });
}

function applyAuth(socketInstance: AuthenticatedSocket, token: string): void {
  socketInstance.auth = { token };
}

export function connectSockets(token: string | null | undefined): void {
  if (!token) {
    disconnectSockets();
    return;
  }

  currentAnonId = null;

  if (currentAuthToken !== token) {
    currentAuthToken = token;

    if (getGamesSocket().connected) {
      getGamesSocket().disconnect();
    }
    if (getChatsSocket().connected) {
      getChatsSocket().disconnect();
    }
  }

  applyAuth(getGamesSocket(), token);
  applyAuth(getChatsSocket(), token);
  applyAuth(getFriendsSock(), token);
  applyAuth(getClansSock(), token);

  if (!getGamesSocket().connected) {
    getGamesSocket().connect();
  }
  if (!getChatsSocket().connected) {
    getChatsSocket().connect();
  }
  if (!getFriendsSock().connected) {
    getFriendsSock().connect();
  }
  if (!getClansSock().connected) {
    getClansSock().connect();
  }
}

/**
 * Connect the leaderboards namespace socket only when a page that needs it
 * mounts (currently /leaderboards). Auth is applied if a token is provided.
 * Returns a teardown function the caller should run on unmount so we don't
 * leak background pings.
 */
export function connectLeaderboardSocket(
  token: string | null | undefined,
): () => void {
  if (token) applyAuth(getLeaderboardsSocket(), token);
  else getLeaderboardsSocket().auth = {};
  if (!getLeaderboardsSocket().connected) getLeaderboardsSocket().connect();
  return () => {
    if (getLeaderboardsSocket().connected) getLeaderboardsSocket().disconnect();
  };
}

export function connectFriendsSocket(
  token: string | null | undefined,
): () => void {
  if (token) applyAuth(getFriendsSock(), token);
  else getFriendsSock().auth = {};
  if (!getFriendsSock().connected) getFriendsSock().connect();
  return () => {
    if (getFriendsSock().connected) getFriendsSock().disconnect();
  };
}

export function connectWalletSocket(token: string): void {
  getWalletSock().auth = { token };
  if (!getWalletSock().connected) getWalletSock().connect();
}

export function disconnectWalletSocket(): void {
  if (getWalletSock().connected) getWalletSock().disconnect();
}

/**
 * Connect game socket without authentication (for spectating public games)
 * Pass the anonymous userId so the backend sends the encryption key
 */
export function connectSocketsAnonymous(userId?: string): void {
  const targetAnonId = userId || null;

  if (currentAuthToken) {
    disconnectSockets();
  }

  const gamesSock = getGamesSocket();

  if (currentAnonId !== targetAnonId && gamesSock.connected) {
    gamesSock.disconnect();
  }

  currentAnonId = targetAnonId;
  gamesSock.auth = {};

  if (gamesSock.io?.opts) {
    if (targetAnonId) {
      gamesSock.io.opts.query = {
        ...(gamesSock.io.opts.query as Record<string, string>),
        anonId: targetAnonId,
      };
    } else if (gamesSock.io.opts.query) {
      const query = { ...(gamesSock.io.opts.query as Record<string, string>) };
      delete query.anonId;
      gamesSock.io.opts.query = query;
    }
  }

  if (!gamesSock.connected) {
    gamesSock.connect();
  }
}

export function disconnectSockets(): void {
  currentAuthToken = null;
  currentAnonId = null;

  if (_gamesSocket) {
    _gamesSocket.disconnect();
  }
  if (_chatsSocket) {
    _chatsSocket.disconnect();
  }
  if (_leaderboardsSocket) {
    _leaderboardsSocket.disconnect();
  }
  if (_friendsSock) {
    _friendsSock.disconnect();
  }
  if (_walletSock) {
    _walletSock.disconnect();
  }
  if (_clansSock) {
    _clansSock.disconnect();
  }

  if (_gamesSocket) _gamesSocket.auth = {};
  if (_chatsSocket) _chatsSocket.auth = {};
  if (_leaderboardsSocket) _leaderboardsSocket.auth = {};
  if (_friendsSock) _friendsSock.auth = {};
  if (_walletSock) _walletSock.auth = {};
  if (_clansSock) _clansSock.auth = {};
  resetEncryptionKey();
}

// Lazy getters for exported socket references — instantiate on first use
export function getGameSocket(): Socket {
  return getGamesSocket();
}

export function getChatSocket(): Socket {
  return getChatsSocket();
}

export function getLeaderboardSocket(): Socket {
  return getLeaderboardsSocket();
}

export function getFriendsSocketRef(): Socket {
  return getFriendsSock();
}

export function getWalletSocketRef(): Socket {
  return getWalletSock();
}

export function getClansSocketRef(): Socket {
  return getClansSock();
}

// Backward-compatible exports — lazily delegate to actual socket instances

/**
 * Offline game event router (ARC-900). Registered by the offline feature;
 * when it returns true the emit never reaches the network.
 */
let offlineGameRouter:
  ((event: string, payload: Record<string, unknown>) => void) | null = null;

export function setOfflineGameRouter(
  fn: ((event: string, payload: Record<string, unknown>) => void) | null,
): void {
  offlineGameRouter = fn;
}

export function isOfflineRoomId(roomId: string): boolean {
  return roomId.startsWith('offline_');
}

function createLazySocket(getter: () => AuthenticatedSocket): Socket {
  return new Proxy({} as Socket, {
    get(_target, prop, receiver) {
      if (prop === 'emit') {
        return (event: string, payload?: unknown, extra?: unknown) => {
          const record = payload as Record<string, unknown> | undefined;
          if (
            offlineGameRouter &&
            record &&
            typeof record === 'object' &&
            typeof record.roomId === 'string' &&
            isOfflineRoomId(record.roomId)
          ) {
            offlineGameRouter(event, record);
            return true;
          }
          const socket = getter();
          if (!socket) return undefined;
          const bound = Reflect.get(socket, 'emit', receiver) as (
            this: AuthenticatedSocket,
            event: string,
            p?: unknown,
            e?: unknown,
          ) => unknown;
          // Forward the event name AND the args — dropping `event` here
          // turns every emit into emit(payload), which servers and the
          // E2E socket mocks silently swallow (see ARC-900 CI run).
          return typeof bound === 'function'
            ? extra === undefined
              ? bound.call(socket, event, payload)
              : bound.call(socket, event, payload, extra)
            : undefined;
        };
      }
      const socket = getter();
      if (!socket) return undefined;
      const value = Reflect.get(socket, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(socket);
      }
      return value;
    },
    set(_target, prop, value) {
      const socket = getter();
      if (!socket) return false;
      return Reflect.set(socket, prop, value);
    },
  });
}

export const gameSocket: Socket = createLazySocket(getGamesSocket);
export const chatSocket: Socket = createLazySocket(getChatsSocket);
export const leaderboardSocket: Socket = createLazySocket(
  getLeaderboardsSocket,
);
export const friendsSocket: Socket = createLazySocket(getFriendsSock);
export const walletSocket: Socket = createLazySocket(getWalletSock);
export const clansSocket: Socket = createLazySocket(getClansSock);

// Expose sockets to window for E2E testing.
// window.isPlaywright is set by Playwright's addInitScript() before any
// page scripts run, so it's available at module-evaluation time even in
// production builds where NEXT_PUBLIC_E2E isn't inlined.
if (
  typeof window !== 'undefined' &&
  (window as unknown as { isPlaywright?: boolean }).isPlaywright
) {
  const win = window as unknown as Record<string, unknown>;
  win.gameSocket = getGamesSocket();
  win.chatSocket = getChatsSocket();
}

/**
 * Emit a message with optional encryption.
 */
export async function emitEncrypted(
  socket: Socket,
  event: string,
  payload: unknown,
): Promise<void> {
  const data = await maybeEncrypt(payload);
  socket.emit(event, data);
}

export {
  useSocket,
  useChatSocket,
  useLeaderboardSocket,
  useFriendsSocket,
} from './socket-hooks';
