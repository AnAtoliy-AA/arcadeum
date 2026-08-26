import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import * as encryption from './socket-encryption';
import { renderHook, waitFor } from '@testing-library/react';

const { mockSocket, rawEmit } = vi.hoisted(() => {
  const rawEmit = vi.fn();
  return {
    mockSocket: {
      connected: false,
      connect: vi.fn().mockImplementation(function (this: {
        connected: boolean;
      }) {
        this.connected = true;
        return this;
      }),
      disconnect: vi.fn().mockImplementation(function (this: {
        connected: boolean;
      }) {
        this.connected = false;
        return this;
      }),
      on: vi.fn(),
      off: vi.fn(),
      emit: rawEmit,
      auth: {},
      io: {
        on: vi.fn(),
      },
    },
    rawEmit,
  };
});

vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => mockSocket),
  };
});

// Now import the module being tested
import {
  connectSockets,
  connectSocketsAnonymous,
  connectLeaderboardSocket,
  connectWalletSocket,
  disconnectSockets,
  emitEncrypted,
  useSocket,
  useChatSocket,
  gameSocket,
  setOfflineGameRouter,
} from './socket';

// Trigger lazy socket initialization so encryption handlers are registered
connectSockets('init-trigger');
disconnectSockets();

// Capture the encryption handlers registered during lazy init
// (setupEncryptionKeyHandler is called once per socket lifetime)
const encryptionKeyHandler = (mockSocket.on as unknown as Mock).mock.calls.find(
  (call: unknown[]) => call[0] === 'socket.encryption_key',
)?.[1];
const disconnectHandler = (mockSocket.on as unknown as Mock).mock.calls.find(
  (call: unknown[]) => call[0] === 'disconnect',
)?.[1];

describe('socket', () => {
  beforeEach(() => {
    mockSocket.connected = false;
    mockSocket.auth = {};
    // Only clear call counts for mocks that change between tests.
    // Do NOT touch mockSocket.on / mockSocket.off / mockSocket.io.on —
    // those hold encryption handler registrations from setupEncryptionKeyHandler
    // that need to survive across tests.
    (mockSocket.connect as unknown as Mock).mockClear();
    (mockSocket.disconnect as unknown as Mock).mockClear();
    rawEmit.mockClear();
    (mockSocket.off as unknown as Mock).mockClear();
    (mockSocket.io.on as unknown as Mock).mockClear();
    // Re-trigger lazy init (no-op if already initialized, but resets auth state)
    connectSockets('reinit-trigger');
  });

  it('connects sockets with token', () => {
    connectSockets('test-token');
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({ token: 'test-token' });
  });

  it('disconnects sockets', () => {
    mockSocket.connected = true;
    disconnectSockets();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({});
  });

  it('emits encrypted messages', async () => {
    vi.spyOn(encryption, 'maybeEncrypt').mockResolvedValue(
      'encrypted-data' as unknown as Uint8Array,
    );
    mockSocket.connected = true;
    await emitEncrypted(mockSocket as unknown as Socket, 'test-event', {
      foo: 'bar',
    });
    expect(encryption.maybeEncrypt).toHaveBeenCalledWith({ foo: 'bar' });
    expect(rawEmit).toHaveBeenCalledWith('test-event', 'encrypted-data');
  });

  it('handles encryption key from server', async () => {
    expect(encryptionKeyHandler).toBeDefined();

    const setKeySpy = vi
      .spyOn(encryption, 'setEncryptionKey')
      .mockResolvedValue(true);

    await encryptionKeyHandler({ key: 'new-server-key' });

    expect(setKeySpy).toHaveBeenCalledWith('new-server-key');
  });

  it('connects sockets anonymously', () => {
    connectSocketsAnonymous();
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({});
  });

  it('handles invalid encryption key from server', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await encryptionKeyHandler(null);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid encryption key'),
    );

    consoleSpy.mockRestore();
  });

  it('connects sockets anonymously after auth', () => {
    connectSockets('token');
    expect(mockSocket.auth).toEqual({ token: 'token' });

    // Reset mocks to track new calls
    vi.clearAllMocks();

    connectSocketsAnonymous();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({});
  });

  it('disconnects games + chat + leaderboards + friends + wallet sockets when connected', () => {
    // Initialize all 5 lazy socket instances
    connectSockets('init-all');
    connectLeaderboardSocket('init-all');
    connectWalletSocket('init-all');
    // Reset mock state for clean assertions
    mockSocket.connected = true;
    (mockSocket.disconnect as unknown as Mock).mockClear();

    disconnectSockets();

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(6);

    // Restore default behavior
    (mockSocket.disconnect as unknown as Mock).mockImplementation(
      function (this: { connected: boolean }) {
        this.connected = false;
        return this;
      },
    );
  });

  it('creates the wallet socket on its own manager so wallet failures cannot tear down games/chats', () => {
    const ioMock = vi.mocked(io);
    const walletCall = ioMock.mock.calls.find((c: unknown[]) =>
      String(c[0]).endsWith('/wallet'),
    );
    expect(walletCall).toBeDefined();
    expect(walletCall![1]).toMatchObject({
      forceNew: true,
      transports: ['websocket'],
      autoConnect: false,
    });
  });

  it('ignores invalid payload structures', () => {
    // Trigger a listener that processes payload
    // We need to simulate a message listener being registered
    renderHook(() => useSocket('test_event', vi.fn()));

    // Find the listener registered by useSocket
    // mockSocket.on was called with 'test_event'
    const call = (mockSocket.on as unknown as Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'test_event',
    );
    expect(call).toBeDefined();
    const listener = call![1];

    // Call with invalid payload (not object, or missing iv/data)
    listener('invalid string');
    listener({ data: 'missing iv' });
    listener({ iv: 'missing data' });

    // Expect no errors, basically ensuring safe handling
    expect(true).toBe(true);
  });

  it('handles disconnect and resets encryption', () => {
    expect(disconnectHandler).toBeDefined();

    const resetSpy = vi.spyOn(encryption, 'resetEncryptionKey');
    disconnectHandler();

    expect(resetSpy).toHaveBeenCalled();
  });
});

