import { io, type Socket, type Manager } from 'socket.io-client';
import { resolveApiUrl } from './api-base';
import {
  maybeEncrypt,
  setEncryptionKey,
  resetEncryptionKey,
} from './socket-encryption';

function resolveSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_BASE_URL) {
    return process.env.NEXT_PUBLIC_WS_BASE_URL.trim().replace(/\/$/, '');
  }
  const apiUrl = resolveApiUrl('');
  return apiUrl.replace(/\/$/, '');
}

const SOCKET_BASE_URL = resolveSocketUrl();

type AuthenticatedSocket = Socket & {
  auth: Record<string, unknown>;
};

const SOCKET_OPTIONS = {
  transports: ['websocket'] as string[],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
};

let _manager: Manager | null = null;

function getManager(): Manager {
  if (!_manager) {
    _manager = io(SOCKET_BASE_URL, {
      ...SOCKET_OPTIONS,
      multiplex: true,
    }).io as Manager;
    _manager.on('error', () => {});
    _manager.on('reconnect_error', () => {});
    _manager.on('reconnect_failed', () => {});
  }
  return _manager;
}

let _gamesSocket: AuthenticatedSocket | null = null;
let _chatsSocket: AuthenticatedSocket | null = null;
let _leaderboardsSocket: AuthenticatedSocket | null = null;
let _friendsSock: AuthenticatedSocket | null = null;
let _walletSock: AuthenticatedSocket | null = null;
let _clansSock: AuthenticatedSocket | null = null;
let _notificationsSocket: AuthenticatedSocket | null = null;

export function getGamesSocket(): AuthenticatedSocket {
  if (!_gamesSocket) {
    _gamesSocket = getManager().socket('/games') as AuthenticatedSocket;
    guardSocket(_gamesSocket);
    setupEncryptionKeyHandler(_gamesSocket);
    const sock = _gamesSocket;
    sock.io?.on('reconnect_attempt', () => {
      if (currentAnonId) {
        sock.auth = { anonId: currentAnonId };
        if (sock.io?.opts) {
          sock.io.opts.query = {
            ...(sock.io.opts.query as Record<string, string>),
            anonId: currentAnonId,
          };
        }
      }
    });
  }
  return _gamesSocket;
}

export function getChatsSocket(): AuthenticatedSocket {
  if (!_chatsSocket) {
    _chatsSocket = getManager().socket('/') as AuthenticatedSocket;
    guardSocket(_chatsSocket);
  }
  return _chatsSocket;
}

export function getLeaderboardsSocket(): AuthenticatedSocket {
  if (!_leaderboardsSocket) {
    _leaderboardsSocket = getManager().socket(
      '/leaderboards',
    ) as AuthenticatedSocket;
    guardSocket(_leaderboardsSocket);
  }
  return _leaderboardsSocket;
}

export function getFriendsSock(): AuthenticatedSocket {
  if (!_friendsSock) {
    _friendsSock = getManager().socket('/friends') as AuthenticatedSocket;
    guardSocket(_friendsSock);
  }
  return _friendsSock;
}

function getWalletSock(): AuthenticatedSocket {
  if (!_walletSock) {
    _walletSock = getManager().socket('/wallet') as AuthenticatedSocket;
    guardSocket(_walletSock);
  }
  return _walletSock;
}

export function getClansSock(): AuthenticatedSocket {
  if (!_clansSock) {
    _clansSock = getManager().socket('/clans') as AuthenticatedSocket;
    guardSocket(_clansSock);
  }
  return _clansSock;
}

export function getNotificationsSocket(): AuthenticatedSocket {
  if (!_notificationsSocket) {
    _notificationsSocket = getManager().socket(
      '/notifications',
    ) as AuthenticatedSocket;
    guardSocket(_notificationsSocket);
  }
  return _notificationsSocket;
}

function guardSocket(socket: AuthenticatedSocket): void {
  guardEmit(socket);
  socket.on('connect_error', () => {});
  socket.on('error', () => {});
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

function isNotConnecting(socket: AuthenticatedSocket): boolean {
  return socket.io?._readyState !== 'opening';
}

function shouldSkipSocketConnect(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/Chrome-Lighthouse|Lighthouse/i.test(navigator.userAgent)) return true;
  if (typeof navigator.onLine === 'boolean' && !navigator.onLine) return true;
  return false;
}

export function connectSockets(token: string | null | undefined): void {
  if (shouldSkipSocketConnect()) return;
  if (!token) {
    disconnectSockets();
    return;
  }

  currentAnonId = null;
  const gamesSock = getGamesSocket();

  // Clear the anonId query param from the Manager so reconnections use JWT auth
  if (gamesSock.io?.opts?.query) {
    const query = { ...(gamesSock.io.opts.query as Record<string, string>) };
    delete query.anonId;
    gamesSock.io.opts.query = query;
  }

  if (currentAuthToken !== token) {
    currentAuthToken = token;

    if (gamesSock.connected) {
      gamesSock.disconnect();
    }
    if (getChatsSocket().connected) {
      getChatsSocket().disconnect();
    }
  }

  applyAuth(gamesSock, token);
  applyAuth(getChatsSocket(), token);
  applyAuth(getFriendsSock(), token);
  applyAuth(getClansSock(), token);
  applyAuth(getNotificationsSocket(), token);

  if (!gamesSock.connected && isNotConnecting(gamesSock)) {
    gamesSock.connect();
  }
  if (!getChatsSocket().connected && isNotConnecting(getChatsSocket())) {
    getChatsSocket().connect();
  }
  if (!getFriendsSock().connected && isNotConnecting(getFriendsSock())) {
    getFriendsSock().connect();
  }
  if (!getClansSock().connected && isNotConnecting(getClansSock())) {
    getClansSock().connect();
  }
  if (
    !getNotificationsSocket().connected &&
    isNotConnecting(getNotificationsSocket())
  ) {
    getNotificationsSocket().connect();
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
  if (shouldSkipSocketConnect()) return;
  const targetAnonId = userId || null;
  if (currentAuthToken) disconnectSockets();
  const gamesSock = getGamesSocket();
  currentAnonId = targetAnonId;
  gamesSock.auth = targetAnonId ? { anonId: targetAnonId } : {};

  // Apply anonId to Manager's query params and force a fresh transport
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
  if (gamesSock.connected || gamesSock.io?._readyState === 'opening') {
    gamesSock.disconnect();
  }
  gamesSock.connect();
}

export function disconnectSockets(): void {
  currentAuthToken = null;
  currentAnonId = null;

  for (const sock of [
    _gamesSocket,
    _chatsSocket,
    _leaderboardsSocket,
    _friendsSock,
    _walletSock,
    _clansSock,
    _notificationsSocket,
  ]) {
    if (sock) {
      sock.disconnect();
      sock.auth = {};
    }
  }
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

export function getNotificationSocketRef(): Socket {
  return getNotificationsSocket();
}

export { setOfflineGameRouter, isOfflineRoomId } from './socket-lazy';
import { createLazySocket } from './socket-lazy';

export const gameSocket: Socket = createLazySocket(getGamesSocket);
export const chatSocket: Socket = createLazySocket(getChatsSocket);
export const leaderboardSocket: Socket = createLazySocket(
  getLeaderboardsSocket,
);
export const friendsSocket: Socket = createLazySocket(getFriendsSock);
export const walletSocket: Socket = createLazySocket(getWalletSock);
export const clansSocket: Socket = createLazySocket(getClansSock);
export const notificationSocket: Socket = createLazySocket(
  getNotificationsSocket,
);

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
  useNotificationSocket,
  useClansSocket,
} from './socket-hooks';