describe('lazy socket proxy (ARC-900)', () => {
  it('forwards the event name and payload through the proxy emit', () => {
    rawEmit.mockClear();
    const payload = { roomId: 'room-1', userId: 'u1', botCount: 3 };

    gameSocket.emit('games.session.start', payload);

    // Regression: the lazy proxy previously dropped the event name and
    // called emit(payload) — servers and E2E mocks silently swallowed it.
    expect(rawEmit).toHaveBeenCalledWith('games.session.start', payload);
  });

  it('keeps extra emit arguments intact', () => {
    rawEmit.mockClear();

    gameSocket.emit('games.room.join', { roomId: 'r2' }, 'extra');

    expect(rawEmit).toHaveBeenCalledWith(
      'games.room.join',
      { roomId: 'r2' },
      'extra',
    );
  });

  it('routes offline room emits to the offline router without network', () => {
    rawEmit.mockClear();
    const router = vi.fn();
    setOfflineGameRouter(
      router as unknown as (
        event: string,
        payload: Record<string, unknown>,
      ) => void,
    );

    try {
      const payload = { roomId: 'offline_chess_abc', userId: 'u1' };
      gameSocket.emit('games.session.move', payload);

      expect(router).toHaveBeenCalledWith('games.session.move', payload);
      expect(rawEmit).not.toHaveBeenCalledWith('games.session.move', payload);
    } finally {
      setOfflineGameRouter(null);
    }
  });

  it('still emits online-room payloads to the real socket', () => {
    rawEmit.mockClear();
    const router = vi.fn();
    setOfflineGameRouter(
      router as unknown as (
        event: string,
        payload: Record<string, unknown>,
      ) => void,
    );

    try {
      const payload = { roomId: '507f191e810c19729de860ea', userId: 'u1' };
      gameSocket.emit('games.session.draw', payload);

      expect(router).not.toHaveBeenCalled();
      expect(rawEmit).toHaveBeenCalledWith('games.session.draw', payload);
    } finally {
      setOfflineGameRouter(null);
    }
  });
});

describe('socket hooks', () => {
  it('useSocket sets up and tears down listener', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useSocket('test-event', handler));

    expect(mockSocket.on).toHaveBeenCalledWith(
      'test-event',
      expect.any(Function),
    );

    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith(
      'test-event',
      expect.any(Function),
    );
  });

  it('useSocket handler decrypts messages if enabled', async () => {
    const handler = vi.fn();
    renderHook(() => useSocket('test-event', handler));

    // Find the most recent 'test-event' listener
    const listener = (mockSocket.on as unknown as Mock).mock.calls.findLast(
      (c: unknown[]) => c[0] === 'test-event',
    )?.[1];

    expect(listener).toBeDefined();

    vi.spyOn(encryption, 'isSocketEncryptionEnabled').mockReturnValue(true);
    vi.spyOn(encryption, 'hasEncryptionKey').mockReturnValue(true);
    vi.spyOn(encryption, 'maybeDecrypt').mockResolvedValue({
      decoded: 'data',
    });

    await listener('encrypted-payload');

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith({ decoded: 'data' });
    });
  });

  it('useChatSocket sets up and tears down listener', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useChatSocket('chat-event', handler));

    expect(mockSocket.on).toHaveBeenCalledWith(
      'chat-event',
      expect.any(Function),
    );

    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith(
      'chat-event',
      expect.any(Function),
    );
  });

  it('useChatSocket handler decrypts messages if enabled', async () => {
    const handler = vi.fn();
    renderHook(() => useChatSocket('chat-event', handler));

    // Find the most recent 'chat-event' listener
    const listener = (mockSocket.on as unknown as Mock).mock.calls.findLast(
      (c: unknown[]) => c[0] === 'chat-event',
    )?.[1];

    expect(listener).toBeDefined();

    vi.spyOn(encryption, 'isSocketEncryptionEnabled').mockReturnValue(true);
    vi.spyOn(encryption, 'hasEncryptionKey').mockReturnValue(true);
    vi.spyOn(encryption, 'maybeDecrypt').mockResolvedValue({
      chat: 'msg',
    });

    await listener('encrypted-chat-payload');

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith({ chat: 'msg' });
    });
  });

  it('useChatSocket handler passes through unencrypted messages', async () => {
    const handler = vi.fn();
    renderHook(() => useChatSocket('chat-event', handler));

    const listener = (mockSocket.on as unknown as Mock).mock.calls.findLast(
      (c: unknown[]) => c[0] === 'chat-event',
    )?.[1];

    expect(listener).toBeDefined();

    vi.spyOn(encryption, 'isSocketEncryptionEnabled').mockReturnValue(false);

    await listener('plain-message');

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith('plain-message');
    });
  });
});
